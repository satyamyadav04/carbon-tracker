const axios = require("axios");

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.0-flash";

const invokeGemini = async (prompt, options = {}) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const response = await axios.post(
      `${endpoint}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxOutputTokens || 512,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return (
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated"
    );
  } catch (error) {
    console.error(
      "GEMINI ERROR:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  invokeGemini,
};