import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CloudDownload } from "lucide-react";

import Clone from "@/components/Dialog/Clone";

export default function Git() {
  return (
    <>
      <h1>Git</h1>
      <Clone />
    </>
  );
}
