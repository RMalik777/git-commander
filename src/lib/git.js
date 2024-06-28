import { Command } from "@tauri-apps/api/shell";

export async function checkGit(path) {
  let errorMsg = null;
  let isGitRepo = false;
  const response = new Promise((resolve, reject) => {
    const command = new Command("git 1 args", ["status"], { cwd: path });
    command.on("close", (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
      resolve({ isGitRepo, errorMsg });
    });
    command.on("error", (error) => {
      console.error(error);
      reject(new Error(error));
    });
    command.stdout.on("data", () => (isGitRepo = true));
    command.stderr.on("data", () => (isGitRepo = false));
    command.spawn().catch((error) => {
      errorMsg = error;
      console.error(error);
      reject(new Error(error));
    });
  });
  return await response;
}

export async function configUsername(username) {
  const command = new Command("git username", [
    "config --global user.name",
    username,
  ]);
  await command.spawn().catch((error) => {
    console.error(error);
  });
}

export async function setSSLFalse() {
  const command = new Command("git ssl", [
    "config --global http.sslVerify false",
  ]);
  await command.spawn().catch((error) => {
    console.error(error);
  });
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

export async function clone(localRepo, remoteRepo) {
  const response = new Promise((resolve, reject) => {
    const result = [];
    const command = new Command("git 2 args", ["clone", remoteRepo], {
      cwd: localRepo,
    });
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
    command.stdout.on("data", (line) => result.push(line));
    command.stderr.on("data", (line) => result.push(line));
    command.spawn().catch((error) => {
      console.error(error);
      reject(new Error(error));
    });
  });
  return await response;
}

export async function status(path) {
  const response = new Promise((resolve, reject) => {
    const result = [];
    const command = new Command("git 1 args", ["status"], { cwd: path });
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      reject(new Error(error));
    });
    command.stdout.on("data", (data) => console.log(data));
    command.stderr.on("data", (line) =>
      result.push(line.replace(/[\n\r]/g, ""))
    );
    command.spawn().catch((error) => {
      console.error(error);
      reject(new Error(error));
    });
  });
  return await response;
}

export async function currentBranch(path) {
  const response = new Promise((resolve, reject) => {
    const regex = /(?:on branch) ([\S\s]+)/gi;
    const command = new Command("git 1 args", ["status"], { cwd: path });
    let result;
    command.on("error", (error) => {
      console.error(`command error: "${error}"`);
      reject(new Error(error));
    });
    command.stdout.on("data", (data) => {
      if (data.match(regex)) {
        result = RegExp(regex).exec(data)[1];
        resolve(result.trim());
      }
    });
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

export async function branchList(path) {
  const response = new Promise((resolve, reject) => {
    const command = new Command("git 2 args", ["branch", "-r"], { cwd: path });
    const result = [];
    command.on("error", (error) => console.error(`command error: "${error}"`));
    command.stdout.on("data", (data) => {
      const toPush = data
        .replace(/[*+]/g, "")
        .replace(/origin\//gi, "")
        .trim();
      if (toPush != "HEAD -> main") result.push(toPush);
    });
    command.stderr.on("data", (line) => {
      console.log(`command stderr: "${line}"`);
      reject(new Error(line));
    });
    command.on("close", () => resolve(result));
    command.spawn().catch((error) => console.error(error));
  });
  return await response;
}

export async function switchBranch(path, branch) {
  const command = await new Command("git 2 args", ["switch", branch], {
    cwd: path,
  }).execute();
  console.log(command);
}

export async function showChanged(path) {
  const response = new Promise((resolve, reject) => {
    const result = [];
    const command = new Command("git 2 args", ["diff", "--name-only"], {
      cwd: path,
    });
    command.on("close", () => resolve(result));
    command.on("error", (error) => reject(new Error(error)));
    command.stdout.on("data", (line) => {
      result.push(line.trim().replace(/[\n\r]/g, ""));
    });
    command.stderr.on("data", (line) =>
      console.log(`command stderr: "${line}"`)
    );
    command.spawn().catch((error) => {
      reject(new Error(error));
    });
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
    command.stdout.on("data", (line) => {
      result.push(line.trim().replace(/[\n\r]/g, ""));
    });
    command.stderr.on("data", (line) => {
      console.log(`command stderr: "${line}"`);
    });
    command.spawn().catch((error) => {
      reject(new Error(error));
    });
  });
  return await response;
}

export async function addAll(path) {
  const command = new Command("git 2 args", ["add", "."], { cwd: path });
  await command.spawn().catch((error) => {
    console.error(error);
  });
}
export async function addFile(path, file) {
  const command = new Command("git 3 args", ["add", file], { cwd: path });
  await command.spawn().catch((error) => {
    console.error(error);
  });
}

export async function commit(path, message) {
  const response = new Promise((resolve, reject) => {
    const commmit = new Command("git 3 args", ["commit", "-m", message], {
      cwd: path,
    });
    commmit.on("close", (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
      resolve(data);
    });
    commmit.on("error", (error) => console.error(`command error: "${error}"`));
    commmit.stdout.on("data", (line) =>
      console.log(`command stdout: "${line}"`)
    );
    commmit.stderr.on("data", (line) =>
      console.log(`command stderr: "${line}"`)
    );
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

export async function undoLastCommit(path) {
  const response = new Promise((resolve, reject) => {
    const result = [];
    const command = new Command("git 2 args", ["reset", "--soft"], {
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

export async function undoStaged(path) {
  const response = new Promise((resolve, reject) => {
    const result = [];
    const command = new Command("git 1 args", ["reset"], {
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
