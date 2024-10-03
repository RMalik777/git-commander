import { useEffect, useState } from "react";

import { getTauriVersion } from "@tauri-apps/api/app";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import {
  arch,
  Arch,
  locale,
  OsType,
  platform,
  Platform,
  tempdir,
  type,
  version,
} from "@tauri-apps/plugin-os";

import { Button } from "@/components/ui/button";

import { Clipboard } from "lucide-react";

const app_version = __APP_VERSION__;
const name = __APP_NAME__;
const react = __REACT_VER__;

export default function Info() {
  const [osArch, setOsArch] = useState<Arch | undefined>();
  const [osPlatform, setOsPlatform] = useState<Platform | undefined>();
  const [osVersion, setOsVersion] = useState<string | undefined>();
  const [osLocale, setOsLocale] = useState<string | null>(null);
  const [osType, setOsType] = useState<OsType | undefined>();
  const [tauriVersion, setTauriVersion] = useState<string | undefined>();
  const [tempDir, setTempDir] = useState<string | undefined>();

  useEffect(() => {
    async function getInfo() {
      setOsArch(await arch());
      setOsPlatform(await platform());
      setOsVersion(await version());
      setOsLocale(await locale());
      setOsType(await type());
      setTauriVersion(await getTauriVersion());
      setTempDir(await tempdir());
    }
    getInfo();
  }, []);
  return (
    <div className="flex flex-col gap-4 rounded bg-neutral-50 p-4 duration-150 ease-out dark:bg-neutral-900">
      <Button
        size="icon"
        className="absolute self-end"
        onClick={async () => {
          await writeText(
            JSON.stringify({
              name,
              app_version,
              tauriVersion,
              osPlatform,
              osArch,
              osVersion,
              osLocale,
              osType,
              tempDir,
              react,
            })
          );
        }}>
        <Clipboard size={20} />
      </Button>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold">{name}</h1>
        <h2 className="text-xl font-medium">{app_version}</h2>
      </div>
      <div className="text-lg">
        <h2 className="text-xl">Tauri Information</h2>
        <h3>
          Tauri: <span className="font-medium">{tauriVersion}</span>
        </h3>
      </div>
      <div className="text-lg">
        <h2 className="text-xl">OS Information</h2>
        <h3>
          Platform: <span className="font-medium">{osPlatform}</span>
        </h3>
        <h3>
          Arch: <span className="font-medium">{osArch}</span>
        </h3>
        <h3>
          OS SDK Version:<span className="font-medium"> {osVersion}</span>
        </h3>
        <h3>
          Locale: <span className="font-medium">{osLocale}</span>
        </h3>
        <h3>
          OS Type: <span className="font-medium">{osType}</span>
        </h3>
        <h3>
          Temp Directory: <span className="font-medium">{tempDir}</span>
        </h3>
      </div>
      <div className="text-lg">
        <h2 className="text-xl">Framework Information</h2>
        <h3>
          React: <span className="font-medium">{react}</span>
        </h3>
      </div>
    </div>
  );
}
