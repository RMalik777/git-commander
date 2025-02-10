import { useEffect, useState } from "react";

import { getTauriVersion } from "@tauri-apps/api/app";
import { writeText } from "@tauri-apps/api/clipboard";
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
} from "@tauri-apps/api/os";

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
    <>
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
              }),
            );
          }}
        >
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

      <h2 className="pb-2 pt-12 text-xl font-medium">Third Party License</h2>
      <p className="whitespace-pre-wrap border">{`  7-Zip
  ~~~~~
  License for use and distribution
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  7-Zip Copyright (C) 1999-2023 Igor Pavlov.

  The licenses for files are:

    1) 7z.dll:
         - The "GNU LGPL" as main license for most of the code
         - The "GNU LGPL" with "unRAR license restriction" for some code
         - The "BSD 3-clause License" for some code
    2) All other files: the "GNU LGPL".

  Redistributions in binary form must reproduce related license information from this file.

  Note:
    You can use 7-Zip on any computer, including a computer in a commercial
    organization. You don't need to register or pay for 7-Zip.


  GNU LGPL information
  --------------------

    This library is free software; you can redistribute it and/or
    modify it under the terms of the GNU Lesser General Public
    License as published by the Free Software Foundation; either
    version 2.1 of the License, or (at your option) any later version.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
    Lesser General Public License for more details.

    You can receive a copy of the GNU Lesser General Public License from
    http://www.gnu.org/




  BSD 3-clause License
  --------------------

    The "BSD 3-clause License" is used for the code in 7z.dll that implements LZFSE data decompression.
    That code was derived from the code in the "LZFSE compression library" developed by Apple Inc,
    that also uses the "BSD 3-clause License":

    ----
    Copyright (c) 2015-2016, Apple Inc. All rights reserved.

    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    1.  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

    2.  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer
        in the documentation and/or other materials provided with the distribution.

    3.  Neither the name of the copyright holder(s) nor the names of any contributors may be used to endorse or promote products derived
        from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
    COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
    HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
    ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    ----




  unRAR license restriction
  -------------------------

    The decompression engine for RAR archives was developed using source
    code of unRAR program.
    All copyrights to original unRAR code are owned by Alexander Roshal.

    The license for original unRAR code has the following restriction:

      The unRAR sources cannot be used to re-create the RAR compression algorithm,
      which is proprietary. Distribution of modified unRAR sources in separate form
      or as a part of other software is permitted, provided that it is clearly
      stated in the documentation and source comments that the code may
      not be used to develop a RAR (WinRAR) compatible archiver.


  --
  Igor Pavlov`}</p>
    </>
  );
}
