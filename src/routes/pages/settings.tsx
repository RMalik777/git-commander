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
import { useToast } from "@/components/ui/use-toast";

import { UsernameConfig } from "@/components/Card/Username";
import RepoTable from "@/components/Table/RepoTable";
import AddRepo from "@/components/Dialog/AddRepo";
import { ClearSettings } from "@/components/Dialog/ClearSettings";

import type { RepoFormat } from "@/lib/Types/repo";

import * as db from "@/lib/database";

export default function Settings() {
  const [openClearSettings, setOpenClearSettings] = useState(false);

  const { toast } = useToast();

  const [repos, setRepos] = useState<RepoFormat[]>([]);
  async function fetchData() {
    try {
      const response = await db.getAllRepo();
      setRepos(response);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);

  async function handleDelete(repoId: string, repoName: string) {
    await db.deleteRemoteRepoById(repoId);
    toast({
      title: "Repository Deleted",
      description: (
        <p>
          Repository <b>{repoName}</b> deleted successfully
        </p>
      ),
    });
    fetchData();
  }

  return (
    <div className="flex flex-col gap-4">
      <UsernameConfig />

      <Card>
        <CardHeader>
          <CardTitle>Remote Repositories List</CardTitle>
          <CardDescription>
            Add or remove your predefined remote repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RepoTable
            repos={repos}
            onDeleteRepo={handleDelete}
            fetchData={fetchData}
          />
        </CardContent>
        <CardFooter>
          <AddRepo afterAdd={fetchData} />
        </CardFooter>
      </Card>

      <ClearSettings open={openClearSettings} setOpen={setOpenClearSettings} />
      <Button
        className="w-fit self-end"
        variant="destructive"
        onClick={() => {
          setOpenClearSettings(true);
        }}>
        Clear Settings
      </Button>
    </div>
  );
}
