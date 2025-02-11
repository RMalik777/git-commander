/**
 * This file contains functions that interact with the terminal.
 * It is build with xterm.js.
 */

import { invoke } from "@tauri-apps/api";

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

/**
 * Adjusts the terminal size to fit its container and resizes the PTY accordingly.
 *
 * @param term - The terminal instance to be resized.
 * @param fitAddon - The FitAddon instance used to fit the terminal to its container.
 * @returns A promise that resolves when the PTY has been resized.
 */
export async function fitTerminal(term: Terminal, fitAddon: FitAddon) {
  fitAddon.fit();
  void invoke<string>("async_resize_pty", {
    rows: term.rows,
    cols: term.cols,
  });
}

/**
 * Initializes a shell in the specified directory.
 *
 * This function invokes the `async_create_shell` command with the provided directory.
 * If an error occurs during the invocation, it logs the error to the console.
 *
 * @param dir - The directory in which to initialize the shell.
 */
export function initShell(dir: string) {
  invoke("async_create_shell", { directory: dir }).catch((error) => {
    console.error("Error creating shell:", error);
  });
}

/**
 * Writes data to the terminal.
 *
 * @param term - The terminal instance where the data will be written.
 * @param data - The string data to be written to the terminal.
 * @returns A promise that resolves when the data has been written to the terminal.
 */
export function writeToTerminal(term: Terminal, data: string) {
  return new Promise<void>((r) => {
    term.write(data, () => r());
  });
}

/**
 * Writes data to the pseudo-terminal (PTY) asynchronously.
 *
 * This function invokes the `async_write_to_pty` command with the provided data.
 *
 * @param data - The string data to be written to the PTY.
 */
export function writeToPty(data: string) {
  void invoke("async_write_to_pty", {
    data,
  });
}
/**
 * Continuously reads data from a pseudo-terminal (PTY) and writes it to the provided terminal instance.
 * The function invokes an asynchronous command to read data from the PTY and, if data is received,
 * writes it to the terminal. It then uses `requestAnimationFrame` to recursively call itself,
 * ensuring continuous reading and writing.
 *
 * @param term - The terminal instance where the data will be written.
 * @returns A promise that resolves when the function completes.
 */
export async function readFromPty(term: Terminal) {
  const data = await invoke<string>("async_read_from_pty");

  if (data) {
    await writeToTerminal(term, data);
  }
  window.requestAnimationFrame(() => readFromPty(term));
}
