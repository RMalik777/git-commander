import { useEffect, useRef, useState } from "react";

import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/shell";

import "@/lib/Monaco/userWorker";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { shikiToMonaco } from "@shikijs/monaco";
import { bundledLanguages, createHighlighter } from "shiki";

import { Button } from "@/components//ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

import { Save, FileWarning, X } from "lucide-react";

import { Icons } from "@/components/Icons";

const allLang = Object.keys(bundledLanguages);

export function Monaco({
  path,
  setPath,
}: Readonly<{ path: string; setPath: React.Dispatch<React.SetStateAction<string>> }>) {
  const { toast } = useToast();
  const extension = path.split(".").pop() ?? "";
  const fileName = path.split("\\").pop() ?? "";
  const parentFolder = path.split("\\").slice(0, -1).join("\\");
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [currentData, setCurrentData] = useState("");
  const monacoEl = useRef(null);

  /**
   * SHIKI currently disabled because of a performance issue when you load all languages. If you use a specific language, you can enable it, but when you open a file with a different language, it won't highlight the syntax.
   *
   * How to load SHIKI:
   * https://shiki.matsu.io/packages/monaco
   */
  //eslint-disable-next-line
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
     * SHIKI currently disabled due to a reason listed above
     */
    // await loadShiki();

    let data = "";
    if (path) {
      data = await readTextFile(path);
      setCurrentData(data);
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

  const [isValid, setIsValid] = useState(true);
  async function loadContent() {
    let data = "";
    if (path) {
      try {
        data = await readTextFile(path);
        setIsValid(true);
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
        console.error(error);
        setIsValid(false);
      }
    }
    setCurrentData(data);
  }
  useEffect(() => {
    loadContent();
  }, []);

  const [unsaved, setUnsaved] = useState(false);

  useEffect(() => {
    if (editor) {
      const listener = editor.onDidChangeModelContent(() => {
        const editorValue = editor.getValue();
        if (editorValue !== currentData) {
          setUnsaved(true);
        } else {
          setUnsaved(false);
        }
      });
      return () => listener.dispose();
    }
  }, [editor?.getValue()]);

  async function saveContent() {
    const content = editor?.getValue();
    if (content && path) {
      try {
        await writeTextFile(path, content);
        toast({
          title: "Saved",
          description: (
            <p>
              <code className="rounded bg-neutral-50/80 p-1 dark:bg-neutral-800/80">{path}</code>{" "}
              saved.
            </p>
          ),
        });
        setUnsaved(false);
        setCurrentData(content);
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
  }
  return isValid ?
      <>
        <TooltipProvider delayDuration={100}>
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="group min-h-10 min-w-10"
                    onClick={async () => await saveContent()}>
                    <Save />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save</p>
                </TooltipContent>
              </Tooltip>

              <p
                className={
                  (unsaved ? "visible opacity-100" : "invisible opacity-0") +
                  " font-medium duration-200 ease-out starting:opacity-0"
                }>
                Warning! you have unsaved changes
              </p>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="group min-h-10 min-w-10"
                  onClick={async () => {
                    window.history.replaceState({}, "");
                    sessionStorage.removeItem("editorActive");
                    setPath("");
                  }}>
                  <X />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <div
          className="h-full w-full"
          ref={monacoEl}
          onKeyDown={async (e) => {
            if (e.ctrlKey && e.key == "s") {
              await saveContent();
            }
          }}></div>
      </>
    : <div className="flex h-fit min-h-full w-full flex-col items-center justify-center gap-1 md:gap-2">
        <FileWarning className="h-12 w-auto dark:text-white sm:h-14 md:h-16 lg:h-20" />
        <h1 className="text-center text-xl font-semibold tracking-tight sm:text-xl md:text-2xl lg:text-3xl">
          Failed to Read File
        </h1>
        <p className="max-w-prose text-center text-base leading-normal md:text-lg">
          The file you are trying to open is possibly can&apos;t be edited using editor (Image file,
          Video file, etc.)
        </p>
        <Button
          variant="outline"
          className="h-fit w-fit gap-4 whitespace-normal break-all text-left font-normal"
          onClick={async () => {
            try {
              await open(parentFolder);
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
              console.error(error);
            }
          }}>
          {Icons({ name: extension, className: "h-full w-auto py-1 hidden sm:block" })}
          <div className="flex flex-col">
            <span className="text-base font-medium">{fileName}</span>
            {path}
          </div>
        </Button>
      </div>;
}
