import { NonRetriableError } from "inngest";
import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

interface MessageEventData {
  messageId: Id<"messages">;
  conversationId: Id<"conversations">;
  projectId: Id<"projects">;
  message: string;
}

export const processMessage = inngest.createFunction(
  {
    id: "process-message",
    cancelOn: [
      {
        event: "messages/cancel",
        if: "event.data.messageId === async.data.messageId",
      },
    ],
    onFailure: async ({ event, step }) => {
      const { messageId } = event.data.event.data as MessageEventData;
      const internalKey = process.env.CONVEX_INTERNAL_KEY;

      // Update the message status with error content
      if (internalKey) {
        await step.run("update-message-on-failure", async () => {
          await convex.mutation(api.system.updateMessageContent, {
            internalKey,
            messageId,
            content:
              "My apologies, I encountered an error while processing your message. lLet me know if you need help.",
          });
        });
      }
    },
  },
  {
    event: "messages/sent",
  },
  async ({ event, step }) => {
    const { messageId } = event.data as MessageEventData;

    const internalKey = process.env.CONVEX_INTERNAL_KEY;

    if (!internalKey) {
      throw new NonRetriableError("CONVEX_INTERNAL_KEY is not configured");
    }

    await step.sleep("wait-for-ai-processing", "5s");
    await step.run("update-message-content", async () => {
      return await convex.mutation(api.system.updateMessageContent, {
        internalKey,
        messageId,
        content: "AI is processing your message...",
      });
    });
  },
);
