import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

const requestSchema = z.object({
  conversationId: z.string(),
  message: z.string(),
});

export const POST = async (request: Request) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  const internalKey = process.env.CONVEX_INTERNAL_KEY;
  if (!internalKey) {
    return NextResponse.json(
      { error: "Internal key not configured" },
      {
        status: 500,
      },
    );
  }

  try {
    const body = await request.json();
    const { conversationId, message } = requestSchema.parse(body);

    // Call the convex  mutation, query

    const conversaton = await convex.query(api.system.getConversationById, {
      internalKey,
      conversationId: conversationId as Id<"conversations">,
    });

    if (!conversaton) {
      return NextResponse.json(
        { error: "Conversation not found" },
        {
          status: 404,
        },
      );
    }
    const projectId = conversaton.projectsId;

    //TODO: Check for processing messages
    await convex.mutation(api.system.createMessage, {
      internalKey,
      conversationId: conversationId as Id<"conversations">,
      projectId: projectId as Id<"projects">,
      role: "user",
      content: message,
    });

    const assistantMessageId = await convex.mutation(api.system.createMessage, {
      internalKey,
      conversationId: conversationId as Id<"conversations">,
      projectId: projectId as Id<"projects">,
      role: "assistant",
      content: "",
      status: "precessing",
    });

    //TODO: Invoke the backgorund jobs
    const event = await inngest.send({
      name: "messages/sent",
      data: {
        messageId: assistantMessageId,
      },
    });

    return NextResponse.json({
      success: true,
      eventId: event.ids[0],
      messageId: assistantMessageId,
    });
  } catch (error) {
    console.error("Error in messages API route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      {
        status: 500,
      },
    );
  }
};
