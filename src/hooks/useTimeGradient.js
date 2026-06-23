import { useState, useEffect } from "react";

const GRADIENTS = {
  dawn:  "linear-gradient(135deg, #f7d5b5 0%, #f0b89a 40%, #e8a08e 100%)",
  day:   "linear-gradient(135deg, #e8d5c4 0%, #d4b8a8 50%, #c19b87 100%)",
  dusk:  "linear-gradient(135deg, #c9a0c9 0%, #b08aad 40%, #8b6e8e 100%)",
  night: "linear-gradient(135deg, #2d2845 0%, #1e1a3a 50%, #151228 100%)",
};

function getTimeSlot() {
  const h = new Date().getHours();
  if (h >= 5 && h < 8) return "dawn";
  if (h >= 8 && h < 17) return "day";
  if (h >= 17 && h < 20) return "dusk";
  return "night";
}

export default function useTimeGradient() {
  const [slot, setSlot] = useState(getTimeSlot);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlot(getTimeSlot());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--hero-grad", GRADIENTS[slot]);
  }, [slot]);

  return slot;
}
