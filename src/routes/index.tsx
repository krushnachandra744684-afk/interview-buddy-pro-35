import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock, ListChecks, MessageSquareQuote } from "lucide-react";

import logo from "@/assets/interviewpilot-logo.png";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InterviewPilot — AI Mock Interviews with Scored Feedback" },
      {
        name: "description",
        content:
          "Practise a realistic 5-question mock interview for SDE Intern, Data Analyst or Frontend Developer roles, then get a scored report card with strengths and a model answer.",
      },
      { property: "og:title", content: "InterviewPilot — AI Mock Interviews" },
      {
        property: "og:description",
        content:
          "Five tailored interview questions, one at a time, followed by an honest scored report card.",
      },
    ],
  }),
  component: RolePicker,
});

function RolePicker() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="flex items-center gap-3">
          <img
            src={logo}
            alt="InterviewPilot logo"
            width={512}
            height={512}
            className="size-10 rounded-lg"
          />
          <span className="font-display text-lg font-semibold tracking-tight">InterviewPilot</span>
        </header>

        <section className="mt-14 max-w-2xl">
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">
            A mock interview that actually tells you where you stand.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Five role-specific questions, asked one at a time by an AI interviewer. Answer in your
            own words and finish with a scored report card.
          </p>
          <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <ListChecks className="size-4 text-accent" /> 5 tailored questions
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-accent" /> Timer per question
            </li>
            <li className="flex items-center gap-2">
              <MessageSquareQuote className="size-4 text-accent" /> Scores + model answer
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Choose your role
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {ROLES.map((role) => (
              <Link
                key={role.id}
                to="/interview/$roleId"
                params={{ roleId: role.id }}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(16,32,64,0.06)] transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_12px_32px_-12px_rgba(16,32,64,0.35)]"
              >
                <span className="text-xs font-medium tracking-wide text-accent uppercase">
                  {role.level}
                </span>
                <h3 className="font-display mt-2 text-xl font-semibold text-card-foreground">
                  {role.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{role.tagline}</p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {role.focus.map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Start interview
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
