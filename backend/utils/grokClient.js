const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const invokeGrok = async (prompt) => {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content;
};

module.exports = { invokeGrok };