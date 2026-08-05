import Image from "next/image";
import { Testimonial } from "./testimonialData";

interface Props {
  testimonial: Testimonial;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TestimonialCard({ testimonial }: Props) {
  return (
    <article className="grid grid-cols-1 sm:grid-cols-[0.9fr_1.1fr] bg-white rounded-[28px] overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.08)] h-full">
      {/* Kitchen image */}
      <div className="relative w-full h-full min-h-[220px] sm:min-h-[380px] lg:min-h-[420px]">
        <Image
          src={testimonial.image}
          alt="Kitchen project"
          fill
          className="object-cover object-center"
          sizes="(max-width: 640px) 100vw, 40vw"
        />
      </div>

      {/* Review panel */}
      <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
        <div className="flex items-center gap-1 mb-5">
          {[...Array(testimonial.rating)].map((_, index) => (
            <span key={index} className="text-[#E0905A] text-lg md:text-xl">
              ★
            </span>
          ))}
        </div>

        <p className="italic text-justify text-[#6B6B6B] text-sm md:text-[15px] leading-7 md:leading-8 flex-1">
          &ldquo;{testimonial.review}&rdquo;
        </p>

        <div className="mt-6 flex items-center gap-3">
          <span className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#E0905A]/15 text-[#B06A34] text-sm font-bold flex items-center justify-center shrink-0">
            {getInitials(testimonial.name)}
          </span>
          <div>
            <h3 className="text-[15px] md:text-base font-bold text-[#1A1A1A]">
              {testimonial.name}
            </h3>
            <p className="text-[11px] md:text-xs tracking-[0.12em] uppercase text-[#9A9A9A]">
              {testimonial.role}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
