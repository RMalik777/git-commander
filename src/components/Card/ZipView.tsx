import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import { ConfirmationDialog } from "@/components/Dialog/Confirmation";
import { ZipFunctionDialog } from "@/components/Dialog/ZipFunctionDialog";
import { ZipTableDialog } from "@/components/Dialog/ZipTableDialog";
import { ZipTable } from "@/components/Table/ZipTable";

import type { FileList } from "@/lib/Types/fileList";

export function ZipView() {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [fileList, setFileList] = useState<FileList[]>(
    sessionStorage.getItem("fileZipList") ?
      JSON.parse(sessionStorage.getItem("fileZipList") as string)
    : []
  );
  const [filteredFileList, setFilteredFileList] = useState<FileList[]>(fileList);
  const [search, setSearch] = useState("");
  useEffect(() => {
    setFilteredFileList(
      fileList.filter((item) => {
        return (
          item?.path.toLowerCase().includes(search.toLowerCase()) ||
          item?.name?.toLowerCase().includes(search.toLowerCase())
        );
      })
    );
  }, [search]);
  useEffect(() => {
    sessionStorage.setItem("fileZipList", JSON.stringify(fileList));
    setFilteredFileList(fileList);
    setFilteredFileList(
      fileList.filter((item) => {
        return (
          item?.path.toLowerCase().includes(search.toLowerCase()) ||
          item?.name?.toLowerCase().includes(search.toLowerCase())
        );
      })
    );
  }, [fileList]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compress</CardTitle>
        <CardDescription>
          Add your file or folder to the table and then sort it the way you want.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col items-stretch justify-start gap-2 sm:flex-row sm:items-center md:justify-end">
          <Label>Search</Label>
          <Input
            disabled={fileList.length == 0}
            className="w-full md:w-1/2"
            type="text"
            placeholder="Search file or folder"
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            disabled={fileList.length == 0}
            variant="destructive"
            size="sm"
            onClick={() => setOpenDialog(true)}>
            Clear Table
          </Button>
        </div>
        <ConfirmationDialog
          message="This will clear all the file and folder inside the table"
          title="Are You Sure?"
          open={openDialog}
          setOpen={setOpenDialog}
          onConfirm={() => {
            setFileList([]);
            sessionStorage.removeItem("fileZipList");
            toast({
              title: "Table Cleared",
            });
          }}
        />
        <ZipTable
          fileList={fileList}
          filteredFileList={filteredFileList}
          setFileList={setFileList}
          setFilteredFileList={setFilteredFileList}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <ZipTableDialog add="File" fileList={fileList} setFileList={setFileList} />
          <ZipTableDialog add="Folder" fileList={fileList} setFileList={setFileList} />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <ZipFunctionDialog fileList={fileList} />
      </CardFooter>
    </Card>
  );
}
