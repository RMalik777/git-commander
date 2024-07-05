import { Command } from "@tauri-apps/api/shell";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";
import { appWindow } from "@tauri-apps/api/window";

export async function cd(path: string) {
  return await new Command("cd", [path]).execute();
}

export async function displayNotificationNotFocus(
  title: string,
  message: string
) {
  if ((await isPermissionGranted()) === false) {
    await requestPermission();
  }
  const isFocused = await appWindow.isFocused();
  if (isFocused) return;
  else {
    sendNotification({
      title: title,
      body: message,
    });
  }
}
