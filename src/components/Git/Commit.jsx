import * as React from "react";

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

export default function Commit() {
  return (
    <form>
      <Card className="w-fit">
        <CardHeader className="bg-gray-100 pb-3">
          <CardTitle>Commit</CardTitle>
          <CardDescription>
            Commit changes made to remote repository
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Commit Messages</Label>
              <Input id="name" placeholder="Name of your project" required />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="reset" variant="outline" size="sm">
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Deploy
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
