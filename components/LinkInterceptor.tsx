/**
 * Link Interceptor — HashRouter Compatibility Layer
 * Automatically converts all <a href="/..."> clicks to React Router navigation.
 * No need to modify every section/page file.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router";

export function LinkInterceptor({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.composedPath ? e.composedPath()[0] : e.target;
      if (!(target instanceof HTMLElement)) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Only intercept internal links (starts with / but not //)
      if (!href.startsWith("/") || href.startsWith("//")) return;

      // Skip external links, mailto, tel, anchors
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      // Skip links with target="_blank"
      if (anchor.getAttribute("target") === "_blank") return;

      // Skip if modifier keys are pressed (open in new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Convert to React Router navigation
      e.preventDefault();
      navigate(href);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [navigate]);

  return <>{children}</>;
}

export default LinkInterceptor;
