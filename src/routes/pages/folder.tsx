import FileList from "@/components/Card/FileList";
import Staging from "@/components/Card/Staging";
import * as icons from "simple-icons";
import type { SimpleIcon } from "simple-icons";

export default function Git() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Staging />
      <FileList />
    </div>
  );
}
