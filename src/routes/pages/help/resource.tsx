import { HelpNavbar } from "@/components/Navbar/HelpNavbar";
import { Files } from "lucide-react";

export default function Resource() {
  return (
    <>
      <HelpNavbar page="Resources" Icon={Files} />
      <h2>References</h2>
    </>
  );
}
