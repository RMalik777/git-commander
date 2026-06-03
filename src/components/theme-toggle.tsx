import { Moon, Sun, SunMoon } from "lucide-react";
import { clsx } from "clsx";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/integrations/theme-provider";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon" className="relative">
            <Sun
              className={clsx(
                theme == "light" ? "scale-100 rotate-0" : "scale-0 rotate-90",
                "absolute duration-200 ease-out",
              )}
            />
            <Moon
              className={clsx(
                theme == "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90",
                "absolute duration-200 ease-out",
              )}
            />
            <SunMoon
              className={clsx(
                theme !== "dark" && theme !== "light" ? "scale-100 rotate-0" : "scale-0 -rotate-90",
                "absolute duration-200 ease-out",
              )}
            />
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <SunMoon />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
