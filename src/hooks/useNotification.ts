import { useEffect, useRef, useState } from "react";
export function useNotification() {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Timer creation belongs to the notification event; only disposal belongs to unmount.
  useEffect(() => () => clearTimeout(timer.current), []);
  function clear() {
    clearTimeout(timer.current);
    setMessage("");
  }
  function show(next: string) {
    clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => setMessage(""), 4500);
  }
  return { message, show, clear };
}
