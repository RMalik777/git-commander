import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div
      id="error-page"
      className="min-w-dvw mx-12 flex min-h-dvh flex-col items-center justify-center gap-2">
      <h1 className="text-4xl">oops!</h1>
      <p className="text-2xl">Sorry, an unexpected error has occurred.</p>
      <p className="">
        <code className="">{error.statusText || error.message}</code>
      </p>
    </div>
  );
}
