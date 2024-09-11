import type { FileEntry } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/shell";

import { ChevronDown, ChevronUp, Minus } from "lucide-react";

import { Icons } from "../Icons";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";

// import { useAutoAnimate } from "@formkit/auto-animate/react";

// ADD SIZE
export function ZipTable({
  fileList,
  setFileList,
}: Readonly<{
  fileList: FileEntry[];
  setFileList: (fileList: FileEntry[]) => void;
}>) {
  /**
   * useAutoAnimate is disabled because it's still have some issue
   *
   * If the issue is fixed, you can uncomment the import and the line below. Also, add `ref={parent}` to the TableBody
   * const [parent] = useAutoAnimate({ easing: "ease-out" });
   *
   * related issue: https://github.com/formkit/auto-animate/issues/7
   */
  return (
    <Table className="mb-4">
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>File Name</TableHead>
          <TableHead>File Location</TableHead>
          <TableHead className="text-center">Sort</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fileList.length > 0 ?
          fileList?.map((item, index) => (
            <TableRow key={item.path}>
              <TableCell className="">{index + 1}</TableCell>
              <TableCell className="">
                <button
                  className="flex items-center gap-1 text-left font-semibold"
                  onClick={() => {
                    open(item.path);
                  }}>
                  {Icons({ name: item.name })}
                  {item.name}
                </button>
              </TableCell>
              <TableCell className="break-all">{item.path}</TableCell>
              <TableCell>
                <div className="flex flex-col items-center justify-center gap-1 sm:flex-row">
                  <Button
                    size="icon"
                    className="h-8 w-8"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => {
                      const newList = [...fileList];
                      const temp = newList[index];
                      newList[index] = newList[index - 1];
                      newList[index - 1] = temp;
                      setFileList(newList);
                    }}>
                    <ChevronUp />
                  </Button>
                  <Button
                    size="icon"
                    className="h-8 w-8"
                    variant="outline"
                    disabled={index === fileList.length - 1}
                    onClick={() => {
                      const newList = [...fileList];
                      const temp = newList[index];
                      newList[index] = newList[index + 1];
                      newList[index + 1] = temp;
                      setFileList(newList);
                    }}>
                    <ChevronDown />
                  </Button>
                  <Button
                    size="icon"
                    className="h-8 w-8"
                    variant="destructive"
                    onClick={() => {
                      const newList = [...fileList];
                      newList.splice(index, 1);
                      setFileList(newList);
                    }}>
                    <Minus />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        : <TableRow>
            <TableCell colSpan={4} className="text-center">
              No file added
            </TableCell>
          </TableRow>
        }
      </TableBody>
      <TableCaption>
        File Name will be converted to{" "}
        <code className="rounded bg-neutral-100 text-neutral-700 duration-150 ease-out dark:bg-neutral-800 dark:text-neutral-200">
          xx_original-filename
        </code>
        . xx is a 2 digit number
      </TableCaption>
    </Table>
  );
}
