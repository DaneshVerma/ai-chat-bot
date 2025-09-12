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
  const stream = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  let responsetext = "";
  for await (const chunks of stream) {
    responsetext += chunks.text;
    callBaclkFn(chunks.text);
  }
  return responsetext;
}

module.exports = {
  generateResult,
  generateStreamResponse,
};
