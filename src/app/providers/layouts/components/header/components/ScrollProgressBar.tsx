import { Box } from "@mantine/core";
import { useState, useRef, useEffect } from "react";

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const doc = document.documentElement;
    const body = document.body;

    const calc = () => {
      const scrollTop =
        window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
      const scrollHeight =
        Math.max(doc.scrollHeight || 0, body.scrollHeight || 0) -
        window.innerHeight;
      const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(Number(percent.toFixed(3)));
      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(calc);
    };

    const onResize = () => {
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    calc();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <Box
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 4,
        width: "100%",
        backgroundColor: "transparent",
        zIndex: 110,
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "var(--mantine-color-primary-6)",
          transform: `scaleX(${Math.max(0, Math.min(1, progress / 100))})`,
          transformOrigin: "left",
          transition: "transform 120ms linear",
          willChange: "transform",
        }}
      />
    </Box>
  );
}
