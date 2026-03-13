import { ElementType } from "react";
import { createRoot } from "react-dom/client";
import PageContainer from "../components/page-container";

/**
 * A utility function to render a page to the React DOM.
 *
 * @param title The title of the page. The window title is set to this value.
 * @param PageComponent The Page component to render.
 * @param withShell true to wrap the page component in an app shell.
 */
export default function renderPage(
  title: string,
  PageComponent: ElementType,
  withShell = true,
) {
  document.title = title;
  const root: HTMLElement | null = document.getElementById("root");
  if (root == null) {
    throw new Error("Root HTML Node was not found.");
  }
  createRoot(root).render(
    <PageContainer withShell={withShell}>
      <PageComponent />
    </PageContainer>,
  );
}
