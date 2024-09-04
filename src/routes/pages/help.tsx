import { NavLink } from "react-router-dom";

import { CircleArrowRight, GraduationCap, History, Info } from "lucide-react";

const items = [
  {
    name: "Tutorial",
    link: "tutorial",
    icon: <GraduationCap size={20} />,
  },

  {
    name: "Changelog",
    link: "changelog",
    icon: <History size={20} />,
  },
  {
    name: "Info",
    link: "info",
    icon: <Info size={20} />,
  },
];

export default function Help() {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      {items.map((item) => {
        return (
          <NavLink
            key={item.link}
            to={item.link}
            className="flex w-full cursor-pointer flex-row items-center justify-between rounded border bg-neutral-50 p-4 duration-200 ease-out hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 hover:dark:bg-neutral-800">
            <div className="flex flex-row items-center gap-2">
              {item.icon}
              <h2 className="text-base font-medium tracking-tight">{item.name}</h2>
            </div>
            <CircleArrowRight size={20} />
          </NavLink>
        );
      })}
    </div>
  );
}
