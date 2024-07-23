import DOMPurify from "dompurify";

import {
  AppWindow,
  Braces,
  Database,
  File,
  FileCode,
  FileMusic,
  FileText,
  FolderArchive,
  Image,
  Scale,
  SquarePlay,
  SquareTerminal,
  TypeOutline,
} from "lucide-react";

import {
  si7zip,
  siAstro,
  siBun,
  siC,
  siComposer,
  siCplusplus,
  siCss3,
  siDependabot,
  siDotenv,
  siDotnet,
  siEslint,
  siGit,
  siGo,
  siHtml5,
  siJavascript,
  siJenkins,
  siKotlin,
  siLess,
  siLit,
  siLua,
  siMarkdown,
  siMdx,
  siNodedotjs,
  siNpm,
  siPhp,
  siPnpm,
  siPostcss,
  siPreact,
  siPrettier,
  siPython,
  siQwik,
  siR,
  siReact,
  siRust,
  siSass,
  siSolid,
  siSvelte,
  siSwift,
  siTailwindcss,
  siTauri,
  siToml,
  siTypescript,
  siVite,
  siVitest,
  siVuedotjs,
  siYaml,
} from "simple-icons";

interface Params {
  name: string | undefined;
}

export function Icons(params: Readonly<Params>) {
  const extension = params.name?.split(".").pop()?.toLowerCase();
  const fileNameWithoutExt = params.name?.split(".");
  fileNameWithoutExt?.pop();
  const fileName = fileNameWithoutExt?.join(".").toLowerCase();

  const iconsClass = "h-4 w-4 min-w-4 min-h-4";
  const lucideClass = " text-current";
  const si_Class = " fill-current";

  let iconsVar;
  // DATABASE
  if (
    extension === "db" ||
    extension === "database" ||
    extension === "sql" ||
    extension === "mysql" ||
    extension === "sqlite"
  ) {
    return <Database className={iconsClass + lucideClass} />;
  }

  //? -------- PROGRAMMING LANGUAGES ---------
  // JS
  else if (extension === "js" || extension === "mjs" || extension === "cjs") {
    if (fileName?.startsWith("vite") || fileName === "vite.config") {
      iconsVar = siVite;
    } else if (fileName?.startsWith("vitest")) {
      iconsVar = siVitest;
    } else if (fileName?.startsWith(".prettier")) {
      iconsVar = siPrettier;
    } else if (fileName?.startsWith("eslint") || fileName === "eslintrc") {
      iconsVar = siEslint;
    } else if (
      fileName?.startsWith("tailwind") ||
      fileName === "tailwind.config"
    ) {
      iconsVar = siTailwindcss;
    } else if (
      fileName?.startsWith("postcss") ||
      fileName === "postcss.config"
    ) {
      iconsVar = siPostcss;
    } else if (fileName?.startsWith("astro") || fileName === "astro.config") {
      iconsVar = siAstro;
    } else {
      iconsVar = siJavascript;
    }
  }
  // TYPESCRIPT
  else if (extension === "ts") {
    if (fileName?.startsWith("vite") || fileName === "vite.config") {
      iconsVar = siVite;
    } else if (fileName?.startsWith("vitest")) {
      iconsVar = siVitest;
    } else if (fileName?.startsWith("eslint") || fileName === "eslintrc") {
      iconsVar = siEslint;
    } else if (
      fileName?.startsWith("tailwind") ||
      fileName === "tailwind.config"
    ) {
      iconsVar = siTailwindcss;
    } else if (
      fileName?.startsWith("postcss") ||
      fileName === "postcss.config"
    ) {
      iconsVar = siPostcss;
    } else {
      iconsVar = siTypescript;
    }
  }
  // MARKDOWN
  else if (extension === "md") {
    iconsVar = siMarkdown;
  }
  // C
  else if (extension === "c" || extension === "h") {
    iconsVar = siC;
  }
  // C++
  else if (extension === "cpp") {
    iconsVar = siCplusplus;
  }
  // CSS
  else if (extension === "css") {
    iconsVar = siCss3;
  }
  // HTML
  else if (extension === "html") {
    iconsVar = siHtml5;
  }
  // RUST
  else if (extension === "rs") {
    iconsVar = siRust;
  }
  // MDX
  else if (extension === "mdx") {
    iconsVar = siMdx;
  }
  // SHELL
  else if (extension === "sh" || extension === "bat") {
    return <SquareTerminal className={iconsClass} />;
  }
  // PHP
  else if (extension === "php") {
    iconsVar = siPhp;
  }
  // PYTHON
  else if (extension === "py") {
    iconsVar = siPython;
  }
  // KOTLIN
  else if (extension === "kt") {
    iconsVar = siKotlin;
  }
  // LUA
  else if (extension === "lua") {
    iconsVar = siLua;
  }
  // SWIFT
  else if (extension === "swift") {
    iconsVar = siSwift;
  }
  // TEXT
  else if (extension === "txt") {
    return <FileText className={iconsClass} />;
  }
  // GO
  else if (extension === "go") {
    iconsVar = siGo;
  }
  // R
  else if (extension === "r") {
    iconsVar = siR;
  }

  //? -------- CONFIGURATION FILES ---------
  // ENV
  else if (extension === "env") {
    iconsVar = siDotenv;
  } else if (extension === "example" || extension === "local") {
    if (fileName?.startsWith(".env")) {
      iconsVar = siDotenv;
    }
  }
  // LOCKFILE
  else if (extension === "node" || extension === "lock") {
    // COMPOSER
    if (fileName === "composer") {
      iconsVar = siComposer;
    }
    // CARGO
    else if (fileName === "cargo") {
      iconsVar = siRust;
    }
    // NODE
    else {
      iconsVar = siNodedotjs;
    }
  }
  // JSON
  else if (
    extension === "json" ||
    extension === "json5" ||
    extension === "jsonc"
  ) {
    if (fileName === "package" || fileName === "package-lock") {
      iconsVar = siNodedotjs;
    } else if (
      fileName?.startsWith("tsconfig") ||
      fileName === "tsconfig-base"
    ) {
      iconsVar = siTypescript;
    } else if (fileName?.startsWith("tauri")) {
      iconsVar = siTauri;
    } else if (fileName === "composer") {
      iconsVar = siComposer;
    } else {
      return <Braces className={iconsClass} />;
    }
  }
  // TOML
  else if (extension === "toml") {
    iconsVar = siToml;
  }
  // VITE
  else if (extension === "vite") {
    iconsVar = siVite;
  }
  // YAML
  else if (extension === "yaml" || extension === "yml") {
    if (
      fileName === "pnpm" ||
      fileName === "pnpmfile" ||
      fileName === "pnpm-lock" ||
      fileName === "pnpm-workspace"
    ) {
      iconsVar = siPnpm;
    } else if (fileName === "dependabot") {
      iconsVar = siDependabot;
    } else {
      iconsVar = siYaml;
    }
  }
  // XML
  else if (extension === "xml") {
    return <FileCode className={iconsClass} />;
  }
  //PRETTIER
  else if (
    extension === "prettier" ||
    extension === "prettierrc" ||
    extension === "prettierrc.json" ||
    extension === "prettierignore"
  ) {
    iconsVar = siPrettier;
  }
  // GIT
  else if (
    extension === "git" ||
    extension === "gitignore" ||
    extension === "gitattributes" ||
    extension === "gitmodules"
  ) {
    iconsVar = siGit;
  }
  // NPM
  else if (
    extension === "npm" ||
    extension === "npmrc" ||
    extension === "npmignore"
  ) {
    iconsVar = siNpm;
  }

  //? -------- FRAMEWORK ---------
  // DOTNET
  else if (extension === "aspx") {
    iconsVar = siDotnet;
  }
  // REACT
  else if (extension === "jsx" || extension === "tsx") {
    iconsVar = siReact;
  }
  // SCSS
  else if (extension === "scss" || extension === "sass") {
    iconsVar = siSass;
  }
  // LESS
  else if (extension === "less") {
    iconsVar = siLess;
  }
  // SVELTE
  else if (extension === "svelte") {
    iconsVar = siSvelte;
  }
  // QWIK
  else if (extension === "qwik") {
    iconsVar = siQwik;
  }
  // PREACT
  else if (extension === "preact") {
    iconsVar = siPreact;
  }
  // SOLID
  else if (extension === "solid") {
    iconsVar = siSolid;
  }
  // LIT
  else if (extension === "lit") {
    iconsVar = siLit;
  }
  // VUE
  else if (extension === "vue") {
    iconsVar = siVuedotjs;
  } else if (extension === "astro") {
    iconsVar = siAstro;
  }

  // --------- MISCELLANEOUS ---------
  else if (
    extension === "svg" ||
    extension === "png" ||
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "gif" ||
    extension === "webp" ||
    extension === "avif"
  ) {
    return <Image className={iconsClass} />;
  }
  // VIDEO
  else if (
    extension === "mp4" ||
    extension === "webm" ||
    extension === "hevc" ||
    extension === "mkv" ||
    extension === "mov" ||
    extension === "avi"
  ) {
    return <SquarePlay className={iconsClass} />;
  }
  // AUDIO
  else if (
    extension === "mp3" ||
    extension === "wav" ||
    extension === "flac" ||
    extension === "m4a" ||
    extension === "aac" ||
    extension === "ogg"
  ) {
    return <FileMusic className={iconsClass} />;
  }
  // APP
  else if (
    extension === "exe" ||
    extension === "dmg" ||
    extension === "app" ||
    extension === "apk" ||
    extension === "msi"
  ) {
    return <AppWindow className={iconsClass} />;
  }
  // PDF
  else if (extension === "pdf") {
    return <FileText className={iconsClass} />;
  }
  // ZIP
  else if (
    extension === "zip" ||
    extension === "rar" ||
    extension === "tar" ||
    extension === "gz" ||
    extension === "bz2" ||
    extension === "xz" ||
    extension === "zst"
  ) {
    return <FolderArchive className={iconsClass} />;
  }
  // 7ZIP
  else if (extension === "7z") {
    iconsVar = si7zip;
  }
  // TYPE
  else if (
    extension === "ttf" ||
    extension === "woff" ||
    extension === "woff2" ||
    extension === "otf"
  ) {
    return <TypeOutline className={iconsClass} />;
  }
  // JENKINS
  else if (extension === "jenkinsfile" || fileName === "jenkinsfile") {
    iconsVar = siJenkins;
  }
  // BUN
  else if (extension === "lockb") {
    iconsVar = siBun;
  }
  // LICENSE
  else if (extension === "license") {
    return <Scale className={iconsClass} />;
  }

  return iconsVar ?
      <div
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(iconsVar.svg) }}
        className={iconsClass + si_Class}
      />
    : <File className={iconsClass + lucideClass} />;
}
