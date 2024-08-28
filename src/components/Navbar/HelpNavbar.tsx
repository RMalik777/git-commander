import type { LucideIcon } from "lucide-react";

export function HelpNavbar({ page, Icon }: Readonly<{ page: string; Icon: LucideIcon }>) {
  return (
    <div className="flex w-full flex-row items-center justify-center gap-2 rounded border bg-neutral-100 p-2 duration-200 ease-out dark:border-neutral-700 dark:bg-neutral-800">
      <Icon size={20} />
      <h1 className="text-center text-xl font-medium tracking-tight">{page}</h1>
    </div>
  );
}
