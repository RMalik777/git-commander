import { useAppSelector } from "@/lib/Redux/hooks";
import { Fragment } from "react";
import { useLocation, NavLink } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Monaco } from "@/components/Monaco";

import { FileX, MessageCircleQuestion } from "lucide-react";

export default function Editor() {
  const currentDir = useAppSelector((state) => state.repo.directory);
  const relativeDir = currentDir.split("\\").pop();
  const location = useLocation();

  const path: string = location.state?.path ?? sessionStorage.getItem("editorActive") ?? "";
  sessionStorage.setItem("editorActive", path);
  // window.history.replaceState({}, "");

  const splitPath = path?.replace(`${currentDir}\\`, `${relativeDir}\\`)?.trim()?.split("\\");
  console.log(splitPath);

  return path ?
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
    : <div className="flex h-full w-full flex-col items-center justify-center gap-4 sm:gap-8 lg:gap-16">
        <section className="flex w-full max-w-prose flex-col items-center justify-center gap-2 sm:flex-row">
          <FileX className="h-14 w-auto dark:text-neutral-50 sm:h-16 md:h-20 lg:h-24" />
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold tracking-tight dark:text-neutral-50 md:text-2xl lg:text-3xl xl:text-4xl">
              No file selected
            </h2>
            <p className="text-base font-medium tracking-normal text-neutral-400 dark:text-neutral-600 md:text-lg">
              Please select a file from content page to view
            </p>
          </div>
        </section>
        <section className="flex w-full max-w-prose flex-col items-start gap-1 rounded border bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50">
          <div className="flex items-center gap-1">
            <MessageCircleQuestion className="h-8 w-auto dark:text-neutral-50" />
            <p className="text-xl font-bold">Help</p>
          </div>
          <h2 className="text-lg font-medium">How to open file using integrated editor:</h2>
          <ol className="list-inside list-decimal marker:font-bold">
            <li>
              Go to{" "}
              <span>
                <NavLink to="/folder" className="font-medium duration-200 hover:underline">
                  Content
                </NavLink>
              </span>{" "}
              Page
            </li>
            <li>Navigate to the file you want to edit</li>
            <li>
              Right click on the file and click{" "}
              <span className="rounded bg-neutral-200 p-1 font-medium dark:bg-neutral-800">
                Open in Editor
              </span>{" "}
              from the context menu
            </li>
          </ol>
        </section>
      </div>;
}
