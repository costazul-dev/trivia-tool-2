import { Router } from "express";
import multer from "multer";
import OpenAI from "openai";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

let openai;
function getClient() {
  if (!openai) openai = new OpenAI();
  return openai;
}

router.post("/", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file provided" });
  }

  try {
    const file = new File([req.file.buffer], req.file.originalname, {
      type: req.file.mimetype,
    });

    const { text } = await getClient().audio.transcriptions.create({
      model: "whisper-1",
      file,
    });

    res.json({ transcript: text });
  } catch (err) {
    console.error("Transcription failed:", err.message);
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

export default router;
