import { anthropic } from "@ai-sdk/anthropic";
import { auth } from "@clerk/nextjs/server";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { firecrawl } from "@/lib/fiewcrawl";

const quickEditSchema = z.object({
  editCode: z
    .string()
    .describe(
      "The edit code version of the slected code based on the instruvtion",
    ),
});

const URL_REGEX = /https?:\/\/[^\s]+/g;

const QUICK_EDIT_PROMPT = `You are a code editing assistant. Edit the selected code based on the user's instruction.

<context>
<selected_code>
{selectedCode}
</selected_code>
<full_code_context>
{fullCode}
</full_code_context>
</context>

{documentation}

<instruction>
{instruction}
</instruction>

<instructions>
Return ONLY the edited version of the selected code.
Maintain the same indentation level as the original.
Do not include any explanations or comments unless requested.
If the instruction is unclear or cannot be applied, return the original code unchanged.
</instructions>`;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const { selectedCode, fullCode, instruction } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!selectedCode) {
      return NextResponse.json(
        { error: "Selected code is required" },
        { status: 400 },
      );
    }

    if (!instruction) {
      return NextResponse.json(
        { error: "Instruction is required" },
        { status: 400 },
      );
    }

    const urls = instruction.match(URL_REGEX) ?? [];

    let documentationContext = "";
    if (urls.length > 0) {
      const scrapedContent = await Promise.all(
        urls.map(async (url: string) => {
          try {
            const result = await firecrawl.scrape(url, {
              formats: ["markdown"],
            });
            if (result.markdown) {
              return `<doc url="${url}">${result.markdown}</doc>`;
            }
            return null;
          } catch {
            return null;
          }
        }),
      );

      const validResults = scrapedContent.filter(Boolean);

      if (validResults.length > 0) {
        documentationContext = `<documentation>\n${validResults.join("\n\n")}\n</documentation>`;
      }
    }
    const prompt = QUICK_EDIT_PROMPT.replace("{selectedCode}", selectedCode)
      .replace("{fullCode}", fullCode || "")
      .replace("{instruction}", instruction)
      .replace("{documentation}", documentationContext);

    const { output } = await generateText({
      model: anthropic("claude-opus-4-0"),
      output: Output.object({ schema: quickEditSchema }),
      prompt,
    });
    return NextResponse.json({ editCode: output.editCode });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate quick edit" },
      { status: 500 },
    );
  }
}
