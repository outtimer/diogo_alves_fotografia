"use client";

import { useEffect } from "react";
import { incrementView } from "@/app/admin/actions";

interface TrackContentViewProps {
  type: "photo" | "post";
  id: string;
}

export default function TrackContentView({ type, id }: TrackContentViewProps) {
  useEffect(() => {
    // Basic debounce to avoid double tracking in dev
    const key = `aura_tracked_${type}_${id}`;
    const hasTracked = sessionStorage.getItem(key);
    
    if (!hasTracked) {
      incrementView(type, id);
      sessionStorage.setItem(key, "true");
    }
  }, [type, id]);

  return null;
}
