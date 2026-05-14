const express = require("express");
const { StatusCodes } = require("http-status-codes");
const { authenticate } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { ApiError } = require("../utils/api-error");

const router = express.Router();

const SYSTEM_PROMPT = `You are a Kosovo travel expert. Respond ONLY in this exact JSON format with no markdown, no explanation, no code blocks, just raw JSON:
{"days":[{"day":1,"title":"string","morning":{"location":"string","description":"string"},"afternoon":{"location":"string","description":"string"},"evening":{"location":"string","description":"string"},"tip":"string"}]}`;

router.post(
  "/messages",
  authenticate,
  asyncHandler(async (req, res) => {
    const { days, city, interests, style } = req.body || {};

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, "OpenAI API key is not configured on the server.");
    }

    const userPrompt =
      `Plan a ${days}-day trip to Kosovo. Staying in ${city}. ` +
      `Interests: ${interests}. Style: ${style}. Only real places in Kosovo.`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const openaiData = await openaiRes.json();

    if (!openaiRes.ok || openaiData.error) {
      const upstreamMessage = openaiData.error?.message || `OpenAI upstream returned ${openaiRes.status}.`;
      throw new ApiError(StatusCodes.BAD_GATEWAY, upstreamMessage);
    }

    const text = openaiData.choices?.[0]?.message?.content ?? "";
    if (!text) {
      throw new ApiError(StatusCodes.BAD_GATEWAY, "OpenAI returned an empty response.");
    }

    const cleanedText = text
      .replace(/^\s*```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    res.status(200).json({ content: [{ text: cleanedText }] });
  })
);

module.exports = router;
