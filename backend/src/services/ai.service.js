const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { tool } = require("@langchain/core/tools");
const { tavily } = require("@tavily/core");
const { z } = require("zod");
const { StateGraph, MessagesAnnotation } = require("@langchain/langgraph");
const { ToolMessage, isAIMessage } = require("@langchain/core/messages");

const ai = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GEMINI_API_KEY,
});

const searchTool = tool(
  async ({ input = "" }) => {
    const search = tavily({
      apiKey: process.env.TAVILY_API_KEY,
    });
    const result = await search.search(input);
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
      tool_call_id: toolCall.id,
      name: toolCall.name,
      content: JSON.stringify(toolResult),
    });
    return { messages: [...state.messages, toolMessage] };
  })
  .addEdge("__start__", "ai")
  .addEdge("Tool", "ai")
  .addConditionalEdges("ai", async (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      return "Tool";
    }
    // If no tool calls, we're done
    return "__end__";
  });

const agent = graph.compile();

async function generateResult(prompt) {
  await agent.invoke(prompt).then((res) => {
    console.log("Agent invoke result:", res);
  });
}

async function generateStream(prompt, onData) {
  const stream = await agent.stream(prompt, { streamMode: "messages" });

  let result = "";
  for await (const chunk of stream) {
    console.log("Streaming text chunk:", chunk);
    // Only process AI messages that have content
    if (chunk && chunk[0] && isAIMessage(chunk[0])) {
      const content = chunk[0].content;
      if (content && typeof content === "string") {
        result += content;
        onData(content);
      }
    }
  }
  return result;
}

module.exports = {
  generateResult,
  generateStream,
};
