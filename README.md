# Git Commander

> [!IMPORTANT]
> This program doesn't include git binary. Make sure you have git installed on your system. If you don't have git installed, you can download it from [Git SCM](https://git-scm.com/)

## Download

Available in [release](https://github.com/RMalik777/git-commander/releases)

## Quick Start Dev

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

### Clone Project

```shell
git clone https://github.com/RMalik777/git-commander.git
cd git-commander
```

### Install Dependencies

```shell
npm i
```

### Run Development Build

```shell
npm run tauri dev
```

### Build Production App

```shell
npm run tauri build
```

The finished build will be located inside `./src-tauri/target/release/bundle` in the form of `.msi` inside msi folder and `.exe` inside nsis folder.

## How to use

> UNDER DEVELOPMENT

This guide will provide a basic information on how to use Git Commander.\
If you haven't download the app, you can download the latest version from the [release page](https://github.com/RMalik777/git-commander/releases).

### Initial Setup

Interactive tutorial available inside the application. Access the tutorial by clicking the `Help` button or ![HelpIcon](https://unpkg.com/lucide-static@latest/icons/circle-help.svg) on the left menu bar.

### Functionality

There are a couple things you can do with Git Commander:

#### Quick Access Toolbar

The quick access toolbar is located at the top of the app. It contains the following buttons:

##### Current Repository and Branch

The top centre of the app displays the current repository and branch you are in. If you haven't opened any repository, it will display `No Repository Opened`.

##### Branch ![Branch](https://unpkg.com/lucide-static@latest/icons/git-branch.svg)

To change branch in the repository, click the icon. After that, the popup will appear and you can choose the branch you want to switch to. If there are still unstaged changes, you can't switch branch before committing the changes.

##### Pull ![Pull](https://unpkg.com/lucide-static@latest/icons/arrow-down-to-line.svg)

Pull and integrate changes from the remote repository to the local repository.

##### Push ![Push](https://unpkg.com/lucide-static@latest/icons/arrow-up-from-line.svg)

Push changes from the local repository to the remote repository

##### Undo ![Undo](https://unpkg.com/lucide-static@latest/icons/undo-2.svg)

Undo last commit but keeping the changes made.

> [!NOTE]
> Undoing commit that has been pushed to the remote repository is not recommended. If you want to undo a commit that has been pushed to the remote repository, you should use the `revert` command instead.

#### Open Repository

##### From Local Repo

If you already clone a repository, you can open it by clicking the `Open Repository` button. A dialog will pop up and you can select location where you store your repository.

##### From Remote Repo

If you haven't cloned a repository, you can clone it by clicking the `Clone` button. A dialog will appear, and you can input the repository URL or choose from dropdown (which you can add your own) and the local directory you want to clone the repository to.

##### Close Repo

If you close the repo, it won't delete the repo. The repo will still be stored in the same location you saved it. To delete your repo, you have to delete it manually from the file explorer.

#### Staging

Before you can commit a file, you need to stage (add) it first. To stage the changes you've made, go to staging page and click the plus icon beside the file you want to stage.

#### Commit

To commit changes, enter the commit message in the input field, make sure you follow the commit message format. After that, click the `Commit` button. The changes will be committed to the local repository. After you commit the changes, you can push the changes to the remote repository by clicking the `Push` icon.

## Development

### Prerequisite

### IDE

Recommended IDE: [Visual Studio Code](https://code.visualstudio.com/)

#### Dependencies

##### Rust

1. Download latest [Rust](https://www.rust-lang.org/)
2. Follow the installation guide
3. If you use Visual Studio Code, install the [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) extension

##### Diesel CLI

1. Follow Instruction from [Diesel Docs](https://diesel.rs/guides/getting-started)
2. When installing Diesel CLI, only install the SQLite features

   ```shell
   cargo install diesel_cli --no-default-features --features sqlite
   ```

##### SQLite

1. Download [SQLite](https://www.sqlite.org/download.html)
   Choose the download file based on your operating system.

   - Download source code\
     Example: `sqlite-amalgamation-3450200.zip`
   - Download precompiled binaries\
     Example: `sqlite-dll-win-x64-3450200.zip`.

2. Extract both file into the same folder
3. Open **Developer Command Prompt for VS 2017/2019/2022** by typing Developer Command in Windows Search (you will need [Visual Studio](https://visualstudio.microsoft.com/vs/)) [^1]
4. Run inside the terminal

   ```shell
   lib /DEF:sqlite3.def /OUT:sqlite3.lib /MACHINE:x64
   ```

5. If you want to validate the DB structure, edit, and changed data inside the DB by using GUI tools. You can use [DB Browser for SQLite](https://sqlitebrowser.org/dl/)

[^1]: <https://gist.github.com/zeljic/d8b542788b225b1bcb5fce169ee28c55>

#### Setting Up

> [!IMPORTANT]
> Make sure you complete the steps in [Dependencies](#dependencies) before continuing.

##### Default Path for the Database

Inside `db.rs`, there will be a `get_db_path` function. If you want to change the directory into the directory you want. For the list of all available directory, check [dirs documentation](https://crates.io/crates/dirs#features). This will be the location for the production database when you build the app.

```rust
// db.rs
fn get_db_path() -> String {
    let home_dir = dirs::document_dir().unwrap();
    home_dir.to_str().unwrap().to_string() + "/Git-Commander/database.sqlite"
}
```

From the code above, it will create the database file inside your documents folder for example: `C:/Users/<Your_Username>/Documents/DashOne/database.sqlite`

##### Migration and Database

If you new to Diesel and Rust, follow the tutorial on [Diesel Getting Started Page](https://diesel.rs/guides/getting-started)

1. Rename the `.env.example` file (located inside `/src-tauri`) to `.env`
2. Change the value of `DATABASE_URL` to choose a location for your new database, OR\
   Simply run this command in the terminal to create `.env` file and the location simultaneously

   ```shell
     echo DATABASE_URL="PATH FOR YOUR DATABASE" > .env
     #Change the value based on the file location
   ```

   To make it easy to maintain, the default value used is in `C:/Users/<username>/Documents/Git-Commander/database.sqlite`.

> [!NOTE]
> If you want to change the path, make sure the file path is the same as the one in the `db.rs`. Make sure to change the path in both files.

3. Run the command below to create a database

   ```shell
   diesel setup
   ```

4. Run Migration

   ```shell
   diesel migration run
   ```

   The command above will run migration based on file inside `/src-tauri/migrations` folder. To undo (revert) the migrations

   ```shell
   diesel migration revert
   ```

### Front End

Built with [React](https://react.dev/) with UI using [shadcn/ui](https://ui.shadcn.com/). Typescript (`.tsx`) is recommended but not required if you prefer JavaScript(`.jsx`).

#### Pages

To create a new page, put the file inside `/src/routes/pages`. Git Commander used [React Router](https://reactrouter.com/en/main) for routing so add the pages inside the route in `/src/main.jsx`.

#### Components

Components are located inside `/src/components`.

#### shadcn/ui

To use shadcn/ui, go to [shadcn/ui docs](https://ui.shadcn.com/docs/components) and choose the components you want to install. The installed components is located inside `/src/components/ui`

### Git Command

All command related got Git are located inside `/src/lib/git.js`.
Build using Tauri [Tauri Shell API](https://tauri.app/v1/api/js/shell#command). All git commands available can be seen in [Git Documentation](https://git-scm.com/docs)\
List of all command:

<!-- prettier-ignore-start -->
| Function Name  | Parameter | Git Command                       | Notes |
| -------------- | --------- | --------------------------------- | ----- |
|`addAll`|`path`|`git add .`|Adding (staging) all changed files.|
|`addFile`|`path`, `file`|`git add <file_name>`|Adding (staging) specific file.|
|`branchList`|`path`|`git branch -a`|Return a list of all branch .available. Parameter `-a` is used to get all the available branch local and remote.|
|`checkGit`| `path`| `git status`|Checking whether a opened folder is a git repository or not.|
|`clone`|`localRepo`, `remoteRepo`|`git clone <remoteRepo>`|Clone a remote repository into a local directory.|
|`commit`|`path`, `message`|`git commit -m <message>`|Commit all staged changes.|
|`commitAll`|`path`, `message`|`git add .` + `git commit -m <message>`|Add all changed item and commit it directly.|
| `configUsername` | `path`    | `git config user.name <username>` |Only `path` used as parameter because this function is only setting the user.name on **local** config and **global** config. The username is handled by Redux.|
|`configUsernameReplace` |`path`|`git config --replace-all user.name <username>`|For changing username, if the git require replace all parameter. <br/> **(Unused)**|
|`currentBranch`|`path`|`git branch --show-current`|Get the current branch.|
|`getParent`|`path`|`git rev-parse --show-toplevel`|Get the parent git repository if the current repository is not the parent|
|`pull`|`path`|`git pull`||
|`push`|`path`|`git push`||
|`removeUntrackedFile`|`path`|`git clean -f`|Remove untracked file (new file that hasn't been committed)|
|`removeAll`|`path`|`git restore .`|Revert all changes (including untracked files). This function also call `removeUntrackedFile`|
|`revertFile`|`path`, `file`|`git restore <file>`|Revert all the changes made into the file **(proceed with caution, this action is irreversible)**.|
|`setSSLFalse`|`-`|`git config --global http.sslVerify false`|For disabling SSL Verification.|
|`showChanged`|`path`|`git diff --name-only`|Show all changed file made.|
|`showStaged`|`path`|`git diff --name-only --cached`|Show all staged files.|
|`showUntracked`|`path`|`git ls-files --others --exclude-standard`|Show all untracked files.|
|`switchBranch`|`path`, `branch`|`git switch <branch>`|Change branch.|
|`undoLastCommit`|`path`|`git reset --soft HEAD^`|Undo last commit to a last commit known. Option `--soft` to keep all the files untouched. Option `HEAD^` refer to a last commit.|
|`unstageAll`|`path`|`git reset HEAD`|Undo all staged file. No option so the method is default (`--mixed`). HEAD is refering to the current HEAD.|
|`unstageFile`|`path`, `file`|`git restore --staged <file>`|Undo staged but only one specific file.|
<!-- prettier-ignore-end -->

### Database TS Call

Located inside `/src/lib/database.ts`, the function is built using [Tauri Invoke API](https://tauri.app/v1/guides/features/command/). The function will invoke (call) the handler function inside rust file located in `/src-tauri/src/handler`. The Handler then will process the input (if any) and then call the repository function to query the db.\
Types available inside `/src/lib/Types/repo.ts`

| Function Name          | Parameter            | Return                  |
| ---------------------- | -------------------- | ----------------------- |
| `checkNameDup`         | `repoName`           | `Promise<boolean>`      |
| `checkUrlDup`          | `repoUrl`            | `Promise<boolean>`      |
| `deleteAllRemoteRepo`  | `-`                  | `Promise<void>`         |
| `deleteRemoteRepoById` | `id`                 | `Promise<void>`         |
| `getAllRepo`           | `-`                  | `Promise<RepoFormat[]>` |
| `getRepoById`          | `id`                 | `Promise<RepoFormat>`   |
| `insertIntoRepo`       | `repoName`,`repoUrl` | `Promise<void>`         |

### Backend (Rust)

### Database

This program use SQLite as the database. When you clone repository, the database is not provided but you can build it.\
On `/src-tauri` folder, there will be a file name `.env.example`. Copy the file and rename it to `.env`. The default path is the same path that reference for the production database (reference inside `/src-tauri/src/db.rs`) which is `C:/Users/<username>/Documents/Git-Commander/database.sqlite`. You can change the path to your desired path if you want.

#### Migrations

## References

### Built With

- [![Git][GitImg]](https://git-scm.com/)
- [![React][ReactImg]](https://react.dev/)
- [![ReactRouter][ReactRouterImg]](https://reactrouter.com/en/main)
- [![Redux][ReduxImg]](https://redux.js.org/)
- [![Rust][RustImg]](https://www.rust-lang.org/)
- [![ShadUi][ShadUiImg]](https://ui.shadcn.com/)
- [![Sqlite][SqliteImg]](https://www.sqlite.org/)
- [![Tailwind][TailwindImg]](https://www.rust-lang.org/)
- [![Tauri][TauriImg]](https://tauri.app/)
- [![Vite][ViteImg]](https://vitejs.dev/)

[GitImg]: https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white
[ReactImg]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[ReactRouterImg]: https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white
[ReduxImg]: https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white
[RustImg]: https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white
[ShadUiImg]: https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white
[SqliteImg]: https://img.shields.io/badge/Sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white
[TauriImg]: https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=Tauri&logoColor=white
[TailwindImg]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[ViteImg]: https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E
