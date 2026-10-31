"use client";

import { useRef, useState } from "react";
import CmsResolvedImage from "../CmsResolvedImage";

interface Props {
  item: {
    title: string;
    description: string;
    icon?: string;
  };
}

export default function FeatureCard({ item }: Props) {
  const icon = item.icon?.trim();
  const [active, setActive] = useState(false);

  // Tracks whether the current interaction started as a pointer-down so we
  // can toggle "active" on tap (pointerup) without conflicting with the
  // continuous hover path used by mouse devices.
  const pointerDownRef = useRef(false);

  const handlePointerEnter = () => {
    // Mouse/stylus: activate immediately on enter (same as :hover)
    setActive(true);
  };

  const handlePointerLeave = () => {
    pointerDownRef.current = false;
    setActive(false);
  };

  const handlePointerDown = () => {
    pointerDownRef.current = true;
  };

  const handlePointerUp = () => {
    // Touch taps arrive as pointerdown → pointerup without a preceding
    // pointerenter, so we need to activate here for touch devices.
    if (pointerDownRef.current) {
      setActive((prev) => !prev);
    }
    pointerDownRef.current = false;
  };

  return (
    <div
      className="relative overflow-hidden bg-white rounded-2xl border border-black/5 p-4 sm:p-8 shadow-[0_6px_24px_rgba(0,0,0,0.04)] h-full cursor-pointer select-none"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      // Prevent the browser from cancelling pointer events mid-gesture
      style={{ touchAction: "auto" }}
    >
      {/* Orange slide-up background — driven by `active` state */}
      <span
        aria-hidden
        className={`absolute inset-0 z-0 bg-[#E0905A] transition-transform duration-500 ease-out ${
          active ? "translate-y-0" : "translate-y-full"
        }`}
      />

      <div className="relative z-10">
        {icon ? (
          <div className="relative mb-2 sm:mb-4 h-7 w-7 sm:h-10 sm:w-10">
            <CmsResolvedImage
              src={icon}
              alt=""
              fill
              className="object-contain"
              sizes="40px"
              aria-hidden
            />
          </div>
        ) : null}
        <h3
          className={`text-sm sm:text-lg font-semibold transition-colors duration-500 ${
            active ? "text-white" : "text-[#1A1A1A]"
          }`}
        >
          {item.title}
        </h3>

        <p
          className={`mt-1.5 sm:mt-3 text-xs sm:text-sm leading-5 sm:leading-6 transition-colors duration-500 ${
            active ? "text-white/90" : "text-[#6B6B6B]"
          }`}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
}
