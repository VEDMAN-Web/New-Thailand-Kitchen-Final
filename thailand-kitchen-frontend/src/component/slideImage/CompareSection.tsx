// "use client";

// import { useState, useEffect, useRef } from "react";
// import Image from "next/image";
// import { compareData } from "./compareData";

// export default function CompareSection() {
//   const [active, setActive] = useState<"left" | "right" | null>(null);

//   const sectionRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (!entry.isIntersecting) {
//           setActive(null); 
//         }
//       },
//       {
//         threshold: 0.2,
//       }
//     );

//     if (sectionRef.current) {
//       observer.observe(sectionRef.current);
//     }

//     return () => observer.disconnect();
//   }, []);

//   return (
//     <section ref={sectionRef} className="py-20">
//       <div className="max-w-7xl mx-auto px-6">

//         <div className="flex h-[650px] rounded-3xl overflow-hidden">

//           {/* Left */}
//           <div
//             onClick={() => setActive("left")}
//             className={`
//               relative cursor-pointer transition-all duration-700
//               ${
//                 active === "left"
//                   ? "w-full"
//                   : active === "right"
//                   ? "w-0"
//                   : "w-1/2"
//               }
//             `}
//           >
//             <Image
//               src={compareData.before}
//               alt="Before"
//               fill
//               className="object-cover"
//             />

//             <div className="absolute bottom-10 left-10 text-white">
//               <h2 className="text-3xl font-bold">
//                 Before
//               </h2>
//             </div>
//           </div>

//           {/* Right */}
//           <div
//             onClick={() => setActive("right")}
//             className={`
//               relative cursor-pointer transition-all duration-700
//               ${
//                 active === "right"
//                   ? "w-full"
//                   : active === "left"
//                   ? "w-0"
//                   : "w-1/2"
//               }
//             `}
//           >
//             <Image
//               src={compareData.after}
//               alt="After"
//               fill
//               className="object-cover"
//             />

//             <div className="absolute bottom-10 left-10 text-white">
//               <h2 className="text-3xl font-bold">
//                 After
//               </h2>
//             </div>
//           </div>

//         </div>

//       </div>
//     </section>
//   );
// }

"use client";

import { useState } from "react";
import Image from "next/image";
import { compareData } from "./compareData";

export default function BeforeAfter() {
  const [position, setPosition] = useState(50);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

  // Detect drag direction
  if (percent > position) {
    setDirection("right");
  } else if (percent < position) {
    setDirection("left");
  }

  setPosition(percent);
};

  return (
    <section className="py-20">
      <div
        className="relative mx-auto max-w-7xl h-[300px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-3xl cursor-ew-resize select-none"
        onMouseMove={(e) => {
          if (e.buttons === 1) handleMove(e);
        }}
        onMouseDown={handleMove}
      >
        {/* After Image */}
        <Image
          src={compareData.after}
          alt="After"
          fill
          className={`object-cover transition-transform duration-500 ${
                direction === "left" ? "scale-105" : "scale-100"
            }`}
        />

        {/* Before Image */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }} 
        >
          <Image
            src={compareData.before}
            alt="Before"
            fill
            className={`object-cover transition-transform duration-500 ${
                direction === "right" ? "scale-105" : "scale-100"
            }`}
          />
        </div>

        {/* Divider */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#B8824A] text-white flex items-center justify-center shadow-lg">
            ↔
          </div>
        </div>
      </div>
    </section>
  );
}