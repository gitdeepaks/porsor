import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { firecrawl } from "@/lib/fiewcrawl";
import { inngest } from "./client";

const URL_REGEX = /https?:\/\/[^\s]+/g;

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({ event, step }) => {
    const { prompt } = event.data as { prompt?: string };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return await step.run("validate-prompt", async () => {
        return {
          error: "Prompt is required and must be a non-empty string",
          skipped: true,
        };
      });
    }

    const urls = (await step.run("extract-urls", async () => {
      return (prompt.match(URL_REGEX) ?? []) as string[];
    })) as string[];

    const scrapedContent = await step.run("scrape-urls", async () => {
      const results = await Promise.all(
        urls.map(async (url) => {
          const result = await firecrawl.scrape(url, {
            formats: ["markdown"],
          });
          return result.markdown ?? null;
        }),
      );
      return results.filter(Boolean).join("\n\n");
    });

    const finalPrompt = scrapedContent
      ? `Context:\n${scrapedContent}\n\nQuestion:\n${prompt}`
      : prompt;

    await step.run("generate-text", async () => {
      return await generateText({
        model: anthropic("claude-3-haiku-20240307"),
        prompt: finalPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      });
    });
  },
);

export const demoError = inngest.createFunction(
  { id: "demo-error" },
  { event: "demo/error" },
  async ({ step }) => {
    await step.run("fail", async () => {
      throw new Error("INNGESTERROR:Something went wrong");
    });
  },
);
