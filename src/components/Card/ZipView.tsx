import { useEffect, useState } from "react";

import { FileEntry } from "@tauri-apps/api/fs";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ZipFunctionDialog } from "@/components/Dialog/ZipFunctionDialog";
import { ZipTableDialog } from "@/components/Dialog/ZipTableDialog";
import { ZipTable } from "@/components/Table/ZipTable";

export function ZipView() {
  const [fileList, setFileList] = useState<FileEntry[]>(
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
        <ZipTable fileList={fileList} setFileList={setFileList} />
        <ZipTableDialog fileList={fileList} setFileList={setFileList} />
      </CardContent>
      <CardFooter className="justify-end">
        <ZipFunctionDialog fileList={fileList} />
      </CardFooter>
    </Card>
  );
}
