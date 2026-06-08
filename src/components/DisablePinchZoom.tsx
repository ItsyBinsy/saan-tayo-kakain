"use client";

import { useEffect } from "react";

export default function DisablePinchZoom() {
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    const preventWheelZoom = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };

    // Blocks pinch-to-zoom on Chrome Android (ignores user-scalable=no)
    document.addEventListener("touchstart", preventZoom, { passive: false });
    document.addEventListener("touchmove", preventZoom, { passive: false });
    // Blocks ctrl+scroll zoom (trackpad pinch on desktop/iOS)
    document.addEventListener("wheel", preventWheelZoom, { passive: false });

    return () => {
      document.removeEventListener("touchstart", preventZoom);
      document.removeEventListener("touchmove", preventZoom);
      document.removeEventListener("wheel", preventWheelZoom);
    };
  }, []);

  return null;
}
