import { useEffect, useState } from "react";

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

import { ConfirmationDialog } from "@/components/Dialog/Confirmation";

import { ZipFunctionDialog } from "@/components/Dialog/ZipFunctionDialog";
import { ZipTableDialog } from "@/components/Dialog/ZipTableDialog";
import { ZipTable } from "@/components/Table/ZipTable";

import { FileList } from "@/lib/Types/fileList";

export function ZipView() {
  const [openDialog, setOpenDialog] = useState(false);
  const [fileList, setFileList] = useState<FileList[]>(
    sessionStorage.getItem("fileZipList") ?
      JSON.parse(sessionStorage.getItem("fileZipList") as string)
    : []
  );
  useEffect(() => {
    sessionStorage.setItem("fileZipList", JSON.stringify(fileList));
  }, [fileList]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compress File</CardTitle>
        <CardDescription>
          Add your file to the table and then sort it the way you want.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Label>Search</Label>
        <Input type="text" placeholder="Search file" />
        <ZipTable fileList={fileList} setFileList={setFileList} />
        <ConfirmationDialog
          message="This will clear the table"
          title="Are You Sure?"
          open={openDialog}
          setOpen={setOpenDialog}
          onConfirm={() => {
            setFileList([]);
            sessionStorage.removeItem("fileZipList");
          }}
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
