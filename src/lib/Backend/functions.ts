import { FileEntry, exists, readTextFile, readDir } from "@tauri-apps/api/fs";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";
import { appWindow } from "@tauri-apps/api/window";

/**
 * Displays a notification if the application window is not focused.
 *
 * This function first checks if the notification permission is granted. If not, it requests the permission.
 * Then, it checks if the application window is focused. If the window is focused, the function exits early.
 * Otherwise, it sends a notification with the provided title and message.
 *
 * @param title - The title of the notification.
 * @param message - The message body of the notification.
 * @returns A promise that resolves when the notification is sent or the function exits early.
 *
 * @example
 * ```ts
 * await displayNotificationNotFocus("Error", "Function failed to execute");
 * ```
 */
export async function displayNotificationNotFocus(title: string, message: string) {
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

/**
 * Checks if a `.gitignore` file exists in the specified directory.
 *
 * @param dir - The directory path where the `.gitignore` file is expected to be found.
 * @returns A promise that resolves to a boolean indicating whether the `.gitignore` file exists.
 */
export async function checkGitIgnore(dir: string) {
  return await exists(dir + "\\.gitignore");
}

/**
 * Reads and parses a `.gitignore` file from the specified directory.
 *
 * @param dir - The directory path where the `.gitignore` file is located.
 * @param scan - A boolean flag indicating whether to scan for the `.gitignore` file in the specified directory (default is true).
 * @returns An object containing arrays of parsed `.gitignore` entries categorized into folders, files, folder exceptions, and file exceptions.
 *
 * The returned object has the following structure:
 * - `folder`: An array of folder paths specified in the `.gitignore` file.
 * - `file`: An array of file paths specified in the `.gitignore` file.
 * - `folderException`: An array of folder paths that are exceptions in the `.gitignore` file.
 * - `fileException`: An array of file paths that are exceptions in the `.gitignore` file.
 *
 * The function performs the following steps:
 * 1. Checks if the `.gitignore` file exists in the specified directory using `checkGitIgnore`.
 * 2. Reads the content of the `.gitignore` file.
 * 3. Splits the content into lines and removes empty lines and comments.
 * 4. Categorizes the lines into folders, files, folder exceptions, and file exceptions.
 * 5. Formats the categorized lines by removing unnecessary characters.
 *
 * @example
 * ```typescript
 * const gitIgnoreData = await readGitIgnore('/path/to/repo');
 * console.log(gitIgnoreData.folder); // Output: Array of folder paths
 * console.log(gitIgnoreData.file); // Output: Array of file paths
 * ```
 */
export async function readGitIgnore(dir: string, scan: boolean = true) {
  if ((await checkGitIgnore(dir)) === false) return;
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
        !line.includes("/*"),
    ),
    file: result.filter((line) => !line.includes("/") && line.includes(".")),
    folderException: result.filter((line) => line.startsWith("!")),
    fileException: result.filter((line) => line.startsWith("!")),
  };
  formatted.file = formatted.file.map((line) => line.replace(/^\W\**./, ""));
  formatted.folder = formatted.folder.map((line) =>
    line.replace(/^\//, "").replace(/\/$/, "").replace(/\/\*/g, ""),
  );
  formatted.folderException = formatted.folderException.map((line) => {
    const formatted = line.split("/");
    formatted.pop();
    return formatted.join("/").replace(/^!/, "");
  });
  formatted.fileException = formatted.fileException.map((line) => line.replace(/^!/, ""));
  return formatted;
}

/**
 * Sorts and filters a list of file entries based on specified ignore rules.
 *
 * The function performs the following operations:
 * - Reads ignore rules from the `.gitignore` file if not provided.
 * - Merges additional ignore rules if the parent directory has its own `.gitignore`.
 * - Sorts the file entries alphabetically and prioritizes directories over files.
 * - Filters out file entries based on the ignore rules.
 * - Recursively processes child directories.
 *
 * @param parent - The list of file entries to be sorted and filtered.
 * @param rootDir - The root directory path.
 * @param parentDir - The parent directory path, defaults to an empty string.
 * @param ignore - An optional object containing ignore rules for folders, files, and exceptions.
 * @returns A promise that resolves to the sorted and filtered list of file entries.
 */
export async function sortAndFilter(
  parent: FileEntry[],
  rootDir: string,
  parentDir: string = "",
  ignore?: {
    folder: string[];
    file: string[];
    folderException: string[];
    fileException: string[];
  },
) {
  if (!ignore) {
    ignore = await readGitIgnore(rootDir);
  }
  let secondIgnore;
  if (parentDir !== "") {
    if (await checkGitIgnore(rootDir + parentDir)) {
      secondIgnore = await readGitIgnore(rootDir + parentDir);
      if (secondIgnore) {
        ignore?.folder.push(...secondIgnore.folder.filter((f) => !ignore.folder.includes(f)));
        ignore?.file.push(...secondIgnore.file.filter((f) => !ignore.file.includes(f)));
      }
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
      ignore?.folder.includes(child.name ?? "") ||
      ignore?.file.includes(child.name ?? "") ||
      ignore?.file.includes(childExt ?? "") ||
      child.name === ".git"
    ) {
      parent.splice(i, 1);
    }
    if (ignore?.folderException.includes(child.name ?? "")) {
      const childLen = child.children?.length ?? 0;
      for (let j = childLen - 1; j >= 0; j--) {
        const subChild = child.children?.[j];
        const newPath = subChild?.path.replaceAll("\\", "/");
        if (ignore?.fileException.some((file) => !newPath?.includes(file))) {
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

export async function getAllChildDir(repo: string) {
  try {
    const directory = await readDir(repo, { recursive: true });
    const sorted = await sortAndFilter(directory, repo);
    return sorted;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
