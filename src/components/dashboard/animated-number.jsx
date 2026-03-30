import { animate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedNumber({ value, suffix = "" }) {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (current) => {
      setDisplayValue(Math.round(current));
    });

    return unsubscribe;
  }, [motionValue]);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 1.1, ease: "easeOut" });
    return () => controls.stop();
  }, [motionValue, value]);

  return <span>{displayValue}{suffix}</span>;
}
