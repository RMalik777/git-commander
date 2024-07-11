import { GraduationCap } from "lucide-react";

import { HelpNavbar } from "@/components/Navbar/HelpNavbar";
import { Separator } from "@/components/ui/separator";

import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./popover.css";

export default function Tutorial() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const tutorialApp = [
    {
      id: "TB",
      title: "Toolbar",
      description:
        "Where is the toolbar and what are the functions available in the toolbar.",
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
                description:
                  "This is the current repository and branch you are working on.",
              },
            },
            {
              element: ".TB_3",
              popover: {
                title: "Change Branch",
                description:
                  "Click to choose a different branch from the dropdown.",
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
                description:
                  "Click to pull the latest changes from the remote repository.",
              },
            },
            {
              element: ".TB_7",
              popover: {
                title: "Push",
                description:
                  "Click to push the changes to the remote repository.",
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
  ];
  const tutorialGit = [
    {
      id: "OR",
      title: "Opening Repository",
      description:
        "Quick guide on how to open a existing git repository from your local machine.",
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
                  description:
                    "A dialog will appear, choose the repository you want to open.",
                },
              },
              {
                popover: {
                  title: "Confirmation",
                  description:
                    "An error will be shown if the folder is not a git repository.",
                },
              },
            ],
            onDestroyed: () => navigate("/help/tutorial"),
          }).drive();
        }, 1);
      },
    },
    {
      id: "CR",
      title: "Cloning Repository",
      description:
        "Quick guide on how to clone a git repository from a remote server.",
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
                    (document.querySelector(".CR_1") as HTMLElement)?.click();
                    setTimeout(() => tour.moveNext(), 1);
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
                    (document.querySelector("CR_2A") as HTMLElement)?.click();
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
                  description:
                    "Click on the Clone button to start cloning the repository.",
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
        }, 1);
      },
    },
    {
      id: "CMT",
      title: "Committing Changes",
      description: "Guide on how to commit changes to a git repository.",
      tour: () => {
        navigate("/");
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
        });
      },
    },
    {
      id: "STG",
      title: "Staging Changes",
      description: "Guide on how to stage changes to a git repository.",
    },
  ];
  return (
    <>
      <HelpNavbar page="Tutorial" Icon={GraduationCap} />
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="px-4 text-xl font-medium">App</h2>
          <Separator className="" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tutorialApp.map((item) => {
              return (
                <button
                  key={item.id}
                  className="flex flex-col items-start gap-1 rounded p-4 duration-200 ease-out hover:bg-neutral-50 hover:dark:bg-neutral-900"
                  onClick={item.tour}>
                  <h3 className="text-left text-lg font-medium tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-left">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="px-4 text-xl font-medium sm:col-span-2">
            Git Command
          </h2>
          <Separator className="" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tutorialGit.map((item) => {
              return (
                <button
                  key={item.id}
                  className="flex flex-col items-start gap-1 rounded p-4 duration-200 ease-out hover:bg-neutral-50 hover:dark:bg-neutral-900"
                  onClick={item.tour}>
                  <h3 className="text-left text-lg font-medium tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-left">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
