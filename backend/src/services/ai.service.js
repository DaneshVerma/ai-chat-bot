const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");


const ai = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateResult(prompt) {
  await ai.invoke(prompt).then((res) => {
    return res.text;
  });
}

async function generateStream(prompt, onData) {
  const stream = await ai.stream(prompt, {
    systemInstruction: `
        give response in less than 50 words and in plain text format not in md
    `,
  });

  let result = "";

  for await (const chunk of stream) {
    result += chunk.text;
    onData(chunk.text);
  }

  return result;
}

module.exports = {
  generateResult,
  generateStream,
};
