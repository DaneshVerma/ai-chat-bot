const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateResult(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  return response.text;
}

async function generateStreamResponse(prompt, callBaclkFn) {
  const response = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  for await (const chunks of response) {
    callBaclkFn(chunks.text);
  }
}

module.exports = {
  generateResult,
  generateStreamResponse,
};
