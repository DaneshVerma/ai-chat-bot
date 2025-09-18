const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { tool } = require("@langchain/core/tools");
const { tavily } = require("@tavily/core");
const { z } = require("zod");

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

const searchTool = tool(
  async ({ input = "" }) => {
    const result = await tavily.search(input);
    return result.results;
  },
  {
    name: "serachTool",
    description:
      "useful for when you need to answer questions about current events or the state of the world. Input should be a fully formed question.",
    schema: z.object({
      input: z.string().min(1),
    }),
  }
);

module.exports = {
  generateResult,
  generateStream,
};
