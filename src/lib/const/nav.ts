import {
  CircleHelp,
  Code2,
  FolderOpen,
  GitBranchPlus,
  Home,
  Package,
  Settings,
} from "lucide-react";

export const menuItem = [
  {
    name: "Home",
    link: "/",
    icon: Home,
  },
  {
    name: "Source Control",
    link: "/staging",
    icon: GitBranchPlus,
  },
  {
    name: "Copy and Zip",
    link: "/zip",
    icon: Package,
  },
  {
    name: "Content",
    link: "/folder",
    icon: FolderOpen,
  },
  {
    name: "Editor",
    link: "/editor",
    icon: Code2,
  },
  {
    name: "Settings",
    link: "/settings",
    icon: Settings,
  },
  {
    name: "Help",
    link: "/help",
    icon: CircleHelp,
  },
];
