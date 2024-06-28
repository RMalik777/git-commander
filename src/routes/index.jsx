import { Button } from "@/components/ui/button";
import { Command } from "@tauri-apps/api/shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Index() {
  async function trial() {
    const command = new Command("run-git-log");
    command.on("close", (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
    });
    command.on("error", (error) => console.error(`command error: "${error}"`));
    command.stdout.on("data", (line) =>
      console.log(`command stdout: "${line}"`)
    );
    command.stderr.on("data", (line) =>
      console.log(`command stderr: "${line}"`)
    );

    const child = await command.spawn();
    console.log("pid:", child.pid);
  }
  return (
    <div className="min-h-fit">
      <Card className="">
        <CardHeader className="pb-3">
          <CardTitle>Git Repository</CardTitle>
          <CardDescription className="flex max-w-lg flex-col text-balance leading-relaxed">
            <code className="w-fit">/path/to/repo</code>
            <span className="text-red-500">Error! Not a git repository</span>
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button size="sm" variant="default">
            Change Repository
          </Button>
        </CardFooter>
      </Card>
      <h1>Index</h1>
    </div>
  );
}
