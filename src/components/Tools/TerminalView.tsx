import { useAppSelector } from "@/lib/Redux/hooks";
import { useEffect, useRef, useState } from "react";

import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

import { Terminal as TerminalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  fitTerminal,
  initShell,
  readFromPty,
  writeToPty,
} from "@/lib/terminalFunc";

export function TerminalView() {
  const dir = useAppSelector((state) => state.repo.directory);
  const terminalElement = useRef<HTMLDivElement>(null);
  const term = useRef(
    new Terminal({
      fontFamily: "Geist Mono",
      theme: {
        background: "rgb(5, 5, 5)",
      },
    })
  ).current;

  useEffect(() => {
    const fitAddon = new FitAddon();
    if (terminalElement.current) {
      term.loadAddon(fitAddon);
      term.open(terminalElement.current as HTMLElement);
      initShell(dir);
      term.onData(writeToPty);
      addEventListener("resize", () => fitTerminal(term, fitAddon));
      fitTerminal(term, fitAddon);
      window.requestAnimationFrame(() => readFromPty(term));
    }
  }, []);
  useEffect(() => {
    if (!term) return;
    term.reset();
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    initShell(dir);
    addEventListener("resize", () => fitTerminal(term, fitAddon));
    fitTerminal(term, fitAddon);
  }, [dir]);

  const [openTerminal, setOpenTerminal] = useState(
    localStorage.getItem("openTerminal") === "true"
  );
  return (
    <footer className="flex h-fit max-h-72 flex-col items-end gap-1 border">
      <Button
        variant="outline"
        className="flex w-fit gap-1 rounded-none font-mono"
        onClick={() => {
          setOpenTerminal(!openTerminal);
          localStorage.setItem("openTerminal", (!openTerminal).toString());
        }}>
        <TerminalIcon size={20} />
        Terminal
      </Button>

      <div
        id="terminal"
        ref={terminalElement}
        className={
          (openTerminal ? "block" : "hidden") + " h-full max-h-60 w-full"
        }></div>
    </footer>
  );
}
