import { invoke } from "@tauri-apps/api";

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

export async function fitTerminal(term: Terminal, fitAddon: FitAddon) {
  fitAddon.fit();
  void invoke<string>("async_resize_pty", {
    rows: term.rows,
    cols: term.cols,
  });
}
export function initShell(dir: string) {
  invoke("async_create_shell", { directory: dir }).catch((error) => {
    console.error("Error creating shell:", error);
  });
}
export function writeToTerminal(term: Terminal, data: string) {
  return new Promise<void>((r) => {
    term.write(data, () => r());
  });
}

export function writeToPty(data: string) {
  void invoke("async_write_to_pty", {
    data,
  });
}
export async function readFromPty(term: Terminal) {
  const data = await invoke<string>("async_read_from_pty");

  if (data) {
    await writeToTerminal(term, data);
  }
  window.requestAnimationFrame(() => readFromPty(term));
}
