import { useChat } from "@ai-sdk/react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/interviewpilot-logo.png";
import { QuestionTimer } from "@/components/QuestionTimer";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { TOTAL_QUESTIONS, getRole } from "@/lib/roles";

export const Route = createFileRoute("/interview/$roleId")({
  beforeLoad: ({ params }) => {
    if (!getRole(params.roleId)) throw notFound();
  },
  head: ({ params }) => {
    const role = getRole(params.roleId);
    const title = `${role?.title ?? "Mock"} Mock Interview | InterviewPilot`;
    const description = `Answer five ${role?.title ?? "role"} interview questions one at a time and get a scored report card with strengths, gaps and a model answer.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: InterviewScreen,
});

const messageText = (message: { parts: Array<{ type: string; text?: string }> }) =>
  message.parts
    .map((part) => (part.type === "text" ? (part.text ?? "") : ""))
    .join("")
    .trim();

function InterviewScreen() {
  const { roleId } = Route.useParams();
  const role = getRole(roleId)!;
  const [sessionKey, setSessionKey] = useState(0);

  return (
    <main className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-5 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Roles
          </Link>
          <span className="h-5 w-px bg-border" />
          <img
            src={logo}
            alt="InterviewPilot logo"
            width={512}
            height={512}
            loading="lazy"
            className="size-7 rounded-md"
          />
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold">{role.title} interview</p>
            <p className="text-xs text-muted-foreground">5 questions · one at a time</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSessionKey((key) => key + 1)}
          className="gap-1.5"
        >
          <RotateCcw className="size-3.5" />
          Restart
        </Button>
      </header>
      <InterviewSession key={`${roleId}-${sessionKey}`} roleId={roleId} roleTitle={role.title} />
    </main>
  );
}

function InterviewSession({ roleId, roleTitle }: { roleId: string; roleTitle: string }) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { roleId } }),
    [roleId],
  );
  const { messages, sendMessage, status, error } = useChat({
    id: `interview-${roleId}`,
    transport,
    onError: (chatError) => {
      const message = chatError.message.includes("429")
        ? "Rate limit reached — please wait a moment and try again."
        : chatError.message.includes("402")
          ? "AI credits exhausted. Add credits in your Lovable workspace to continue."
          : "The interviewer couldn't respond. Please try again.";
      toast.error(message);
    },
  });

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void sendMessage({ text: "Begin the interview." });
  }, [sendMessage]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState("");
  const isBusy = status === "submitted" || status === "streaming";

  const visible = messages.slice(1);
  const answers = Math.max(0, messages.filter((m) => m.role === "user").length - 1);
  const assistantTurns = messages.filter((m) => m.role === "assistant").length;
  const questionNumber = Math.min(TOTAL_QUESTIONS, answers + 1);
  const isFinished = answers >= TOTAL_QUESTIONS && assistantTurns > TOTAL_QUESTIONS;
  const finished = isFinished && status === "ready";

  useEffect(() => {
    if (!finished && !isBusy) textareaRef.current?.focus();
  }, [finished, isBusy]);

  if (finished) {
    const report = messageText(messages[messages.length - 1] as never);
    return <ReportCard report={report} roleTitle={roleTitle} />;
  }

  const submit = () => {
    const text = input.trim();
    if (!text || isBusy) return;
    setInput("");
    void sendMessage({ text });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-5">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-10 rounded-full ${
                index < answers ? "bg-accent" : index === answers ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-muted-foreground">
            {answers >= TOTAL_QUESTIONS
              ? "Evaluating"
              : `Question ${questionNumber} of ${TOTAL_QUESTIONS}`}
          </span>
        </div>
        <QuestionTimer resetKey={answers} paused={isBusy} />
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="gap-5 px-0">
          {visible.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent
                className={
                  message.role === "user"
                    ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                    : ""
                }
              >
                <MessageResponse>{messageText(message as never)}</MessageResponse>
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && (
            <Shimmer className="text-sm">
              {answers >= TOTAL_QUESTIONS ? "Writing your report card..." : "Thinking..."}
            </Shimmer>
          )}
          {error && (
            <p className="text-sm text-destructive">
              Something went wrong. Send your answer again to retry.
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="pb-5">
        <PromptInput
          onSubmit={(_message, event) => {
            event.preventDefault();
            submit();
          }}
        >
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              answers >= TOTAL_QUESTIONS
                ? "Wrapping up..."
                : "Type your answer — take your time and think out loud."
            }
            disabled={isBusy}
          />
          <PromptInputFooter className="justify-between">
            <span className="text-xs text-muted-foreground">
              Enter to send · Shift + Enter for a new line
            </span>
            <PromptInputSubmit status={status} disabled={!input.trim() || isBusy} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

function ReportCard({ report, roleTitle }: { report: string; roleTitle: string }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <p className="text-xs font-semibold tracking-widest text-accent uppercase">
          Interview complete
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
          {roleTitle} report card
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Scores per question, your strengths, what to sharpen, and a model answer for your weakest
          response.
        </p>

        <article className="mt-8 rounded-2xl border border-border bg-card p-7 shadow-[0_12px_40px_-24px_rgba(16,32,64,0.5)]">
          <MessageResponse className="text-card-foreground">{report}</MessageResponse>
        </article>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/">Try another role</Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Redo this interview
          </Button>
        </div>
      </div>
    </div>
  );
}
