"use client";

import React from "react";
import Image from "next/image";

interface ContactInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  icon: string;
  textarea?: boolean;
  error?: string;
}

const ContactInput = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  textarea = false,
  error,
}: ContactInputProps) => {
  return (
    <div className="w-full">
      <label className="block mb-3 text-[18px] font-medium text-[#2B1B0A]">
        {label}
      </label>

      <div className="relative">
        {/* Left Icon */}
        <Image
          src={icon}
          alt={label}
          width={18}
          height={18}
          className="absolute left-4 top-4"
        />

        {textarea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={6}
            placeholder={placeholder}
            className="w-full rounded-xl border border-[#B8A28B] bg-transparent pl-12 pr-4 py-4 resize-none outline-none focus:border-[#B8824A] transition"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full h-14 rounded-xl border border-[#B8A28B] bg-transparent pl-12 pr-4 outline-none focus:border-[#B8824A] transition"
          />
        )}
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"
            />
            </svg>

            <p className="text-sm text-red-500 font-medium">
            {error}
            </p>
        </div>
        )}
    </div>
  );
};

export default ContactInput;