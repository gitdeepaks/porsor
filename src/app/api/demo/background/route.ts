import { inngest } from "@/inngest/client";

export async function POST(request: Request) {
  let body: { prompt?: string } = {};

  try {
    body = await request.json();
  } catch {
    // If body is empty or invalid JSON, use empty object
  }

  const { prompt } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return Response.json(
      { error: "Prompt is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  await inngest.send({
    name: "demo/generate",
    data: { prompt },
  });

  return Response.json({ status: "started" });
}
