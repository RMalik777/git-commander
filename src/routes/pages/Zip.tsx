import { Copy } from "@/components/Card/Copy";
import { ZipView } from "@/components/Card/ZipView";

export default function Zip() {
  return (
    <div className="flex flex-col gap-4">
      <Copy />
      <ZipView />
    </div>
  );
}
