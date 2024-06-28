import { Command } from "@tauri-apps/api/shell";

export async function cd(path: string) {
  return await new Command("cd", [path]).execute();
}
