import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReactNode } from "react";

interface ConfirmationDialogProps {
  open: boolean;
  repoName: string;
  setOpen: (open: boolean) => void;
  message: string | ReactNode;
  onConfirm(): void;
}

export function ConfirmationDialog({
  open,
  repoName,
  setOpen,
  message,
  onConfirm,
}: Readonly<ConfirmationDialogProps>) {
  function handleConfirm() {
    onConfirm();
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {repoName}?</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Yes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
