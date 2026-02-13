const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function summarizeNote(text) {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `Summarize the following note in 3–5 short bullet points:\n\n${text}`,
    });

    return response.output_text;
  } catch (err) {
    console.error("OpenAI error:", err);
    throw err;
  }
}

module.exports = summarizeNote;
