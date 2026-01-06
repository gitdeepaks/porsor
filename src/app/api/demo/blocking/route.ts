import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export async function POST() {
  const model = anthropic("claude-3-haiku-20240307");

  const response = await generateText({
    model: model,
    prompt: "Write a vegetarian lasagna recipe for 4 people.",
  });

  return Response.json({ response });
}
