import FileList from "@/components/Card/FileList";
import Staging from "@/components/Card/Staging";

export default function Git() {
  return (
    <>
      <h1>Git</h1>
      <div className="flex flex-col items-center gap-4">
        <FileList />
        <Staging />
      </div>
    </>
  );
}
