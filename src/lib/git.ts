import { Command } from "@tauri-apps/api/shell";
import { useAppSelector } from "./Redux/hooks";

export async function addAll(path: string) {
  const command = new Command("git 2 args", ["add", "."], { cwd: path });
  await command.spawn().catch((error) => {
    console.error(error);
  });
}
export async function addFile(path: string, filePath: string) {
  const response = new Promise<void>((resolve, reject) => {
    const command = new Command("git 2 args", ["add", filePath], { cwd: path });
    command.on("close", () => resolve());
    command.on("error", (error) => reject(new Error(error)));
    command.spawn().catch((error) => {
      console.error(error);
    });
  });
  return await response;
}

export async function branchList(path: string) {
  const response = new Promise((resolve, reject) => {
    const command = new Command("git 2 args", ["branch", "-a"], { cwd: path });
    const result: { local: string[]; remote: string[] } = {
      local: [],
      remote: [],
    };
    command.on("error", (error) => console.error(`command error: "${error}"`));
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
    command.on("close", () => {
      result.local.sort((a, b) => a.localeCompare(b));
      result.remote.sort((a, b) => a.localeCompare(b));
      resolve(result);
    });
    command.spawn().catch((error) => console.error(error));
  });
  return await response;
}

export async function checkGit(path: string) {
  let errorMsg: string | undefined;
  let isGitRepo = false;
  const response = new Promise((resolve, reject) => {
    const command = new Command("git 1 args", ["status"], { cwd: path });
    command.on("close", () => resolve({ isGitRepo, errorMsg }));
    command.on("error", (error) => {
      console.error(error);
      reject(new Error(error));
    });
    command.stdout.on("data", () => (isGitRepo = true));
    command.stderr.on("data", (data) => {
      isGitRepo = false;
      if (data.match(/fatal: not a git repository/gi)) errorMsg = "Folder is not a git repository";
    });
    command.spawn().catch((error) => {
      errorMsg = error;
      console.error(error);
      reject(new Error(error));
    });
  });
  return await response;
}

export async function checkGitStatus(path: string) {
  const response = new Promise((resolve, reject) => {
    const command = new Command("git 1 args", ["status"], { cwd: path });
    command.on("close", () => resolve(false));
    command.on("error", (error) => {
      console.error(error);
      reject(new Error(error));
    });
    command.stdout.on("data", () => resolve(true));
    command.stderr.on("data", () => resolve(false));
    command.spawn().catch((error) => {
      console.error(error);
      reject(new Error(error));
    });
  });
  return await response;
}

export async function clone(localRepo: string, remoteRepo: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 3 args", ["clone", "--progress", remoteRepo], {
      cwd: localRepo,
    });
    command.on("close", (data) => {
      console.log(`command finished with code ${data.code} and signal ${data.signal}`);
      resolve(result);
    });
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      reject(new Error(error));
    });
    command.stdout.on("data", (line) => {
      console.log(`stdout: "${line}"`);
      result.push(line);
    });
    command.stderr.on("data", (line) => {
      console.log(`stderr: "${line}"`);
      result.push(line);
    });
    command.spawn().catch((error) => {
      console.error(error);
      reject(new Error(error));
    });
  });
  return await response;
}

export async function commit(path: string, message: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const commmit = new Command("git 3 args", ["commit", "-m", message], {
      cwd: path,
    });
    commmit.on("close", (data) => {
      console.log(`command finished with code ${data.code} and signal ${data.signal}`);
      resolve(result.at(-1));
    });
    commmit.on("error", (error) => console.error(`command error: "${error}"`));
    commmit.stdout.on("data", (line) => {
      console.log(`command stdout: "${line}"`);
      result.push(line);
    });
    commmit.stderr.on("data", (line) => {
      console.log(`command stderr: "${line}"`);
      result.push(line);
    });
    commmit.spawn().catch((error) => {
      reject(new Error(error));
    });
  });
  return await response;
}

export async function commitAll(path: string, message: string) {
  await addAll(path);
  return await commit(path, message);
}

export async function configUsername(path: string, username: string) {
  const command = new Command("git username", ["config", "user.name", username], {
    cwd: path,
  });
  await command.spawn().catch((error) => {
    console.log(error);
    throw new Error(error);
  });
}
export async function configUsernameReplace(path: string) {
  const username = useAppSelector((state) => state.user.value);
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

export async function currentBranch(path: string) {
  const response = new Promise((resolve, reject) => {
    const command = new Command("git 2 args", ["branch", "--show-current"], {
      cwd: path,
    });
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
  return await response;
}

export async function fetch(path: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 1 args", ["fetch"], { cwd: path });
    command.on("close", () => resolve(result.toString()));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line + "\n"));
    command.stderr.on("data", (line) => result.push(line + "\n"));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function getDiffCommit(path: string, branch: string) {
  const response = new Promise((resolve, reject) => {
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
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.trim()));
    command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

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

export async function getLatestRemoteCommitHash(path: string, branch: string) {
  const response = new Promise<string>((resolve, reject) => {
    const command = new Command(
      "git 4 args",
      ["log", `origin/${branch}`, '--pretty=format:"%h"', "-1"],
      {
        cwd: path,
      },
    );
    let result: string;
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => {
      result = line.trim().replaceAll('"', "");
    });
    command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function getNumberOfCommitsNotPushed(path: string) {
  const response = await getAllCommit(path, "", "local");
  return response.length;
}

export async function getLastCommitMessage(path: string) {
  const response = new Promise((resolve, reject) => {
    const command = new Command("git 3 args", ["log", "-1", "--pretty=%B"], {
      cwd: path,
    });
    const result: string[] = [];
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.trim()));
    command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function getParent(path: string) {
  const response = new Promise((resolve, reject) => {
    const command = new Command("git 2 args", ["rev-parse", "--show-toplevel"], {
      cwd: path,
    });
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
  return await response;
}

export async function push(path: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 1 args", ["push"], { cwd: path });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}
export async function pull(path: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 1 args", ["pull"], { cwd: path });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function removeUntrackedAll(path: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 2 args", ["clean", "-f"], {
      cwd: path,
    });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function revertAll(path: string) {
  await removeUntrackedAll(path);
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 2 args", ["restore", "."], {
      cwd: path,
    });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function revertFile(path: string, filePath: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 2 args", ["restore", filePath], {
      cwd: path,
    });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function showChanged(path: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 2 args", ["diff", "--name-only"], {
      cwd: path,
    });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.trim().replace(/[\n\r]/g, "")));
    // command.stderr.on("data", (line) => console.log(`stderr: "${line}"`));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function showStaged(path: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 3 args", ["diff", "--name-only", "--cached"], {
      cwd: path,
    });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.trim().replace(/[\n\r]/g, "")));
    // command.stderr.on("data", (line) => console.log(`stderr: "${line}"`));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function ShowUntrackedFiles(path: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 3 args", ["ls-files", "--others", "--exclude-standard"], {
      cwd: path,
    });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.replace(/[\n\r]/g, "")));
    command.stderr.on("data", (line) => result.push(line.replace(/[\n\r]/g, "")));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function setSSLFalse() {
  const command = new Command("git ssl", ["config --global http.sslVerify false"]);
  await command.spawn().catch((error) => {
    console.error(error);
  });
}

export async function switchBranch(path: string, branch: string) {
  const response = new Promise((resolve, reject) => {
    const resultNormal: string[] = [];
    const resultReject: string[] = [];
    const command = new Command("git 3 args", ["switch", branch, "--progress"], {
      cwd: path,
    });
    command.on("close", () => {
      if (resultReject.length > 1) {
        const result = resultReject.join("").trim();
        const leadingError = /(^error:)([\S\s]+)(aborting)/gi;
        const newError = RegExp(leadingError).exec(result);
        if (newError) reject(new Error(newError?.[2].trim()));
        else resolve(result);
      }
      resolve(resultNormal);
    });
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (data) => resultNormal.push(data));
    command.stderr.on("data", (data) => resultReject.push(data));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function undoLastCommit(path: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 3 args", ["reset", "--soft", "HEAD^"], {
      cwd: path,
    });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => {
      reject(new Error(error));
    });
  });
  return await response;
}

export async function unstageAll(path: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 2 args", ["reset", "HEAD"], {
      cwd: path,
    });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}
export async function unstageFile(path: string, file: string) {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 3 args", ["restore", "--staged", file], {
      cwd: path,
    });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function version() {
  const response = new Promise((resolve, reject) => {
    const result: string[] = [];
    const command = new Command("git 1 args", ["--version"]);
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line.trim()));
    command.stderr.on("data", (line) => result.push(line.trim()));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}
