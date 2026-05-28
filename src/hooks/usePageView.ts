import { useEffect } from "react";
import { useLocation } from "react-router";
import { pageView, loadGAScript } from "@/lib/analytics";

/**
 * Track page views on route change.
 * Call once at the app root.
 */
export function usePageView() {
  const location = useLocation();

  useEffect(() => {
    loadGAScript();
  }, []);

  useEffect(() => {
    pageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
