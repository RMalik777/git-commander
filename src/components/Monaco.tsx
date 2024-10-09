import { useEffect, useRef, useState } from "react";

import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";

import "@/lib/Monaco/userWorker";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { shikiToMonaco } from "@shikijs/monaco";
import { bundledLanguages, createHighlighter } from "shiki";

import { Button } from "@/components//ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

import { Save } from "lucide-react";

const allLang = Object.keys(bundledLanguages);

export function Monaco({ path }: Readonly<{ path: string }>) {
  const { toast } = useToast();
  const extension = path.split(".").pop() ?? "";
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [currentData, setCurrentData] = useState("");
  const monacoEl = useRef(null);

  async function loadShiki() {
    // Create the highlighter, it can be reused
    const highlighter = await createHighlighter({
      themes: ["monokai"],
      langs: allLang, // or ['javascript', 'ruby', 'python', 'html', 'css']
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
    /**
     * SHIKI currently disabled due to a performance issue
     */
    // await loadShiki();
    let data = "";
    if (path) {
      data = await readTextFile(path);
    }
    const langId = monaco.languages
      .getLanguages()
      .find((lang) => lang.extensions?.find((ext) => ext === `.${extension}`));
    setEditor((editor) => {
      if (editor) return editor;
      return monaco.editor.create(monacoEl.current!, {
        value: data,
        language: langId?.id ?? "plaintext",
        theme: "vs-dark",
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
      setCurrentData(data);
    }
    editor?.setValue(data);

    const langId = monaco.languages
      .getLanguages()
      .findIndex((lang) => lang.extensions?.find((ext) => ext === `.${extension}`));
    editor?.setModel(monaco.editor.createModel(data, monaco.languages.getLanguages()[langId].id));
  }
  useEffect(() => {
    loadContent();
  }, [path]);

  return (
    <>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="group min-h-10 min-w-10"
              onClick={async () => {
                const content = editor?.getValue();
                if (content && path) {
                  try {
                    await writeTextFile(path, content);
                    toast({
                      title: "Saved",
                      description: (
                        <p>
                          <code className="rounded bg-neutral-50/80 p-1">{path}</code> saved.
                        </p>
                      ),
                    });
                  } catch (error) {
                    if (error instanceof Error) {
                      toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive",
                      });
                    } else {
                      toast({
                        title: "Error",
                        description: error?.toString(),
                        variant: "destructive",
                      });
                    }
                  }
                } else {
                  toast({
                    title: "Error",
                    description: content ? "No file path" : "No content to saved",
                    variant: "destructive",
                  });
                }
              }}>
              <Save />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="h-full w-full" ref={monacoEl}></div>
    </>
  );
}
