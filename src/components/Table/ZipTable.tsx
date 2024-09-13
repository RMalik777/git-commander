import { open } from "@tauri-apps/api/shell";

import { Button } from "@/components/ui/button";
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
  setFilteredFileList,
}: Readonly<{
  fileList: FileList[];
  filteredFileList: FileList[];
  setFileList: (fileList: FileList[]) => void;
  setFilteredFileList: (fileList: FileList[]) => void;
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
          <TableHead>File/Folder Name</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-center">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredFileList?.length > 0 ?
          filteredFileList?.map((item, index) => (
            <TableRow key={item.path}>
              <TableCell className="">{index + 1}</TableCell>
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
                      const newFiltered = [...filteredFileList];
                      const tempFiltered = newFiltered[index];
                      newFiltered[index] = newFiltered[index - 1];
                      newFiltered[index - 1] = tempFiltered;
                      setFilteredFileList(newFiltered);
                      const newList = [...fileList];
                      const toSwap1 = newList.findIndex(
                        (find) => find.path === newFiltered[index].path
                      );
                      const toSwap2 = newList.findIndex(
                        (find) => find.path === newFiltered[index - 1].path
                      );
                      const temp = newList[toSwap1];
                      newList[toSwap1] = newList[toSwap2];
                      newList[toSwap2] = temp;
                      setFileList(newList);
                    }}>
                    <ChevronUp />
                  </Button>
                  <Button
                    size="icon"
                    className="h-8 w-8"
                    variant="outline"
                    disabled={index === filteredFileList.length - 1}
                    onClick={() => {
                      const newFiltered = [...filteredFileList];
                      const tempFiltered = newFiltered[index];
                      newFiltered[index] = newFiltered[index + 1];
                      newFiltered[index + 1] = tempFiltered;
                      setFilteredFileList(newFiltered);
                      const newList = [...fileList];
                      const toSwap1 = newList.findIndex(
                        (find) => find.path === newFiltered[index].path
                      );
                      const toSwap2 = newList.findIndex(
                        (find) => find.path === newFiltered[index + 1].path
                      );
                      const temp = newList[toSwap1];
                      newList[toSwap1] = newList[toSwap2];
                      newList[toSwap2] = temp;
                      setFileList(newList);
                    }}>
                    <ChevronDown />
                  </Button>
                  <Button
                    size="icon"
                    className="h-8 w-8"
                    variant="destructive"
                    onClick={() => {
                      const newFiltered = [...filteredFileList];
                      newFiltered.splice(index, 1);
                      setFilteredFileList(newFiltered);
                      const newList = [...fileList];
                      const toDelete = newList.findIndex((find) => find.path === item.path);
                      newList.splice(toDelete, 1);
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
