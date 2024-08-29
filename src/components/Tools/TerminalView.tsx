import { useAppSelector } from "@/lib/Redux/hooks";
import { useEffect, useRef, useState } from "react";

import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

import { Terminal as TerminalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { fitTerminal, initShell, readFromPty, writeToPty } from "@/lib/terminalFunc";

export function TerminalView() {
  const dir = useAppSelector((state) => state.repo.directory);
  const terminalElement = useRef<HTMLDivElement>(null);
  const term = useRef(
    new Terminal({
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

  const [openTerminal, setOpenTerminal] = useState(localStorage.getItem("openTerminal") === "true");
  return (
    <footer className="flex h-fit max-h-72 flex-col items-end gap-1 border dark:border-neutral-700">
      <Button
        variant="outline"
        className="flex w-fit gap-1 rounded-none font-mono"
        onClick={async () => {
          setOpenTerminal(!openTerminal);
          localStorage.setItem("openTerminal", (!openTerminal).toString());
          const fitAddon = new FitAddon();
          term.loadAddon(fitAddon);
          // Set timeout is needed so the FitAddon can be loaded first before fitting the terminal. The amount of time is (probably) not important, 1ms should be enough but i choose 10 just to be safe.
          // The alternative will be to await the term.loadAddon(fitAddon) and then fit the terminal. But that shows warning because it's not a promise.
          setTimeout(() => fitTerminal(term, fitAddon), 10);
        }}>
        <TerminalIcon size={20} />
        Terminal
      </Button>

      <div
        id="terminal"
        ref={terminalElement}
        className={(openTerminal ? "block" : "hidden") + " h-full max-h-60 min-h-52 w-full"}></div>
    </footer>
  );
}
