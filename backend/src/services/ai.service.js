const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { tool } = require("@langchain/core/tools");
const { tavily } = require("@tavily/core");
const { z } = require("zod");
const { StateGraph, MessagesAnnotation } = require("@langchain/langgraph");
const { ToolMessage } = require("@langchain/core/messages");

const ai = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GEMINI_API_KEY,
});

const searchTool = tool(
  async ({ input = "" }) => {
    console.log(input);
    const search = tavily({
      apiKey: process.env.TAVILY_API_KEY,
    });
    const result = await search.search(input);
    console.log(result);
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

const graph = new StateGraph(MessagesAnnotation)
  .addNode("ai", async (state) => {
    const modelWIthToolBind = ai.bindTools([searchTool]);
    const response = await modelWIthToolBind.invoke(state.messages);
    return { messages: [response] };
  })
  .addNode("Tool", async (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage.tool_calls.length === 0) return state;
    const toolCall = lastMessage.tool_calls[0];
    const toolResult = await searchTool.invoke(toolCall.args);
    const toolMessage = new ToolMessage({
      name: toolCall.name,
      content: JSON.stringify(toolResult),
    });
    return { messages: [...state.messages, toolMessage] };
  })
  .addEdge("__start__", "ai")
  .addEdge("Tool", "ai")
  .addConditionalEdges("ai", async (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    return lastMessage.tool_calls.length > 0 ? "Tool" : "__end__";
  });

const agent = graph.compile();

async function generateResult(prompt) {
  await agent.invoke(prompt).then((res) => {
    return res.messages[0];
  });
}

async function generateStream(prompt, onData) {
  const stream = await agent.stream(prompt, { streamMode: "messages" });
  let result = "";
  for await (const chunk of stream) {
    result += chunk[0].text;
    onData(chunk[0].text);
  }
  return result;
}

module.exports = {
  generateResult,
  generateStream,
};
