import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

const repo_data = [
  {
    name: "git-commander",
    link: "https://github.com/RMalik777/git-commander",
    provider: "GitHub",
  },
  {
    name: "porto",
    link: "https://github.com/RMalik777/porto",
    provider: "GitHub",
  },
  {
    name: "DashOne",
    link: "https://github.com/RMalik777/DashOne",
    provider: "GitHub",
  },
  {
    name: "web-blog",
    link: "https://github.com/RMalik777/web-blog",
    provider: "GitHub",
  },
  {
    name: "FileBag",
    link: "https://github.com/RMalik777/FileBag",
    provider: "GitHub",
  },
];

export default function RepoTable() {
  return (
    <Table>
      <TableCaption>A list of your remote repositories</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Link</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead className="text-center">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {repo_data.map((repo) => (
          <TableRow key={repo.name}>
            <TableCell className="font-medium">{repo.name}</TableCell>
            <TableCell>
              <a href={repo.link} target="_blank" rel="noopener noreferrer">
                <code>{repo.link}</code>
              </a>
            </TableCell>
            <TableCell>{repo.provider}</TableCell>
            <TableCell className="text-center">
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
