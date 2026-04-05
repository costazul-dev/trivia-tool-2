import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

let anthropic;
function getClient() {
  if (!anthropic) anthropic = new Anthropic();
  return anthropic;
}

function buildPrompt(transcript, round, existingTeams) {
  let prompt = `Extract team names and scores from this trivia transcript. Return ONLY a JSON array of objects with "name" (string) and "score" (number) fields. No markdown, no explanation, just the JSON array.

Transcript: "${transcript}"`;

  if (round === 2 && existingTeams?.length) {
    prompt += `

This is Round 2. Match each dictated team name to the closest existing team name from this list: ${JSON.stringify(existingTeams)}
Use the existing team name exactly as written in the list, even if the transcript says it slightly differently.`;
  }

  return prompt;
}

router.post("/", async (req, res) => {
  const { transcript, round, existingTeams } = req.body;

  if (!transcript || typeof transcript !== "string") {
    return res.status(400).json({ error: "transcript is required and must be a string" });
  }

  if (!round || typeof round !== "number") {
    return res.status(400).json({ error: "round is required and must be a number" });
  }

  try {
    const message = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        { role: "user", content: buildPrompt(transcript, round, existingTeams) },
      ],
    });

    const raw = message.content[0].text.trim();
    const text = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed) || !parsed.every((e) => typeof e.name === "string" && typeof e.score === "number")) {
      return res.status(502).json({ error: "Unexpected response format from Claude" });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Parse failed:", err.message);
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: "Claude returned invalid JSON" });
    }
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

export default router;
