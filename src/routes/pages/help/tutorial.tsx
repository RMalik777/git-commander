import { GraduationCap, FileText } from "lucide-react";

import { HelpNavbar } from "@/components/Navbar/HelpNavbar";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";

import { useNavigate } from "react-router";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./popover.css";

export default function Tutorial() {
  const navigate = useNavigate();
  const document = [
    {
      id: "EN",
      title: "User Documentation (EN)",
      download: "/src/assets/Documentation (EN).pdf",
    },
    {
      id: "ID",
      title: "User Documentation (ID)",
      download: "/src/assets/Documentation (ID).pdf",
    },
  ];
  const tutorialApp = [
    {
      id: "TB",
      title: "Toolbar",
      description: "Where is the toolbar and what are the functions available in the toolbar.",
      tour: () => {
        const tour = driver({
          showProgress: true,
          steps: [
            {
              element: ".TB_1",
              popover: {
                title: "Toolbar",
                description:
                  "This is the toolbar, you can use the most common functions from here.",
              },
            },
            {
              element: ".TB_2",
              popover: {
                title: "Current Repository",
                description: "This is the current repository and branch you are working on.",
              },
            },
            {
              element: ".TB_3",
              popover: {
                title: "Change Branch",
                description: "Click to choose a different branch from the dropdown.",
              },
            },
            {
              element: ".TB_4",
              popover: {
                title: "Back Button",
                description: "Click to go back to the previous page.",
              },
            },
            {
              element: ".TB_5",
              popover: {
                title: "Forward Button",
                description: "Click to go forward to the next page.",
              },
            },
            {
              element: ".TB_6",
              popover: {
                title: "Pull",
                description: "Click to pull the latest changes from the remote repository.",
              },
            },
            {
              element: ".TB_7",
              popover: {
                title: "Push",
                description: "Click to push the changes to the remote repository.",
              },
            },
            {
              element: ".TB_8",
              popover: {
                title: "Undo Commit",
                description:
                  "Click to undo the last commit you made to the repository. Note that this will not undo the changes you already pushed to the remote repository.",
              },
            },
            {
              element: ".TB_9",
              popover: {
                title: "Current Username",
                description:
                  "This is your username, this username will be used for commiting. You can change it from the settings.",
              },
            },
            {
              element: ".TB_10",
              popover: {
                title: "Dark Mode",
                description:
                  "Click to toggle between light mode, dark mode or follow system theme.",
              },
            },
          ],
        });
        tour.drive();
      },
    },
    {
      id: "FE",
      title: "File Explorer",
      description: "Quick guide on how to use the file explorer.",
      tour: () => {
        navigate("/folder");
        setTimeout(() => {
          const tour = driver({
            showProgress: true,
            steps: [
              {
                element: ".FE_1",
                popover: {
                  title: "File Explorer",
                  description:
                    "This is the file explorer, you can see all the files and folders that are in the repository.",
                },
              },
              {
                element: ".FE_2",
                popover: {
                  title: "Action",
                  description:
                    "Right click on the file or folder to open the context menu and see the available actions.",
                },
              },
              {
                element: ".FE_3",
                popover: {
                  title: "Refresh",
                  description: "Click the refresh button to refresh the file explorer.",
                },
              },
              {
                popover: {
                  title: "Done",
                  description: "You can now navigate through the files and folders.",
                },
              },
            ],
            onDestroyed: () => navigate("/help/tutorial"),
          });
          tour.drive();
        }, 300);
      },
    },
    {
      id: "CPY",
      title: "Copy File",
      description: "Guide on how to copy file from source to destination.",
      tour: () => {
        navigate("/zip");
        setTimeout(() => {
          const tour = driver({
            showProgress: true,
            steps: [
              {
                element: ".CPY_1",
                popover: {
                  title: "Input File Name",
                  description:
                    "Input the file name you want to copy separated with newline (enter). Pay attention to casing (Capitalize) because the input is case sensitive.",
                },
              },
              {
                element: ".CPY_2",
                popover: {
                  title: "Overwrite Function",
                  description:
                    "If you want to overwrite file with the same name, check this box. Otherwise, the copy will be cancelled.",
                },
              },
              {
                element: ".CPY_3",
                popover: {
                  title: "Enter Source",
                  description:
                    "Enter the source folder where you want to copy the file. The program will search this folder recursively and will give a dialog if duplicate is found.",
                },
              },
              {
                element: ".CPY_4",
                popover: {
                  title: "Select Source",
                  description: "Or you can select the source folder",
                },
              },
              {
                element: ".CPY_5",
                popover: {
                  title: "Remember Source",
                  description:
                    "Source will be filled automatically if you checked this box. Useful if you always copy from this source",
                },
              },
              {
                element: ".CPY_6",
                popover: {
                  title: "Enter Destination",
                  description:
                    "Enter the Destination folder where you want to copy the file. The program will search this folder recursively and will give a dialog if duplicate is found.",
                },
              },
              {
                element: ".CPY_7",
                popover: {
                  title: "Select Destination",
                  description: "Or you can select the Destination folder",
                },
              },
              {
                element: ".CPY_8",
                popover: {
                  title: "Remember Destination",
                  description: "Destination will be filled automatically if you checked this box.",
                },
              },
              {
                element: ".CPY_9",
                popover: {
                  title: "Copy",
                  description:
                    "Click the copy button, it will search the file and copy it. It may take a long time based on folder size.",
                },
              },
              {
                popover: {
                  title: "Done",
                  description: "Once the process is finished, notification will show",
                },
              },
            ],
            onDestroyed: () => navigate("/help/tutorial"),
          });
          tour.drive();
        }, 1000);
      },
    },
    {
      id: "ZIP",
      title: "Compress File",
      description: "Guide on how to sort and zip file.",
      tour: () => {
        navigate("/zip");
        setTimeout(() => {
          const tour = driver({
            showProgress: true,
            steps: [
              {
                element: ".ZIP_1",
                popover: {
                  title: "Add File",
                  description:
                    "Click to add file you want to add to the table. You can add multiple file with single input.",
                },
              },
              {
                element: ".ZIP_2",
                popover: {
                  title: "Add Folder",
                  description:
                    "If you want to add folder, don't use click file. If you add folder only the FOLDER that will be added to the table. The file inside the folder will remain untouched (it will be zipped, but name won't be changed).",
                },
              },
              {
                element: ".ZIP_3",
                popover: {
                  title: "Search",
                  description: "Search the file or folder inside the table.",
                },
              },
              {
                element: ".ZIP_4",
                popover: {
                  title: "Sort Based on Name",
                  description:
                    "Click to sort the table based on name. Click again to reverse the order.",
                },
              },
              {
                element: ".ZIP_5",
                popover: {
                  title: "Sort Based on Location",
                  description:
                    "Click to sort the table based on location. Click again to reverse the order.",
                },
              },
              {
                element: ".ZIP_6",
                popover: {
                  title: "Custom Sort",
                  description:
                    "Click the number to change the order. If you want to put an item as first item, click the number and then add number 1.",
                },
              },
              {
                element: ".ZIP_7",
                popover: {
                  title: "Action",
                  description: "This is the action button",
                },
              },
              {
                element: ".ZIP_8",
                popover: {
                  title: "Move Up",
                  description: "Click to move this item up by 1",
                },
              },
              {
                element: ".ZIP_9",
                popover: {
                  title: "Move Down",
                  description: "Click to move this item down by 1",
                },
              },
              {
                element: ".ZIP_10",
                popover: {
                  title: "Remove",
                  description: "Click to remove the file or folder from the table.",
                },
              },
              {
                element: ".ZIP_11",
                popover: {
                  title: "Zip",
                  description:
                    "Click to zip the file or folder. The file will be zipped based on the order in the table. If you want to change the order, you can do it before zipping.",
                  onNextClick: () => {
                    const el: HTMLButtonElement | null = window.document.querySelector(".ZIP_11");
                    el?.click();
                    setTimeout(() => tour.moveNext(), 100);
                  },
                },
              },
              {
                element: ".ZIP_12",
                popover: {
                  title: "Output Name",
                  description: "Input the name of the output file without the extension.",
                },
              },
              {
                element: ".ZIP_13",
                popover: {
                  title: "Compression Format",
                  description: "Select compression format you want to use. The default is zip.",
                },
              },
              {
                element: ".ZIP_14",
                popover: {
                  title: "Compression Level",
                  description: "Select compression level you want to use. The default is 0.",
                },
              },
              {
                element: ".ZIP_15",
                popover: {
                  title: "Output Location",
                  description: "Choose where you want to store the file.",
                },
              },
              {
                element: ".ZIP_16",
                popover: {
                  title: "Remove Space",
                  description:
                    "Remove all space character from the output name and replace it with underscore ('_').",
                },
              },
              {
                element: ".ZIP_17",
                popover: {
                  title: "Zip",
                  description:
                    "Click to start the zipping process. It may take a long time based on the file size.",
                },
              },
              {
                popover: {
                  title: "Done",
                  description: "Once the process is finished, notification will show",
                },
              },
            ],
            onDestroyed: () => navigate("/help/tutorial"),
          });
          tour.drive();
        }, 1000);
      },
    },
  ];
  const tutorialGit = [
    {
      id: "OR",
      title: "Opening Repository",
      description: "Quick guide on how to open a existing git repository from your local machine.",
      tour: () => {
        navigate("/");
        setTimeout(() => {
          driver({
            showProgress: true,
            steps: [
              {
                element: ".OR_1",
                popover: {
                  title: "Click Open Button",
                  description:
                    "Click on the Open Repository button to open a existing git repository from your local machine.",
                },
              },
              {
                popover: {
                  title: "Choose Repository",
                  description: "A dialog will appear, choose the repository you want to open.",
                },
              },
              {
                popover: {
                  title: "Confirmation",
                  description: "An error will be shown if the folder is not a git repository.",
                },
              },
            ],
            onDestroyed: () => navigate("/help/tutorial"),
          }).drive();
        }, 300);
      },
    },
    {
      id: "CR",
      title: "Cloning Repository",
      description: "Quick guide on how to clone a git repository from a remote server.",
      tour: () => {
        navigate("/");
        setTimeout(() => {
          const tour = driver({
            showProgress: true,
            steps: [
              {
                element: ".CR_1",
                popover: {
                  title: "Click Clone Button",
                  description:
                    "Click on the Clone button to clone a git repository from a remote server.",
                  onNextClick: () => {
                    (window.document.querySelector(".CR_1") as HTMLElement)?.click();
                    setTimeout(() => tour.moveNext(), 10);
                  },
                },
              },
              {
                element: ".CR_2",
                popover: {
                  title: "Select Repository URL or Enter URL",
                  description:
                    "Choose the repository URL you want clone from the dropdown. Or you can enter the repository URL you want to clone from the remote server.",
                  onPrevClick: () => {
                    (window.document.querySelector("CR_2A") as HTMLElement)?.click();
                    tour.movePrevious();
                  },
                },
              },
              {
                element: ".CR_3",
                popover: {
                  title: "Enter Location",
                  description:
                    "Enter the location or click on the open button where you want to store the cloned repository.",
                },
              },
              {
                element: ".CR_4",
                popover: {
                  title: "Click Clone Button",
                  description: "Click on the Clone button to start cloning the repository.",
                },
              },
              {
                popover: {
                  title: "Done",
                  description:
                    "Form will close automatically and a notification will appear when the repository is cloned successfully.",
                  onNextClick: () => {
                    tour.destroy();
                  },
                },
              },
            ],
            onDestroyed: () => navigate("/help/tutorial"),
          });
          tour.drive();
        }, 300);
      },
    },
    {
      id: "STG",
      title: "Staging Changes",
      description: "Guide on how to stage changes to a git repository.",
      tour: () => {
        navigate("/staging");
        setTimeout(() => {
          const tour = driver({
            showProgress: true,
            steps: [
              {
                element: ".STG_1",
                popover: {
                  title: "Staging Changes",
                  description:
                    "This is the page where you can stage your changes before committing.",
                },
              },
              {
                element: ".STG_2",
                popover: {
                  title: "File List",
                  description: "This show the list of files that are changed.",
                },
              },
              {
                element: ".STG_3",
                popover: {
                  title: "File Name",
                  description: "This is the name of the file that is changed.",
                },
              },
              {
                element: ".STG_4",
                popover: {
                  title: "File Path",
                  description: "The path of the file relative to the repository.",
                  onNextClick: () => {
                    const el = window.document.querySelector(".STG_5A");
                    el?.classList.add("flex");
                    el?.classList.remove("hidden");
                    setTimeout(() => tour.moveNext(), 10);
                  },
                },
              },
              {
                element: ".STG_5",
                popover: {
                  title: "Action Button",
                  description: "Hover over the file name to see the action available.",
                  onPrevClick: () => {
                    const el = window.document.querySelector(".STG_5A");
                    el?.classList.add("hidden");
                    el?.classList.remove("flex");
                    setTimeout(() => tour.movePrevious(), 10);
                  },
                },
              },
              {
                element: ".STG_6",
                popover: {
                  title: "Open File",
                  description: "Click to open the file.",
                },
              },
              {
                element: ".STG_7",
                popover: {
                  title: "Stage File",
                  description: "Clicking the plus icon beside the file name to stage (add) file.",
                  onNextClick: () => {
                    const item = window.document.querySelector(".STG_5A");
                    item?.classList.add("hidden");
                    item?.classList.remove("flex");
                    const el = window.document.querySelector(".STG_8A");
                    el?.classList.add("flex");
                    el?.classList.remove("hidden");
                    setTimeout(() => tour.moveNext(), 10);
                  },
                },
              },
              {
                element: ".STG_8",
                popover: {
                  title: "Select All",
                  description:
                    "Click to plus icon on dropdown to stage all the changes at once. This is equivalent to git add .",
                  onPrevClick: () => {
                    const item = window.document.querySelector(".STG_5A");
                    item?.classList.add("flex");
                    item?.classList.remove("hidden");
                    const el = window.document.querySelector(".STG_8A");
                    el?.classList.add("hidden");
                    el?.classList.remove("flex");
                    setTimeout(() => tour.movePrevious(), 10);
                  },
                  onNextClick: () => {
                    const el = window.document.querySelector(".STG_5A");
                    el?.classList.add("hidden");
                    el?.classList.remove("flex");
                    setTimeout(() => tour.moveNext(), 10);
                  },
                },
              },
              {
                popover: {
                  title: "Staging Done",
                  description: "You can now commit the changes.",
                  onPrevClick: () => {
                    const item = window.document.querySelector(".STG_5A");
                    item?.classList.add("flex");
                    item?.classList.remove("hidden");
                    setTimeout(() => tour.movePrevious(), 10);
                  },
                },
              },
            ],
            onDestroyed: () => navigate("/help/tutorial"),
          });
          tour.drive();
        }, 1000);
      },
    },
    {
      id: "UST",
      title: "Unstaging Changes",
      description: "Guide on how to unstage changes from a git repository.",
      tour: () => {
        navigate("/staging");
        setTimeout(() => {
          const tour = driver({
            showProgress: true,
            steps: [
              {
                element: ".UST_1",
                popover: {
                  title: "Staging Changes",
                  description: "This is the page where you can unstage your changes.",
                },
              },
              {
                element: ".UST_2",
                popover: {
                  title: "File List",
                  description: "This show the list of files that are staged.",
                },
              },
              {
                element: ".UST_3",
                popover: {
                  title: "File Name",
                  description: "This is the name of the file that is changed.",
                },
              },
              {
                element: ".UST_4",
                popover: {
                  title: "File Path",
                  description: "The path of the file relative to the repository.",
                  onNextClick: () => {
                    const el = window.document.querySelector(".UST_5A");
                    el?.classList.add("flex");
                    el?.classList.remove("hidden");
                    setTimeout(() => tour.moveNext(), 10);
                  },
                },
              },
              {
                element: ".UST_5",
                popover: {
                  title: "Action Button",
                  description: "Hover over the file name to see the action available.",
                  onPrevClick: () => {
                    const el = window.document.querySelector(".UST_5A");
                    el?.classList.add("hidden");
                    el?.classList.remove("flex");
                    setTimeout(() => tour.movePrevious(), 10);
                  },
                },
              },
              {
                element: ".UST_6",
                popover: {
                  title: "Open File",
                  description: "Click to open the file.",
                },
              },
              {
                element: ".UST_7",
                popover: {
                  title: "Unstage File",
                  description: "Clicking the minus icon beside the file name to unstage file.",
                  onNextClick: () => {
                    const item = window.document.querySelector(".UST_5A");
                    item?.classList.add("hidden");
                    item?.classList.remove("flex");
                    const el = window.document.querySelector(".UST_8A");
                    el?.classList.add("flex");
                    el?.classList.remove("hidden");
                    setTimeout(() => tour.moveNext(), 10);
                  },
                },
              },
              {
                element: ".UST_8",
                popover: {
                  title: "Select All",
                  description:
                    "Click to minus icon on dropdown to unstage all the changes at once.",
                  onPrevClick: () => {
                    const item = window.document.querySelector(".UST_5A");
                    item?.classList.add("flex");
                    item?.classList.remove("hidden");
                    const el = window.document.querySelector(".UST_8A");
                    el?.classList.add("hidden");
                    el?.classList.remove("flex");
                    setTimeout(() => tour.movePrevious(), 10);
                  },
                  onNextClick: () => {
                    const el = window.document.querySelector(".UST_5A");
                    el?.classList.add("hidden");
                    el?.classList.remove("flex");
                    setTimeout(() => tour.moveNext(), 10);
                  },
                },
              },
              {
                popover: {
                  title: "Unstaging Done",
                  description: "You can now continue working on the changes.",
                  onPrevClick: () => {
                    const item = window.document.querySelector(".UST_5A");
                    item?.classList.add("flex");
                    item?.classList.remove("hidden");
                    setTimeout(() => tour.movePrevious(), 10);
                  },
                },
              },
            ],
            onDestroyed: () => navigate("/help/tutorial"),
          });
          tour.drive();
        }, 1000);
      },
    },
    {
      id: "CMT",
      title: "Committing Changes",
      description: "Guide on how to commit changes to a git repository.",
      tour: () => {
        navigate("/staging");
        setTimeout(() => {
          const tour = driver({
            showProgress: true,
            steps: [
              {
                element: ".CMT_1",
                popover: {
                  title: "Check Username",
                  description:
                    "Make sure you already set your username in the settings. If not, the global username will be used.",
                },
              },
              {
                element: ".CMT_2",
                popover: {
                  title: "Enter Commit Message",
                  description:
                    "Enter the commit message in the input field. Make sure the message is following your commit message convention.",
                },
              },
              {
                element: ".CMT_3",
                popover: {
                  title: "Click Commit Button",
                  description:
                    "Click on the Commit button to commit the changes to the repository.",
                },
              },
              {
                popover: {
                  title: "Done",
                  description:
                    "A notification will appear when the changes are committed successfully. You can choose whether to push the changes now or not.",
                  onNextClick: () => {
                    tour.destroy();
                  },
                },
              },
            ],
            onDestroyed: () => navigate("/help/tutorial"),
          });
          tour.drive();
        }, 1000);
      },
    },
  ];
  return (
    <>
      <HelpNavbar page="Tutorial" Icon={GraduationCap} />
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-1 px-4">
          <h1 className="text-3xl font-medium">Document</h1>
          <div className="flex flex-row items-center gap-2">
            {document.map((item) => {
              return (
                <div
                  key={item.id}
                  className="flex w-full flex-col items-start gap-2 rounded border p-2 dark:border-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <FileText className="" size={18} />
                    <p className="text-lg font-medium">{item.title}</p>
                  </div>
                  {/* Add file size information */}
                  <a
                    className={
                      buttonVariants({
                        variant: "outline",
                        size: "sm",
                      }) + " ml-6"
                    }
                    href={item.download}
                    download
                  >
                    Download
                  </a>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="px-4 text-3xl font-medium">Interactive Tutorial</h1>
          <div className="flex flex-col gap-1">
            <h2 className="px-4 text-xl font-medium">App</h2>
            <Separator className="" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {tutorialApp.map((item) => {
                return (
                  <button
                    key={item.id}
                    className="flex flex-col items-start gap-1 rounded p-4 duration-200 ease-out hover:bg-neutral-50 hover:dark:bg-neutral-900"
                    onClick={item.tour}
                  >
                    <h3 className="text-left text-lg font-medium tracking-tight">{item.title}</h3>
                    <p className="text-left">{item.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="px-4 text-xl font-medium sm:col-span-2">Git Command</h2>
            <Separator className="" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {tutorialGit.map((item) => {
                return (
                  <button
                    key={item.id}
                    className="flex flex-col items-start gap-1 rounded p-4 duration-200 ease-out hover:bg-neutral-50 hover:dark:bg-neutral-900"
                    onClick={item.tour}
                  >
                    <h3 className="text-left text-lg font-medium tracking-tight">{item.title}</h3>
                    <p className="text-left">{item.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
