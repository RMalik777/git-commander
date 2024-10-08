import { open } from "@tauri-apps/api/dialog";
import { useState } from "react";

import { Monaco } from "@/components/Monaco";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Editor() {
  const [path, setPath] = useState("");
  return (
    <>
      <h1>Editor</h1>
      <form className="mb-4 flex items-center gap-4" onSubmit={() => {}}>
        <Input type="text" placeholder="path/to/file" value={path} />
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            const toOpen = await open({ directory: false, multiple: false });
            if (toOpen) {
              setPath(toOpen.toString());
            }
          }}>
          Open
        </Button>
      </form>
      <Monaco path={path} />
    </>
  );
}
