import { useAppSelector } from "@/lib/Redux/hooks";
import { Fragment } from "react";
import { useLocation } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Monaco } from "@/components/Monaco";

export default function Editor() {
  const currentDir = useAppSelector((state) => state.repo.directory);
  const relativeDir = currentDir.split("\\").pop();
  const location = useLocation();

  const path: string = location.state?.path;
  // window.history.replaceState({}, "");

  const splitPath = path?.replace(`${currentDir}\\`, `${relativeDir}\\`)?.trim()?.split("\\");
  console.log(splitPath);

  return (
    <div className="flex h-full flex-col items-start gap-2">
      <Breadcrumb>
        <BreadcrumbList>
          {splitPath?.map((path, index) => {
            return (
              <Fragment key={path}>
                <BreadcrumbItem>
                  <BreadcrumbPage className={index == 0 ? "font-semibold" : ""}>
                    {path}
                  </BreadcrumbPage>
                </BreadcrumbItem>
                {index < splitPath.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <Monaco path={path ?? ""} />
    </div>
  );
}
