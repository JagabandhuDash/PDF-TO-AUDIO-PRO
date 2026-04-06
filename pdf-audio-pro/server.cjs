const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse-new");
const gtts = require("node-gtts");
const PDFDocument = require("pdfkit");
const { createWorker } = require("tesseract.js");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ─── Upload Config ─────────────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const pdfUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"), false);
    }
    cb(null, true);
  },
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/tiff", "image/bmp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed (JPG, PNG, WEBP, TIFF, BMP)"), false);
    }
    cb(null, true);
  },
});

// ─── Helper: Cleanup temp files ────────────────────────────────────────────────
function cleanupFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.warn("Cleanup failed:", e.message);
  }
}

// ─── Shared PDF→Audio handler (used by both routes) ───────────────────────────
async function handlePdfToAudio(req, res) {
  const uploadedPath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF file uploaded." });

    const lang = req.body.lang || "en";
   const dataBuffer = fs.readFileSync(uploadedPath);
    const parsed = await pdfParse(dataBuffer); // Use pdfParse directly again
    const text = parsed.text.trim();
    if (!text || text.length < 5) {
      return res.status(400).json({
        error: "No readable text found. The PDF may be image-based — try the OCR feature first.",
      });
    }

    const safeText = text.length > 5000 ? text.slice(0, 5000) + "..." : text;
    const tts = gtts(lang);
    const audioPath = path.join(UPLOAD_DIR, `audio-${Date.now()}.mp3`);

    tts.save(audioPath, safeText, (err) => {
      if (err) {
        console.error("TTS Error:", err);
        cleanupFile(uploadedPath);
        return res.status(500).json({ error: "Failed to generate audio. Please try again." });
      }

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Disposition", 'inline; filename="converted_audio.mp3"');

      const audioStream = fs.createReadStream(audioPath);
      audioStream.pipe(res);
      audioStream.on("end", () => { cleanupFile(audioPath); cleanupFile(uploadedPath); });
      audioStream.on("error", () => { cleanupFile(audioPath); cleanupFile(uploadedPath); });
    });
  } catch (err) {
    console.error("PDF-to-Audio Error:", err);
    cleanupFile(uploadedPath);
    res.status(500).json({ error: "An error occurred while processing the PDF." });
  }
}

// ─── Route: Home ───────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── Route 1: PDF → Audio (original) ─────────────────────────────────────────
app.post("/convert/pdf-to-audio", pdfUpload.single("pdfFile"), handlePdfToAudio);

// ─── Route 1b: /api/convert alias (React frontend) ────────────────────────────
app.post("/api/convert", pdfUpload.single("pdfFile"), handlePdfToAudio);

// ─── Route 2: Text → PDF ───────────────────────────────────────────────────────
app.post("/convert/text-to-pdf", (req, res) => {
  try {
    const { text, fontSize, fontFamily, title, lineSpacing } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "No text provided." });
    }

    const doc = new PDFDocument({
      margin: 60,
      info: {
        Title: title || "Generated Document",
        Author: "PDF Audio Pro",
        CreationDate: new Date(),
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${(title || "document").replace(/\s+/g, "_")}.pdf"`);
    doc.pipe(res);

    if (title && title.trim()) {
      doc
        .font("Helvetica-Bold")
        .fontSize(parseInt(fontSize || 12) + 6)
        .text(title.trim(), { align: "center" });
      doc.moveDown(1.5);
    }

    const selectedFont =
      fontFamily === "serif" ? "Times-Roman" :
      fontFamily === "mono"  ? "Courier" :
                               "Helvetica";

    doc
      .font(selectedFont)
      .fontSize(parseInt(fontSize) || 12)
      .lineGap(parseFloat(lineSpacing) || 4)
      .text(text.trim(), { align: "left", paragraphGap: 10 });

    doc.end();
  } catch (err) {
    console.error("Text-to-PDF Error:", err);
    res.status(500).json({ error: "Failed to generate PDF." });
  }
});

// ─── Route 3: OCR ──────────────────────────────────────────────
app.post("/convert/ocr", imageUpload.single("imageFile"), async (req, res) => {
  const uploadedPath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ error: "No image file uploaded." });

    const ocrLang = req.body.ocrLang || "eng";
    const worker = await createWorker(ocrLang, 1, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const { data } = await worker.recognize(uploadedPath);
    await worker.terminate();
    cleanupFile(uploadedPath);

    res.json({
      text: data.text,
      confidence: Math.round(data.confidence),
      wordCount: data.text.trim().split(/\s+/).filter(Boolean).length,
    });
  } catch (err) {
    console.error("OCR Error:", err);
    cleanupFile(uploadedPath);
    res.status(500).json({ error: "OCR failed. Ensure the image is clear and try again." });
  }
});

// ─── Route 4: Text → Audio ─────────────────────────────────────────────────────
app.post("/convert/text-to-audio", async (req, res) => {
  try {
    const { text, lang = "en" } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "No text provided." });
    }

    const safeText = text.length > 5000 ? text.slice(0, 5000) + "..." : text;
    const tts = gtts(lang);
    const audioPath = path.join(UPLOAD_DIR, `text-audio-${Date.now()}.mp3`);

    tts.save(audioPath, safeText, (err) => {
      if (err) {
        console.error("TTS Error:", err);
        return res.status(500).json({ error: "Failed to generate audio." });
      }

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Disposition", 'attachment; filename="text_to_audio.mp3"');

      const audioStream = fs.createReadStream(audioPath);
      audioStream.pipe(res);
      audioStream.on("end", () => cleanupFile(audioPath));
      audioStream.on("error", () => cleanupFile(audioPath));
    });
  } catch (err) {
    console.error("Text-to-Audio Error:", err);
    res.status(500).json({ error: "An error occurred during conversion." });
  }
});

// ─── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ PDF Audio Pro running on http://localhost:${PORT}`);
  console.log(`   Features: PDF→Audio | Text→PDF | OCR`);
});
