# Quick Start

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Clone Project

```shell
git clone https://github.com/RMalik777/git-commander.git
cd git-commander
```

## Install Dependencies

```shell
npm i
```

## Run Development Build

```shell
npm run tauri dev
```

## Build Production App

```shell
npm run tauri build
```

The finished build will be located inside `./src-tauri/target/release/bundle` in the form of `.msi` inside msi folder and `.exe` inside nsis folder.

# Development

## Git Command

All command related got Git are located inside `/src/lib/git.js`.
Build using Tauri [Tauri Shell API](https://tauri.app/v1/api/js/shell#command)
List of command:

| Function Name  | Parameter | Git Command                       | Notes |
| -------------- | --------- | --------------------------------- | ----- |
|`addAll`|`path`|`git add .`|Adding (staging) all changed files|
|`addFile`|`path`, `file`|`git add <file_name>`|Adding (staging) specific file|
|`branchList`|`path`|`git branch -a`|Return a list of all branch available. Parameter `-a` is used to get all the available branch local and remote|
|`checkGit`| `path`| `git status`|Checking whether a opened folder is a git repository or not|
|`clone`|`localRepo`, `remoteRepo`|`git clone <remoteRepo>`|Clone a remote repository into a local directory|
|`commit`|`path`, `message`|`git commit -m <message>`|Commit all staged changes |
|`commitAll`|`path`, `message`|`git add .` + `git commit -m <message>`|Add all changed item and commit it directly|
| `configUsername` | `path`    | `git config user.name <username>` |Only `path` used as parameter because this function is only setting the user.name on **local** config and **global** config. The username is handled by Redux|
|`configUsernameReplace` |`path`|`git config --replace-all user.name <username>`|For changing username, if the git require replace all parameter <br/> **(Unused)**|
|`currentBranch`|`path`|`git branch --show-current`|Get the current branch|
|`pull`|`path`|`git pull`||
|`push`|`path`|`git push`||
|`revertFile`|`path`, `file`|`git restore <file>`|Revert all the changes made into the file (proceed with caution, this action is irreversible)|
|`setSSLFalse`|`-`|`git config --global http.sslVerify false`|For disabling SSL Verification.|
|`showChanged`|`path`|`git diff --name-only`|Show all changed file made|
|`showStaged`|`path`|`git diff --name-only --cached`|Show all staged files|
|`switchBranch`|`path`, `branch`|`git switch <branch>`|Change branch|
|`undoLastCommit`|`path`|`git reset --soft HEAD^`|Undo last commit to a last commit known. Option `--soft` to keep all the files untouched. Option `HEAD^` refer to a last commit|
|`unstageAll`|`path`|`git reset HEAD`|Undo all staged file. No option so the method is default (`--mixed`). HEAD is refering to the current HEAD |
|`unstageFile`|`path`, `file`|`git restore --staged <file>`|Undo staged but only one specific file|

# References

## Built With

- [![Git][GitImg]](https://git-scm.com/)
- [![React][ReactImg]](https://react.dev/)
- [![ReactRouter][ReactRouterImg]](https://reactrouter.com/en/main)
- [![Redux][ReduxImg]](https://redux.js.org/)
- [![Rust][RustImg]](https://www.rust-lang.org/)
- [![ShadUi][ShadUiImg]](https://ui.shadcn.com/)
- [![Sqlite][SqliteImg]](https://www.sqlite.org/)
- [![Tauri][TauriImg]](https://tauri.app/)
- [![Tailwind][TailwindImg]](https://www.rust-lang.org/)
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
