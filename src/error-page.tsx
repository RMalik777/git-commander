import { useRouteError } from "react-router";

export default function ErrorPage() {
  const error = useRouteError() as { status?: number; statusText?: string; message?: string };
  console.error(error);

  return (
    <div
      id="error-page"
      className="mx-12 flex min-h-full min-w-dvw flex-col items-center justify-center gap-2"
    >
      <h1 className="text-4xl">oops! :(</h1>
      <p className="text-2xl">Sorry, an unexpected error has occurred.</p>
      <p className="text-lg">
        <code className="">
          <span className="font-bold">{error.status ? error.status + " | " : ""}</span>
          {error.statusText || error.message}
        </code>
      </p>
      {/* <p className="self-start text-sm"> Complete Error:</p>
      <code className="whitespace-pre-wrap rounded-sm border bg-gray-200 p-2 font-mono text-sm">
        {error?.error?.stack ? error.error.stack : error.stack}
      </code> */}
    </div>
  );
}
