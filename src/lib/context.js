import { createContext } from "react";

export const BranchContext = createContext({
  branch: "main",
  setBranch: () => {},
});
