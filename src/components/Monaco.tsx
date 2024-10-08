import { useRef, useState, useEffect } from "react";

import { readTextFile } from "@tauri-apps/api/fs";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "@/lib/Monaco/userWorker";

import { createHighlighter, bundledLanguages } from "shiki";
import { shikiToMonaco } from "@shikijs/monaco";

export function Monaco({ path }: Readonly<{ path: string }>) {
  const extension = path.split(".").pop() || "";
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef(null);

  async function loadShiki() {
    // Create the highlighter, it can be reused
    const highlighter = await createHighlighter({
      themes: ["monokai"],
      langs: ["html"],

      warnings: false,
    });
    // Register the languageIds first. Only registered languages will be highlighted.
    monaco.languages.getLanguages().forEach((element) => {
      monaco.languages.register({ id: element.id });
    });
    // Register the themes from Shiki, and provide syntax highlighting for Monaco.
    shikiToMonaco(highlighter, monaco);
  }

  async function loadEditor() {
    await loadShiki();
    let data = "";
    if (path) {
      data = await readTextFile(path);
    }
    setEditor((editor) => {
      if (editor) return editor;
      return monaco.editor.create(monacoEl.current!, {
        value: data,
        language: "html",
        theme: "monokai",
        automaticLayout: true,
        wordWrap: "on",
      });
    });
  }
  useEffect(() => {
    if (monacoEl) {
      loadEditor();
    }
    return () => editor?.dispose();
  }, []);

  async function loadContent() {
    let data = "";
    if (path) {
      data = await readTextFile(path);
    }
    editor?.setValue(data);

    const langId = monaco.languages
      .getLanguages()
      .findIndex((lang) => lang.extensions?.find((ext) => ext === `.${extension}`));
    editor?.setModel(monaco.editor.createModel(data, monaco.languages.getLanguages()[langId].id));
    // monaco.editor.setModelLanguage(editor?.getModel(), monaco.languages.getLanguages()[langId].id);
  }
  useEffect(() => {
    loadContent();
  }, [path]);

  return <div className="h-full w-full border" ref={monacoEl}></div>;
}
