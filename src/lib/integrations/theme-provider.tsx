import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type systemTheme = "dark" | "light" | undefined;

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  activeTheme: systemTheme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  activeTheme: undefined,
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: Readonly<ThemeProviderProps>) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  const [activeTheme, setActiveTheme] = useState<systemTheme>(undefined);

  useEffect(() => {
    const root = globalThis.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const applySystemTheme = (dark: boolean) => {
        const resolved = dark ? "dark" : "light";
        root.classList.remove("light", "dark");
        root.classList.add(resolved);
        setActiveTheme(resolved);
      };

      const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
      applySystemTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applySystemTheme(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }

    root.classList.add(theme);
    setActiveTheme(theme);
  }, [theme]);

  const value = {
    theme,
    activeTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
