"use client";

import { useEffect } from "react";
import { incrementView } from "@/app/admin/actions";

export default function TrackVisit() {
  useEffect(() => {
    // Basic debounce to avoid double tracking in dev
    const hasTracked = sessionStorage.getItem("aura_tracked_visit");
    if (!hasTracked) {
      incrementView("visit");
      sessionStorage.setItem("aura_tracked_visit", "true");
    }
  }, []);

  return null;
}
