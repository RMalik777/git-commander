import { Command } from "@tauri-apps/api/shell";
import { useSelector } from "react-redux";

export async function addAll(path) {
  const command = new Command("git 2 args", ["add", "."], { cwd: path });
  await command.spawn().catch((error) => {
    console.error(error);
  });
}
export async function addFile(path, file) {
  const response = new Promise((resolve, reject) => {
    const command = new Command("git 2 args", ["add", file], { cwd: path });
    command.on("close", () => resolve());
    command.on("error", (error) => reject(new Error(error)));
    command.spawn().catch((error) => {
      console.error(error);
    });
  });
  return await response;
}

export async function branchList(path) {
  const response = new Promise((resolve, reject) => {
    const command = new Command("git 2 args", ["branch", "-a"], { cwd: path });
    const result = {
      local: [],
      remote: [],
    };
    command.on("error", (error) => console.error(`command error: "${error}"`));
    command.stdout.on("data", (data) => {
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

export async function checkGit(path) {
  let errorMsg = null;
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
      if (data.match(/fatal: not a git repository/gi))
        errorMsg = "Folder is not a git repository";
    });
    command.spawn().catch((error) => {
      errorMsg = error;
      console.error(error);
      reject(new Error(error));
    });
  });
  return await response;
}

export async function checkGitStatus(path) {
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

export async function clone(localRepo, remoteRepo, username) {
  configUsername(localRepo, username);
  const response = new Promise((resolve, reject) => {
    const result = [];
    const command = new Command(
      "git 3 args",
      ["clone", "--progress", remoteRepo],
      {
        cwd: localRepo,
      }
    );
    command.on("close", (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
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

export async function commit(path, message) {
  configUsername(path);
  const response = new Promise((resolve, reject) => {
    const result = [];
    const commmit = new Command("git 3 args", ["commit", "-m", message], {
      cwd: path,
    });
    commmit.on("close", (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
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

export async function commitAll(path, message) {
  await addAll(path);
  return await commit(path, message);
}

export async function configUsername(path, username) {
  const command = new Command(
    "git username",
    ["config", "user.name", username],
    {
      cwd: path,
    }
  );
  await command.spawn().catch((error) => {
    console.log(error);
    throw new Error(error);
  });
}
export async function configUsernameReplace(path) {
  const username = useSelector((state) => state.user.value);
  const command = new Command(
    "git username replace",
    ["config", "--replace-all", "user.name", username],
    { cwd: path }
  );
  await command.spawn().catch((error) => {
    console.error(error);
  });
}

export async function currentBranch(path) {
  const response = new Promise((resolve, reject) => {
    const command = new Command("git 2 args", ["branch", "--show-current"], {
      cwd: path,
    });
    let result;
    command.on("close", () => resolve(result));
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      reject(new Error(error));
    });
    command.stdout.on("data", (data) => (result = data.trim()));
    command.stderr.on("data", (line) =>
      console.log(`command stderr: "${line}"`)
    );
    command.spawn().catch((error) => {
      console.error(error);
      reject(new Error(error));
    });
  });
  return await response;
}

export async function getParent(path) {
  const response = new Promise((resolve, reject) => {
    const command = new Command(
      "git 2 args",
      ["rev-parse", "--show-toplevel"],
      {
        cwd: path,
      }
    );
    let result;
    command.on("close", () => resolve(result));
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      reject(new Error(error));
    });
    command.stdout.on(
      "data",
      (data) => (result = data.replace(/\//g, "\\").trim())
    );
    command.stderr.on("data", (line) =>
      console.log(`command stderr: "${line}"`)
    );
    command.spawn().catch((error) => {
      console.error(error);
      reject(new Error(error));
    });
  });
  return await response;
}

export async function push(path) {
  const response = new Promise((resolve, reject) => {
    const result = [];
    const command = new Command("git 1 args", ["push"], { cwd: path });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}
export async function pull(path) {
  const response = new Promise((resolve, reject) => {
    const result = [];
    const command = new Command("git 1 args", ["pull"], { cwd: path });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function removeUntrackedAll(path) {
  const response = new Promise((resolve, reject) => {
    const result = [];
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

export async function revertAll(path) {
  await removeUntrackedAll(path);
  const response = new Promise((resolve, reject) => {
    const result = [];
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

export async function revertFile(path, file) {
  const response = new Promise((resolve, reject) => {
    const result = [];
    const command = new Command("git 2 args", ["restore", file], {
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

export async function showChanged(path) {
  const response = new Promise((resolve, reject) => {
    const result = [];
    const command = new Command("git 2 args", ["diff", "--name-only"], {
      cwd: path,
    });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) =>
      result.push(line.trim().replace(/[\n\r]/g, ""))
    );
    // command.stderr.on("data", (line) => console.log(`stderr: "${line}"`));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function showStaged(path) {
  const response = new Promise((resolve, reject) => {
    const result = [];
    const command = new Command(
      "git 3 args",
      ["diff", "--name-only", "--cached"],
      {
        cwd: path,
      }
    );
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) =>
      result.push(line.trim().replace(/[\n\r]/g, ""))
    );
    // command.stderr.on("data", (line) => console.log(`stderr: "${line}"`));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function setSSLFalse() {
  const command = new Command("git ssl", [
    "config --global http.sslVerify false",
  ]);
  await command.spawn().catch((error) => {
    console.error(error);
  });
}

export async function switchBranch(path, branch) {
  const response = new Promise((resolve, reject) => {
    const resultNormal = [],
      resultReject = [];
    const command = new Command("git 2 args", ["switch", branch], {
      cwd: path,
    });
    command.on("close", () => {
      if (resultReject.length > 1) {
        const result = resultReject.join("").trim();
        const leadingError = /(^error:)([\S\s]+)(aborting)/gi;
        const newError = RegExp(leadingError).exec(result)[2];
        if (newError) reject(new Error(newError.trim()));
        else reject(new Error(result));
      }
      resolve(resultNormal);
    });
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (data) => resultNormal.push(data));
    command.stderr.on("data", (line) => resultReject.push(line));
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function undoLastCommit(path) {
  const response = new Promise((resolve, reject) => {
    const result = [];
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

export async function untrackedFiles(path) {
  const response = new Promise((resolve, reject) => {
    const result = [];
    const command = new Command("git 2 args", ["ls-files", "--others"], {
      cwd: path,
    });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) =>
      result.push(line.replace(/[\n\r]/g, ""))
    );
    command.stderr.on("data", (line) =>
      result.push(line.replace(/[\n\r]/g, ""))
    );
    command.spawn().catch((error) => reject(new Error(error)));
  });
  return await response;
}

export async function unstageAll(path) {
  const response = new Promise((resolve, reject) => {
    const result = [];
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
export async function unstageFile(path, file) {
  const response = new Promise((resolve, reject) => {
    const result = [];
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
