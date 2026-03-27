import { useMemo, useState } from "react";
import { ChatButton } from "./ChatButton";
import { ChatWindow } from "./ChatWindow";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  // If you later want unread counts, wire it here.
  const unread = useMemo(() => 0, []);

  return (
    <>
      <ChatWindow open={open} onClose={() => setOpen(false)} />
      <ChatButton open={open} onClick={() => setOpen((v) => !v)} unread={unread} />
    </>
  );
}

