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
      console.error(`command error: "${error}"`);
      reject(new Error(error));
    });
    command.stdout.on("data", (data) => {
      isGitRepo = true;
    });
    command.stderr.on("data", (line) => {
      isGitRepo = false;
    });
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
  const command = new Command("git 1 args", ["push"], { cwd: path });
  command.on("close", (data) => {
    console.log(
      `command finished with code ${data.code} and signal ${data.signal}`
    );
  });
  command.on("error", (error) => console.error(`command error: "${error}"`));
  command.stdout.on("data", (line) => {
    console.log(`command stdout: "${line}"`);
  });
  command.stderr.on("data", (line) => {
    console.log(`command stderr: "${line}"`);
  });
  await command.spawn().catch((error) => {
    console.error(error);
  });
}
export async function pull(path) {
  const command = new Command("git 1 args", ["pull"], { cwd: path });
  command.on("close", (data) => {
    console.log(
      `command finished with code ${data.code} and signal ${data.signal}`
    );
  });
  command.on("error", (error) => console.error(`command error: "${error}"`));
  command.stdout.on("data", (line) => {
    console.log(`command stdout: "${line}"`);
  });
  command.stderr.on("data", (line) => {
    console.log(`command stderr: "${line}"`);
  });
  await command.spawn().catch((error) => {
    console.error(error);
  });
}

export async function clone(localRepo, remoteRepo) {
  const command = new Command("git 2 args", ["clone", remoteRepo], {
    cwd: localRepo,
  });
  command.on("close", (data) => {
    console.log(
      `command finished with code ${data.code} and signal ${data.signal}`
    );
  });
  command.on("error", (error) => console.error(`command error: "${error}"`));
  command.stdout.on("data", (line) => {
    console.log(`command stdout: "${line}"`);
  });
  command.stderr.on("data", (line) => {
    console.log(`command stderr: "${line}"`);
  });
  await command.spawn().catch((error) => {
    console.error(error);
  });
}

export async function status(path) {
  const command = new Command("git 1 args", ["status"], { cwd: path });
  command.on("error", (error) => console.error(`command error: "${error}"`));
  command.stdout.on("data", (data) => {
    console.log(data);
  });
  command.stderr.on("data", (line) => {
    console.log(`command stderr: "${line}"`);
  });
  await command.spawn().catch((error) => {
    console.error(error);
  });
}

export async function currentBranch(path) {
  const regex = /(?:on branch) ([\S\s]+)/gi;
  const command = new Command("git 1 args", ["status"], { cwd: path });
  const response = new Promise((resolve, reject) => {
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
    command.stderr.on("data", (line) => {
      console.log(`command stderr: "${line}"`);
    });
    command.spawn().catch((error) => {
      console.error(error);
      reject(new Error(error));
    });
  });
  const result = await response.catch((error) => {
    return error(error);
  });
  return result;
}

export async function branchList(path) {
  const command = new Command("git 2 args", ["branch", "-r"], { cwd: path });
  const result = new Promise((resolve, reject) => {
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
    command.on("close", () => {
      resolve(result);
    });
    command.spawn().catch((error) => {
      console.error(error);
    });
  });
  const response = await result.catch((error) => {
    console.error(error);
  });
  return response;
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
    command.stderr.on("data", (line) => {
      console.log(`command stderr: "${line}"`);
    });
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

export async function commitAll(path, message) {
  const response = new Promise((resolve, reject) => {
    const command = new Command("git 3 args", ["commit", "-m", message], {
      cwd: path,
    });
    command.on("close", (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
      resolve(data);
    });
    command.on("error", (error) => console.error(`command error: "${error}"`));
    command.stdout.on("data", (line) => {
      console.log(`command stdout: "${line}"`);
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
