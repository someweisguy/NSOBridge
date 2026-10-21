import { AppShellProps } from "@mantine/core";

/**
 * The shared config for the AppShell component used throughout this program.
 *
 * @param opened the useDisclosure open value which governs whether the sidebar
 * is collapsed or not.
 * @returns AppShellProps which can be passed the the AppShell.
 */
export const appShellConfig = (opened: boolean): AppShellProps => ({
  layout: "alt",
  header: { height: 60 },
  footer: { height: 60 },
  navbar: {
    width: 300,
    breakpoint: "sm",
    collapsed: { desktop: !opened, mobile: !opened },
  },
  padding: "md",
});
