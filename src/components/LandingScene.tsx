import { Component, lazy, Suspense, useEffect, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";

const RupeeScene = lazy(() => import("./RupeeScene"));

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unable to render the 3D landing scene; using the static fallback.", error, info.componentStack);
  }

  render(): ReactNode {
    return this.state.failed ? <div className="cinema-scene-fallback" aria-hidden="true" /> : this.props.children;
  }
}

export default function LandingScene() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const browser = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const lowPower = Boolean(browser.connection?.saveData)
      || (typeof browser.deviceMemory === "number" && browser.deviceMemory <= 4)
      || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
    setSupported(!reducedMotion && !mobile && !lowPower);
  }, []);

  if (!supported) return <div className="cinema-scene-fallback" aria-hidden="true" />;
  return <SceneErrorBoundary>
    <Suspense fallback={<div className="cinema-scene-fallback" aria-hidden="true" />}>
      <RupeeScene />
    </Suspense>
  </SceneErrorBoundary>;
}
