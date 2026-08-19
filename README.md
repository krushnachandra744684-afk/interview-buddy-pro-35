# InterviewPilot — AI Mock Interview Bot

A mock interview app that simulates a realistic 5-question technical interview,
then grades your answers and hands you a scored report card with strengths,
weaknesses, and a model answer for your weakest response.

> **Try it live:** https://interview-buddy-pro-35.lovable.app

## What it does

1. **Pick a role** — SDE Intern, Data Analyst, or Frontend Developer.
2. **Answer 5 questions** — the AI interviewer asks one question at a time,
   tailored to the role's focus areas, with a per-question timer and a
   progress bar tracking the 5-question journey.
3. **Get a report card** — once all five answers are in, the AI scores each
   question out of 10, lists your top strengths and gaps, and writes a model
   answer for your weakest response.

## How it works

- **Full conversation history on every turn.** The chat client keeps the entire
  message array and posts it to the server on each response. The model is
  stateless, so the full transcript is re-sent every turn — that's how the
  interviewer can reference your Question 1 answer when scoring at the end.
  This is a deliberate design choice worth naming in an interview: every turn
  grows the prompt, so long sessions eventually approach the context window
  and would need trimming or summarisation. Five questions stays well inside it.
- **Server-side prompt + state tracking.** The role-specific system prompt is
  built on the server (`src/lib/interview-prompts.server.ts`) and a hidden state
  note tells the model which question number it's on, enforcing exactly five
  questions before transitioning to the evaluation.
- **Streaming AI responses** through the Lovable AI Gateway.

## Tech stack

- **TanStack Start v1** (React 19, full-stack, SSR/SSG on Cloudflare Workers)
- **Vite 7**
- **Tailwind CSS v4** (native `@import` + `@theme`, OKLCH navy/white palette)
- **AI SDK** (`@ai-sdk/react`, `ai`, `@ai-sdk/openai-compatible`) via the
  Lovable AI Gateway
- **TypeScript**

## Project structure

```
src/
  lib/
    roles.ts                     # role definitions + focus areas
    interview-prompts.server.ts  # system prompt + 5-question rules (server-only)
    ai-gateway.server.ts         # Lovable AI Gateway provider config
  routes/
    index.tsx                    # Screen 1 — role picker
    interview.$roleId.tsx        # Screen 2 — chat + Screen 3 — report card
    api/chat.ts                   # streaming chat endpoint w/ history + state
  components/
    QuestionTimer.tsx            # per-question countdown timer
    ai-elements/                  # conversation, message, prompt-input, shimmer
```

## Run it locally

```sh
git clone <this-repository-url>
cd interviewpilot
npm i
npm run dev
```

## Design notes

- Professional navy + white palette, "Sora" for headings, "Plus Jakarta Sans"
  for body.
- Three role presets ship out of the box; each has its own question focus
  bank so the interview stays relevant rather than generic.

---

Built with [Lovable](https://lovable.dev).
