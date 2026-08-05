"use client";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

import { Navigation } from "swiper/modules";

import { aboutSlides } from "./aboutData";

import { useRef } from "react";

import type { Swiper as SwiperClass } from "swiper";

export default function AboutSection() {

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (

    <section className="py-10 ">

      <div className="max-w-[1400px] mx-auto px-6">

        <Swiper

          modules={[Navigation]}

          spaceBetween={30}

          slidesPerView={1}

          loop

          onBeforeInit={(swiper: SwiperClass) => {
            if (typeof swiper.params.navigation === "boolean") return;
            const navigation = swiper.params.navigation ?? {};
            navigation.prevEl = prevRef.current;
            navigation.nextEl = nextRef.current;
            swiper.params.navigation = navigation;
          }}

        >

          {aboutSlides.map((slide) => (

            <SwiperSlide key={slide.id}>

              {/* <AboutSlide {...slide} /> */}

            </SwiperSlide>

          ))}

          <button

            ref={prevRef}

            className="absolute bottom-8 right-28 z-20 w-14 h-14 rounded-full  bg-[#E6C79A] text-white text-3xl"

          >
            ←
          </button>

          <button

            ref={nextRef}

            className="absolute bottom-8 right-8 z-20 w-14 h-14 rounded-full bg-[#C18C4A]  text-white text-3xl"

          >
            →
          </button>

        </Swiper>

      </div>

    </section>

  );
}