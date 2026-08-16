import { Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const format = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export function QuestionTimer({ resetKey, paused }: { resetKey: number; paused: boolean }) {
  const [seconds, setSeconds] = useState(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    setSeconds(0);
    const id = setInterval(() => {
      if (!pausedRef.current) setSeconds((value) => value + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [resetKey]);

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 font-mono text-sm tabular-nums">
      <Timer className="size-3.5 text-accent" />
      {format(seconds)}
    </span>
  );
}
