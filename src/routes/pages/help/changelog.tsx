import Markdown from "react-markdown";

import { History } from "lucide-react";

import { HelpNavbar } from "@/components/Navbar/HelpNavbar";

let md = "";
import("../../../../CHANGELOG.md").then((res) => {
  fetch(res.default)
    .then((response) => response.text())
    .then((text) => (md = text));
});
export default function Changelog() {
  return (
    <div className="flex flex-col gap-8">
      <HelpNavbar page="Changelog" Icon={History} />
      <div className="px-4">
        <Markdown
          components={{
            h1(props) {
              return <h1 className="mt-4 text-2xl font-bold">{props.children}</h1>;
            },
            h2(props) {
              return <h2 className="mt-4 text-xl font-bold">{props.children}</h2>;
            },
            h3(props) {
              return <h3 className="text-lg font-bold">{props.children}</h3>;
            },
            h4(props) {
              return <h4 className="text-lg font-medium">{props.children}</h4>;
            },
            h5(props) {
              return <h5 className="text-base font-medium">{props.children}</h5>;
            },
            h6(props) {
              return <h6 className="text-base font-normal">{props.children}</h6>;
            },
            a(props) {
              return (
                <a
                  className="text-blue-500 visited:text-purple-500 hover:underline"
                  href={props.href}
                  target="_blank"
                  rel="noopener noreferrer">
                  {props.children}
                </a>
              );
            },
            ul(props) {
              return <ul className="">{props.children}</ul>;
            },
            li(props) {
              return <li className="list-inside list-disc text-base">{props.children}</li>;
            },
            p(props) {
              return <p className="text-sm">{props.children}</p>;
            },
          }}>
          {md}
        </Markdown>
      </div>
    </div>
  );
}
