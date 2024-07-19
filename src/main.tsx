import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import Layout from "./routes/Layout";

import Index from "./routes/index";
import Settings from "./routes/pages/settings";
import Folder from "./routes/pages/folder";
import Help from "./routes/pages/help";

import HelpLayout from "./routes/pages/help/Layout";
import Changelog from "./routes/pages/help/changelog";
import Tutorial from "./routes/pages/help/tutorial";
import Resource from "./routes/pages/help/resource";
import Faq from "./routes/pages/help/faq";
import Info from "./routes/pages/help/info";

import ErrorPage from "./error-page";

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: (
      <Layout>
        <ErrorPage />
      </Layout>
    ),
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/folder",
        element: <Folder />,
      },
      {
        path: "/help",
        element: <Help />,
      },
      {
        element: <HelpLayout />,
        children: [
          {
            path: "/help/tutorial",
            element: <Tutorial />,
          },
          {
            path: "/help/faq",
            element: <Faq />,
          },
          {
            path: "/help/resource",
            element: <Resource />,
          },
          {
            path: "/help/changelog",
            element: <Changelog />,
          },
          {
            path: "/help/info",
            element: <Info />,
          },
        ],
      },
    ],
  },
]);

if (window.localStorage.getItem("theme") === "Dark") {
  document.documentElement.style.colorScheme = "dark";
  document.documentElement.className = "dark";
} else if (window.localStorage.getItem("theme") === "Light") {
  document.documentElement.style.colorScheme = "light";
  document.documentElement.classList.remove("dark");
} else {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.style.colorScheme = "dark";
    document.documentElement.className = "dark";
  } else {
    document.documentElement.style.colorScheme = "light";
    document.documentElement.classList.remove("dark");
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
