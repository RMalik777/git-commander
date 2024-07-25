import { FileEntry, exists, readTextFile } from "@tauri-apps/api/fs";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";
import { appWindow } from "@tauri-apps/api/window";

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

export async function checkGitIgnore(dir: string) {
  return await exists(dir + "\\.gitignore");
}

export async function readGitIgnore(dir: string, scan: boolean = true) {
  let data;
  if (scan) data = await readTextFile(dir + "\\.gitignore");
  else data = await readTextFile(dir);
  const lines = data.replaceAll("\r", "").split("\n");
  // Remove empty lines and comments
  const result = lines.filter((line) => line != "" && !line.startsWith("#"));
  const formatted = {
    folder: result.filter(
      (line) =>
        (line.includes("/") || !line.includes(".")) &&
        !line.startsWith("!") &&
        !line.includes("/*")
    ),
    file: result.filter((line) => !line.includes("/") && line.includes(".")),
    folderException: result.filter((line) => line.startsWith("!")),
    fileException: result.filter((line) => line.startsWith("!")),
  };
  formatted.file = formatted.file.map((line) => line.replace(/^\W\**./, ""));
  formatted.folder = formatted.folder.map((line) =>
    line.replace(/^\//, "").replace(/\/$/, "").replace(/\/\*/g, "")
  );
  formatted.folderException = formatted.folderException.map((line) => {
    const formatted = line.split("/");
    formatted.pop();
    return formatted.join("/").replace(/^!/, "");
  });
  formatted.fileException = formatted.fileException.map((line) =>
    line.replace(/^!/, "")
  );
  return formatted;
}

export async function sortAndFilter(
  parent: FileEntry[],
  rootDir: string,
  parentDir: string = "",
  ignore?: {
    folder: string[];
    file: string[];
    folderException: string[];
    fileException: string[];
  }
) {
  if (!ignore) {
    ignore = await readGitIgnore(rootDir);
  }
  let secondIgnore;
  if (parentDir !== "") {
    if (await checkGitIgnore(rootDir + parentDir)) {
      secondIgnore = await readGitIgnore(rootDir + parentDir);
      ignore.folder.push(
        ...secondIgnore.folder.filter((f) => !ignore.folder.includes(f))
      );
      ignore.file.push(
        ...secondIgnore.file.filter((f) => !ignore.file.includes(f))
      );
    }
  }
  parent.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0);
  parent.sort((a, b) => {
    if (a.children && !b.children) return -1;
    if (!a.children && b.children) return 1;
    return 0;
  });
  const parentLen = parent.length;
  for (let i = parentLen - 1; i >= 0; i--) {
    const child = parent[i];
    const childExt = child.name?.split("/").pop();
    if (
      ignore.folder.includes(child.name ?? "") ||
      ignore.file.includes(child.name ?? "") ||
      ignore.file.includes(childExt ?? "") ||
      child.name === ".git"
    ) {
      parent.splice(i, 1);
    }
    if (ignore.folderException.includes(child.name ?? "")) {
      const childLen = child.children?.length ?? 0;
      for (let j = childLen - 1; j >= 0; j--) {
        const subChild = child.children?.[j];
        const newPath = subChild?.path.replaceAll("\\", "/");
        if (ignore.fileException.some((file) => !newPath?.includes(file))) {
          child.children?.splice(j, 1);
        }
      }
    }
    delete child.name;
    child.path = child.path?.replace(rootDir, "");
    if (child.children) {
      child.children.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0);
      child.children.sort((a, b) => {
        if (a.children && !b.children) return -1;
        if (!a.children && b.children) return 1;
        return 0;
      });
      await sortAndFilter(child.children, rootDir, child.path, ignore);
    }
  }
  return parent;
}
