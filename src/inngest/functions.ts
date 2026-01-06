import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { inngest } from "./client";

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({ step }) => {
    await step.run("generate-text", async () => {
      return await generateText({
        model: anthropic("claude-3-haiku-20240307"),
        prompt:
          "What is convex database, is it good with React and React Native ? ",
      });
    });
  },
);
