import { Command } from "@tauri-apps/api/shell";

export async function getContributors(path: string) {
  const command = new Command("git 2 args", ["shortlog", "-sne"], { cwd: path });
  return new Promise<string[]>((resolve, reject) => {
    const contributors: string[] = [];
    command.spawn().catch((error) => reject(new Error(error)));
    command.stdout.on("data", (data: string) => {
      contributors.push(data.trim());
    });
    command.stderr.on("data", (line) => {
      console.error(`command stderr: "${line}"`);
      reject(new Error(line));
    });
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      reject(new Error(error));
    });
    command.on("close", () => {
      resolve(contributors);
    });
  });
}

export async function getCommitCount(path: string) {
  const command = new Command("git 3 args", ["rev-list", "--count", "--all"], { cwd: path });
  return new Promise<number>((resolve, reject) => {
    let commitCount: number;
    command.spawn().catch((error) => reject(new Error(error)));
    command.stdout.on("data", (data: string) => {
      commitCount = parseInt(data.trim());
    });
    command.stderr.on("data", (line) => {
      console.error(`command stderr: "${line}"`);
      reject(new Error(line));
    });
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      reject(new Error(error));
    });
    command.on("close", () => {
      resolve(commitCount);
    });
  });
}

export async function getRemoteOrigin(path: string) {
  const command = new Command("git 3 args", ["config", "--get", "remote.origin.url"], {
    cwd: path,
  });
  return new Promise<string>((resolve, reject) => {
    let remoteOrigin: string;
    command.spawn().catch((error) => reject(new Error(error)));
    command.stdout.on("data", (data: string) => {
      remoteOrigin = data.trim();
    });
    command.stderr.on("data", (line) => {
      console.error(`command stderr: "${line}"`);
      reject(new Error(line));
    });
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      reject(new Error(error));
    });
    command.on("close", () => {
      resolve(remoteOrigin);
    });
  });
}

// SEPARATOR

/**
 * Adds all changed file in the specified directory to the staging area using.\
 * git equivalent:
 * ```sh
 * git add .
 * ```
 *
 * @param path - path to the directory where the changes should be added.
 * @returns A promise that resolves when the command is executed successfully.
 */
export async function addAllFiles(path: string) {
  await new Command("git 2 args", ["add", "."], { cwd: path }).spawn().catch((error) => {
    console.error(error);
    throw new Error(error);
  });
}

/**
 * Add single file in the specified directory to the staging area using.\
 * git equivalent:\
 * ```sh
 * git add <file_path>
 * ```
 * @param path - path to the Git repository.
 * @param filePath - path to the file to be added to the staging area.
 * @returns A promise that resolves when the file has been successfully added to the staging area and rejected if an error occurs.
 */
export async function addFile(path: string, filePath: string) {
  const command = new Command("git 2 args", ["add", filePath], { cwd: path });
  return new Promise<void>((resolve, reject) => {
    command.on("error", (error) => reject(new Error(error)));
    command.spawn().catch((error) => {
      console.error(error);
      reject(new Error(error));
    });
    command.on("close", () => resolve());
  });
}

/**
 * Retrieves the list of local and remote branches for a given git repository path.
 * git equivalent:
 * ```sh
 * git branch -a
 * ```
 *
 * @param path - path to the Git repository.
 * @returns A promise that resolves to an object containing arrays of local and remote branch names and rejects if an error occurs.
 *
 * The returned object has the following structure:
 * - `local`: An array of local branch names.
 * - `remote`: An array of remote branch names.
 *
 * @example
 * ```typescript
 * const branches = await branchList('/path/to/repo');
 * console.log(branches.local); // ['main', 'feature-branch']
 * console.log(branches.remote); // ['origin/main', 'origin/feature-branch']
 * ```
 */
export async function getBranchList(path: string) {
  const command = new Command("git 2 args", ["branch", "-a"], { cwd: path });
  return new Promise<{ local: string[]; remote: string[] }>((resolve, reject) => {
    const result: { local: string[]; remote: string[] } = {
      local: [],
      remote: [],
    };
    command.spawn().catch((error) => reject(new Error(error)));
    command.stdout.on("data", (data: string) => {
      if (data.match(/remotes/gi)) {
        if (data.match(/-> origin\/main/gi)) return;
        result.remote.push(data.replace(/remotes\//gi, "").trim());
      } else {
        result.local.push(data.replace(/[*+]/g, "").trim());
      }
    });
    command.stderr.on("data", (line) => {
      console.log(`command stderr: "${line}"`);
      reject(new Error(line));
    });
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      reject(new Error(error));
    });
    command.on("close", () => {
      result.local.sort((a, b) => a.localeCompare(b));
      result.remote.sort((a, b) => a.localeCompare(b));
      resolve(result);
    });
  });
}

/**
 * Checks if the given path is a valid git repository by running the `git status` command.
 *
 * @param path - Path to the repository.
 * @returns A promise that resolves to `true` if the repository is valid, or rejects with an error if not.
 */
export async function checkRepository(path: string) {
  const command = new Command("git 1 args", ["status"], { cwd: path });
  return new Promise<true>((resolve, reject) => {
    command.spawn().catch((error) => {
      reject(new Error(error));
    });
    command.stdout.on("data", () => resolve(true));
    command.stderr.on("data", (data) => {
      reject(new Error(data));
    });
    command.on("error", (error) => {
      reject(new Error(error));
    });
  });
}

/**
 * Clones a remote git repository to a local directory.
 * git equivalent:
 * ```sh
 * git clone <remote_repo>
 * ```
 *
 * @param localRepo - Local directory where the repository will be cloned.
 * @param remoteRepo - URL of the remote repository to clone.
 * @returns A promise that resolves to an array of strings containing the clone information and progress.
 */
export async function clone(localRepo: string, remoteRepo: string) {
  const command = new Command("git 3 args", ["clone", "--progress", remoteRepo], {
    cwd: localRepo,
  });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.spawn().catch((error) => {
      reject(new Error(error));
    });
    command.stdout.on("data", (line) => {
      result.push(line);
    });
    command.stderr.on("data", (line) => {
      result.push(line);
    });
    command.on("error", (error) => {
      reject(new Error(error));
    });
    command.on("close", () => {
      resolve(result);
    });
  });
}

/**
 * Commits changes to a git repository with commit message.
 * git equivalent:
 * ```sh
 * git commit -m <message>
 * ```
 *
 * @param path - Path to the git repository.
 * @param message - The commit message to use for the commit.
 * @returns A promise that resolves to last line of the command.
 */
export async function commit(path: string, message: string) {
  const command = new Command("git 3 args", ["commit", "-m", message], {
    cwd: path,
  });
  return new Promise<string>((resolve, reject) => {
    const result: string[] = [];
    command.spawn().catch((error) => {
      reject(new Error(error));
    });
    command.stdout.on("data", (line) => {
      result.push(line);
    });
    command.stderr.on("data", (line) => {
      result.push(line);
    });
    command.on("error", (error) => reject(new Error(error)));
    command.on("close", () => resolve(result.at(-1) ?? ""));
  });
}

/**
 * Retrieves the git username configured in the specified repository path.
 * git equivalent:
 * ```sh
 * git config --get user.name
 * ```
 *
 * @param path - Path to the Git repository.
 * @returns A promise that resolves to the Git username as a string.
 */
export async function configGetUsername(path: string) {
  const command = new Command("git 3 args", ["config", "--get", "user.name"], {
    cwd: path,
  });
  return new Promise<string>((resolve, reject) => {
    let result: string;
    command.on("close", () => {
      resolve(result);
    });
    command.on("error", (error) => reject(new Error(`command error: "${error}"`)));
    command.stdout.on("data", (line) => {
      result = line.trim();
    });
    command.spawn().catch((error) => {
      reject(new Error(error));
    });
  });
}

/**
 * Configures the Git username for a given repository path.
 * git equivalent:
 * ```sh
 * git config user.name <username>
 * ```
 *
 * @param path - Path to the Git repository.
 * @param username - The username to set in the Git configuration.
 * @returns A promise that resolve to a void when the command is executed successfully.
 */
export async function configUsername(path: string, username: string) {
  const command = new Command("git username", ["config", "user.name", username], {
    cwd: path,
  });
  await command.spawn().catch((error) => {
    console.log(error);
    throw new Error(error);
  });
}

/**
 * Replaces the Git username configuration in the specified repository path.
 * git equivalent:
 * ```sh
 * git config --replace-all user.name <username>
 * ```
 *
 * @param path - The path to the Git repository.
 * @param username - The new username to set in the Git configuration.
 * @returns A promise that resolves when the command completes.
 *
 * @example
 * ```typescript
 * await configUsernameReplace('C:/Users/Name/folder', 'new username');
 * ```
 */
export async function configUsernameReplace(path: string, username: string) {
  const command = new Command(
    "git username replace",
    ["config", "--replace-all", "user.name", username],
    {
      cwd: path,
    },
  );
  await command.spawn().catch((error) => {
    console.error(error);
  });
}

/**
 * Retrieves the name of the current Git branch for the repository located at the specified path.
 *
 * @param path - The file system path to the Git repository.
 * @returns A promise that resolves to the name of the current branch as a string.
 */
export async function currentBranch(path: string) {
  const command = new Command("git 2 args", ["branch", "--show-current"], {
    cwd: path,
  });
  return new Promise<string>((resolve, reject) => {
    let result: string;
    command.on("close", () => resolve(result));
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      reject(new Error(error));
    });
    command.stdout.on("data", (data) => (result = data.trim()));
    command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
    command.spawn().catch((error) => {
      console.error(error);
      reject(new Error(error));
    });
  });
}

/**
 * Fetches updates from a remote Git repository.
 *
 * @param path - The file system path to the local Git repository.
 * @returns A promise that resolves to the result of the fetch command as a string.
 */
export async function fetch(path: string) {
  const command = new Command("git 1 args", ["fetch"], { cwd: path });
  return new Promise<string>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result.toString()));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line + "\n"));
    command.stderr.on("data", (line) => result.push(line + "\n"));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Get the differences between commits on a specified branch. ` $|$ ` (with space before and after) ia used as a delimiter to make sure no accidental usage.
 * git equivalent:
 * ```sh
 * git log origin/<branch>...<branch> --pretty=format:"%h $|$ %ad $|$ %an $|$ %s" --date=format-local:%Y-%m-%d %H:%M:%S
 * ```
 *
 * @param path - The file system path to the Git repository.
 * @param branch - The name of the branch to compare.
 * @returns A promise that resolves to an array of strings, each representing a commit difference.
 *
 */
export async function getDiffCommit(path: string, branch: string) {
  const command = new Command(
    "git 4 args",
    [
      "log",
      `origin/${branch}...${branch}`,
      '--pretty=format:"%h $|$ %ad $|$ %an $|$ %s"',
      "--date=format-local:%Y-%m-%d %H:%M:%S",
    ],
    {
      cwd: path,
    },
  );
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.trim()));
    command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Get all commits from a specified branch in a Git repository. Choose between "local" or "remote" commits.
 *
 * @param path - The file system path to the Git repository.
 * @param branch - The name of the branch to retrieve commits from.
 * @param type - The type of commits to retrieve, either "local" or "remote".
 *                - "local": Retrieves commits that are not yet pushed to the remote repository.
 *                - "remote": Retrieves commits from the specified remote branch.
 * @returns A promise that resolves to an array of commit strings, each containing the commit hash, date, author, and message.
 */
export async function getAllCommit(path: string, branch: string, type: "local" | "remote") {
  const response = new Promise<string[]>((resolve, reject) => {
    let command;
    if (type === "local") {
      command = new Command(
        "git 4 args",
        [
          "log",
          "@{push}..",
          '--pretty=format:"%h $|$ %ad $|$ %an $|$ %s"',
          "--date=format-local:%Y-%m-%d %H:%M:%S",
        ],
        {
          cwd: path,
        },
      );
    } else if (type === "remote") {
      command = new Command(
        "git 4 args",
        [
          "log",
          `origin/${branch}`,
          '--pretty=format:"%h $|$ %ad $|$ %an $|$ %s"',
          "--date=format-local:%Y-%m-%d %H:%M:%S",
        ],
        {
          cwd: path,
        },
      );
    } else {
      throw new Error("Choose between 'all' or 'remote'");
    }
    const result: string[] = [];
    command.stdout.on("data", (line) => result.push(line.trim()));
    command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
    command.on("error", (error) => reject(new Error(error)));
    command.on("close", () => resolve(result));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

/**
 * Retrieves the latest commit hash from a remote Git branch.
 *
 * @param path - The file system path to the local Git repository.
 * @param branch - The name of the remote branch to get the latest commit hash from.
 * @returns A promise that resolves to the latest commit hash as a string.
 */
export async function getLatestCommitHash(path: string, branch: string, type: "local" | "remote") {
  let command;
  if (type === "local") {
    command = new Command("git 4 args", ["log", `@{push}..`, '--pretty=format:"%h"', "-1"], {
      cwd: path,
    });
  } else {
    command = new Command("git 4 args", ["log", `origin/${branch}`, '--pretty=format:"%h"', "-1"], {
      cwd: path,
    });
  }
  return new Promise<string>((resolve, reject) => {
    let result: string;
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => {
      result = line.trim().replaceAll('"', "");
    });
    command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Retrieves the last commit message from a Git repository at the specified path. Used before undoing a commits to remember the commit message.
 * git equivalent:
 * ```sh
 * git log -1 --pretty=%B
 * ```
 *
 * @param path - The file system path to the Git repository.
 * @returns A promise that resolves to an array of strings containing the last commit message.
 */
export async function getLastCommitMessage(path: string) {
  const command = new Command("git 3 args", ["log", "-1", "--pretty=%B"], {
    cwd: path,
  });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.trim()));
    command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Executes a Git command to retrieve the top-level directory of a Git repository. Used when the user is opening a repository from a subdirectory.
 * git equivalent:
 * ```sh
 * git rev-parse --show-toplevel
 * ```
 *
 * @param path - The file system path where the Git command should be executed.
 * @returns A promise that resolves to the top-level directory path of the Git repository.
 *
 */
export async function getParent(path: string) {
  const command = new Command("git 2 args", ["rev-parse", "--show-toplevel"], {
    cwd: path,
  });
  return new Promise<string>((resolve, reject) => {
    let result: string;
    command.on("close", () => resolve(result));
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      reject(new Error(error));
    });
    command.stdout.on("data", (line) => (result = line.replace(/\//g, "\\").trim()));
    command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
    command.spawn().catch((error) => {
      console.error(error);
      reject(new Error(error));
    });
  });
}

/**
 * Pushes changes to the remote repository.
 * git equivalent:
 * ```sh
 * git push
 * ```
 *
 * @param path - The file system path to the local Git repository.
 * @returns A promise that resolves with an array of strings containing the output of the command, or rejects with an error if the command fails.
 */
export async function push(path: string) {
  const command = new Command("git 1 args", ["push"], { cwd: path });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.trim()));
    command.stderr.on("data", (line) => result.push(line.trim()));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Pull the latest changes from remote repository.
 * git equivalent:
 * ```sh
 * git pull
 * ```
 *
 * @param path - The path to the directory where the `git pull` command should be executed.
 * @returns A promise that resolves with an array of strings containing the output of the command, or rejects with an error if the command fails.
 */
export async function pull(path: string) {
  const command = new Command("git 1 args", ["pull"], { cwd: path });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Removes all untracked files in the specified Git repository path.
 * git equivalent:
 * ```sh
 * git clean -f
 * ```
 *
 * @param path - The file system path to the Git repository.
 * @returns A promise that resolves with an array of strings containing the output lines from the Git command.
 */
export async function removeUntrackedAll(path: string) {
  const command = new Command("git 2 args", ["clean", "-f"], {
    cwd: path,
  });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Reverts all changes in the given repository path. This function first removes all untracked files by running `removeUntrackedAll()` and then runs the `git restore .` command
 *
 * @param path - The file system path to the Git repository.
 * @returns A promise that resolves with an array of strings containing the output of the command,
 * or rejects with an error if the command fails.
 */
export async function revertAll(path: string) {
  await removeUntrackedAll(path);
  const command = new Command("git 2 args", ["restore", "."], {
    cwd: path,
  });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Reverts a single file to its last committed state using the `git restore` command.
 * git equivalent:
 * ```sh
 * git restore <file_path>
 * ```
 *
 * @param path - The working directory where the git command should be executed.
 * @param filePath - The path to the file that should be reverted.
 * @returns A promise that resolves with an array of strings containing the command output, or rejects with an error.
 */
export async function revertFile(path: string, filePath: string) {
  const command = new Command("git 2 args", ["restore", filePath], {
    cwd: path,
  });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Executes a Git command to show the list of changed files in the specified directory.
 * git equivalent:
 * ```sh
 * git diff --name-only
 * ```
 *
 * @param path - The path to the directory where the Git command should be executed.
 * @returns A promise that resolves to an array of strings, each representing a changed file.
 */
export async function showChanged(path: string) {
  const command = new Command("git 2 args", ["diff", "--name-only"], {
    cwd: path,
  });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.trim().replace(/[\n\r]/g, "")));
    // command.stderr.on("data", (line) => console.log(`stderr: "${line}"`));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Executes a Git command to show the list of staged files in the specified repository path.
 * git equivalent:
 * ```sh
 * git diff --name-only --cached
 * ```
 *
 * @param path - The file system path to the Git repository.
 * @returns A promise that resolves to an array of strings, each representing a staged file.
 */
export async function showStaged(path: string) {
  const command = new Command("git 3 args", ["diff", "--name-only", "--cached"], {
    cwd: path,
  });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.trim().replace(/[\n\r]/g, "")));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Executes a Git command to list untracked files in the specified directory.
 * git equivalent:
 * ```sh
 * git ls-files --others --exclude-standard
 * ```
 *
 * @param path - The path to the directory where the Git command should be executed.
 * @returns A promise that resolves to an array of strings, each representing an untracked file.
 */
export async function showUntrackedFiles(path: string) {
  const command = new Command("git 3 args", ["ls-files", "--others", "--exclude-standard"], {
    cwd: path,
  });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.replace(/[\n\r]/g, "")));
    command.stderr.on("data", (line) => result.push(line.replace(/[\n\r]/g, "")));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Sets the global Git configuration to disable SSL verification.
 * This function executes the command `git config --global http.sslVerify false`
 * to disable SSL verification for all Git operations globally.
 * git equivalent:
 * ```sh
 * git config --global http.sslVerify false
 * ```
 *
 * @returns A promise that resolves when the command is executed.
 */
export async function setSSLFalse() {
  const command = new Command("git ssl", ["config --global http.sslVerify false"]);
  await command.spawn().catch((error) => {
    console.error(error);
  });
}

/**
 * Undo the last commit in the given Git repository path while keeping the changes in the working directory.
 * git equivalent:
 * ```sh
 * git reset --soft HEAD^
 * ```
 *
 * @param path - The file system path to the Git repository.
 * @returns A promise that resolves with an array of strings containing the command output, or rejects with an error if the command fails.
 */
export async function undoLastCommit(path: string) {
  const command = new Command("git 3 args", ["reset", "--soft", "HEAD^"], {
    cwd: path,
  });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => {
      reject(new Error(error));
    });
  });
}

/**
 * Unstages all changes in the given repository path.
 * git equivalent:
 * ```sh
 * git reset HEAD
 * ```
 *
 * @param path - The path to the repository where changes should be unstaged.
 * @returns A promise that resolves with an array of strings containing the output of the command.
 */
export async function unstageAll(path: string) {
  const command = new Command("git 2 args", ["reset", "HEAD"], {
    cwd: path,
  });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Unstages a file in a given Git repository path.
 * git equivalent:
 * ```sh
 * git restore --staged <file>
 * ```
 *
 * @param path - The path to the Git repository.
 * @param file - The name of the file to unstage.
 * @returns A promise that resolves to an array of strings containing the command output.
 */
export async function unstageFile(path: string, file: string) {
  const command = new Command("git 3 args", ["restore", "--staged", file], {
    cwd: path,
  });
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}

/**
 * Retrieves the version of the installed Git.
 * git equivalent:
 * ```sh
 * git --version
 * ```
 *
 * @returns A promise that resolves to an array of strings containing the version information.
 */
export async function version() {
  const command = new Command("git 1 args", ["--version"]);
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.trim()));
    command.stderr.on("data", (line) => result.push(line.trim()));
    command.spawn().catch((error) => reject(new Error(error)));
  });
}
