import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { StoreProvider } from "@/lib/store";
import { ThemeProvider } from "@/lib/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import stylesHref from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: "stylesheet", href: stylesHref }],
  }),
  component: () => (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        <ThemeProvider>
          <StoreProvider>
            <Outlet />
          </StoreProvider>
        </ThemeProvider>
        <Toaster richColors closeButton position="top-right" />
        <Scripts />
      </body>
    </html>
  ),
});
