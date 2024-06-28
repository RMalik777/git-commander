import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddRepo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Repo</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[360px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-prose">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Repositories Name</Label>
            <Input type="text" id="name" placeholder="Name" className="" />
          </div>
          <div>
            <Label htmlFor="link">Link</Label>
            <Input
              type="text"
              id="link"
              placeholder="example.com"
              className=""
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="reset">
              Cancel
            </Button>
            <Button variant="default" type="submit">
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
