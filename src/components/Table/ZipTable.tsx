import { open } from "@tauri-apps/plugin-shell";
import { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ChevronDown, ChevronUp, Folder, Minus } from "lucide-react";

import { FileList } from "@/lib/Types/fileList";

import { Icons } from "@/components/Icons";

// import { useAutoAnimate } from "@formkit/auto-animate/react";

// ADD SIZE
export function ZipTable({
  fileList,
  filteredFileList,
  setFileList,
}: Readonly<{
  fileList: FileList[];
  filteredFileList: FileList[];
  setFileList: (fileList: FileList[]) => void;
}>) {
  /**
   * useAutoAnimate is disabled because it's still have some issue
   *
   * If the issue is fixed, you can uncomment the import and the line below. Also, add `ref={parent}` to the TableBody
   * const [parent] = useAutoAnimate({ easing: "ease-out" });
   *
   * related issue: https://github.com/formkit/auto-animate/issues/7
   */
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(0);
  const [editValue, setEditValue] = useState(0);

  const form = useRef<HTMLFormElement>(null);

  return (
    <Table className="mb-4">
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">No</TableHead>
          <TableHead>File/Folder Name</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-center">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody
      // ref={parent}
      >
        {filteredFileList?.length > 0 ?
          filteredFileList?.map((item, index) => (
            <TableRow key={item.path}>
              <TableCell className="w-fit min-w-16 py-0 text-center">
                <>
                  {isEdit && editId == index ?
                    <form
                      ref={form}
                      className="h-full w-min min-w-full"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (editValue != index + 1) {
                          let newFiltered;
                          // If the new place is higher in the table
                          if (editValue < index + 1) {
                            newFiltered = filteredFileList.toSpliced(editValue - 1, 0, item);
                            newFiltered.splice(index + 1, 1);
                          } else {
                            newFiltered = filteredFileList.toSpliced(editValue, 0, item);
                            newFiltered.splice(index, 1);
                          }
                        }
                        setIsEdit(false);
                      }}>
                      <Input
                        className="h-full w-full p-0 px-0 py-1 text-center font-medium"
                        type="number"
                        min={1}
                        max={filteredFileList.length}
                        value={editValue}
                        onChange={(e) => setEditValue(parseInt(e.target.value))}
                        onBlur={() => form.current?.requestSubmit()}
                        autoFocus
                      />
                    </form>
                  : <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditValue(index + 1);
                        setEditId(index);
                        setIsEdit(true);
                      }}>
                      {index + 1}
                    </Button>
                  }
                </>
              </TableCell>
              <TableCell className="">
                <button
                  className="flex items-center gap-1 text-left font-semibold"
                  onClick={() => {
                    open(item.path);
                  }}>
                  {item.type == "Folder" ?
                    <Folder
                      size={16}
                      className="fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500"
                    />
                  : Icons({ name: item.name })}
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
                      [filteredFileList[index], filteredFileList[index - 1]] = [
                        filteredFileList[index - 1],
                        filteredFileList[index],
                      ];
                      const toSwap1 = fileList.findIndex(
                        (find) => find.path === filteredFileList[index].path
                      );
                      const toSwap2 = fileList.findIndex(
                        (find) => find.path === filteredFileList[index - 1].path
                      );
                      [fileList[toSwap1], fileList[toSwap2]] = [
                        fileList[toSwap2],
                        fileList[toSwap1],
                      ];
                      setFileList([...fileList]);
                    }}>
                    <ChevronUp />
                  </Button>
                  <Button
                    size="icon"
                    className="h-8 w-8"
                    variant="outline"
                    disabled={index === filteredFileList.length - 1}
                    onClick={() => {
                      [filteredFileList[index], filteredFileList[index + 1]] = [
                        filteredFileList[index + 1],
                        filteredFileList[index],
                      ];
                      const toSwap1 = fileList.findIndex(
                        (find) => find.path === filteredFileList[index].path
                      );
                      const toSwap2 = fileList.findIndex(
                        (find) => find.path === filteredFileList[index + 1].path
                      );
                      [fileList[toSwap1], fileList[toSwap2]] = [
                        fileList[toSwap2],
                        fileList[toSwap1],
                      ];
                      setFileList([...fileList]);
                    }}>
                    <ChevronDown />
                  </Button>
                  <Button
                    size="icon"
                    className="h-8 w-8"
                    variant="destructive"
                    onClick={() => {
                      filteredFileList.splice(index, 1);
                      const toDelete = fileList.findIndex((find) => find.path === item.path);
                      fileList.splice(toDelete, 1);
                      setFileList([...fileList]);
                    }}>
                    <Minus />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        : <TableRow>
            <TableCell colSpan={4} className="text-center">
              {fileList.length > 0 ? "No File or Folder Matched" : "No File or Folder Added"}
            </TableCell>
          </TableRow>
        }
      </TableBody>
      <TableCaption>
        File Name will be converted to{" "}
        <code className="rounded bg-neutral-100 text-neutral-700 duration-150 ease-out dark:bg-neutral-800 dark:text-neutral-200">
          xx_original-filename
        </code>
        {/* */}. xx is a 2 digit number
      </TableCaption>
    </Table>
  );
}
