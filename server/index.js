import dotenv from "dotenv";
dotenv.config({ path: new URL(".env", import.meta.url) });
import express from "express";
import cors from "cors";
import transcribeRouter from "./routes/transcribe.js";
import parseRouter from "./routes/parse.js";

const requiredKeys = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"];
const missing = requiredKeys.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}\n` +
      "Copy server/.env.example to server/.env and fill in your keys."
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/transcribe", transcribeRouter);

app.use("/api/parse", parseRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
