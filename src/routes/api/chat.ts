import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { buildSystemPrompt } from "@/lib/interview-prompts.server";

type ChatRequestBody = { messages?: unknown; roleId?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const messages = body.messages;
        const roleId = typeof body.roleId === "string" ? body.roleId : "sde-intern";

        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const uiMessages = messages as UIMessage[];
        // Safety net: candidate answers so far (the first user turn is the kickoff trigger).
        const answers = Math.max(0, uiMessages.filter((m) => m.role === "user").length - 1);
        const remaining = Math.max(0, 5 - answers);
        const note =
          answers === 0
            ? "(No answers collected yet — introduce yourself and ask Question 1 of 5.)"
            : remaining === 0
              ? "(All 5 answers are collected — do NOT ask another question. Produce the final evaluation now, in the required format.)"
              : `(The candidate has now answered question ${answers} of 5 — ${remaining} remaining. Ask Question ${answers + 1} of 5 next.)`;

        const gateway = createLovableAiGatewayProvider(key);

        try {
          const result = streamText({
            model: gateway("google/gemini-3.6-flash"),
            system: `${buildSystemPrompt(roleId)}\n\nINTERVIEW STATE NOTE (not visible to the candidate): ${note}`,
            messages: await convertToModelMessages(uiMessages),
          });

          return result.toUIMessageStreamResponse({ originalMessages: uiMessages });
        } catch (error) {
          console.error("chat error", error);
          return new Response("The interviewer is unavailable right now.", { status: 500 });
        }
      },
    },
  },
});
