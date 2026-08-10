"use client";

import { useState } from "react";
import { COUNTRY_DIAL_CODES, flagEmoji } from "../../utils/countryDialCodes";

interface Props {
  label: string;
  name: string;
  phoneCode: string;
  onPhoneCodeChange: (code: string) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export default function PhoneContactInput({
  label,
  name,
  phoneCode,
  onPhoneCodeChange,
  value,
  onChange,
  error,
}: Props) {
  const [country, setCountry] = useState(
    () => COUNTRY_DIAL_CODES.find((c) => c.dial === phoneCode) ?? COUNTRY_DIAL_CODES[0]
  );
  const [dialOpen, setDialOpen] = useState(false);
  const [dialSearch, setDialSearch] = useState("");

  const filteredCountries = COUNTRY_DIAL_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(dialSearch.trim().toLowerCase()) ||
      c.dial.includes(dialSearch.trim())
  );

  return (
    <div className="w-full relative">
      <label
        htmlFor={name}
        className="block text-[11px] tracking-[0.18em] uppercase text-[#8A7A68] mb-2"
      >
        {label}
      </label>

      <div className="relative flex items-center border-b border-[#1A1A1A]/20 pb-3 pt-1 transition-colors focus-within:border-[#1A1A1A]">
        {/* Dropdown Button */}
        <div className="relative flex items-center h-full z-10 mr-2">
          <button
            type="button"
            onClick={() => setDialOpen((o) => !o)}
            className="flex items-center gap-1.5 border-r border-[#1A1A1A]/20 pr-2 pl-1 h-[22px] hover:bg-black/5 transition-colors"
          >
            <span className="text-[16px] leading-none flex items-center justify-center -mt-[1px]">
              {flagEmoji(country.iso2)}
            </span>
            <span className="text-[14px] leading-none font-bold text-[#1A1A1A] ml-1">
              {country.dial}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#1A1A1A]/60 shrink-0 ml-0.5"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dialOpen && (
            <div className="absolute left-0 top-full mt-2 w-[240px] overflow-hidden rounded-[8px] border border-[#cfc4c6] bg-white shadow-lg">
              <div className="border-b border-[#e5dcd3] p-2 bg-[#fdfdfd]">
                <input
                  autoFocus
                  value={dialSearch}
                  onChange={(e) => setDialSearch(e.target.value)}
                  placeholder="Search country or code"
                  className="w-full rounded-[4px] border border-[#cfc4c6] bg-white px-2 py-1.5 text-[13px] outline-none focus:border-[#1A1A1A] transition-colors text-[#1A1A1A]"
                />
              </div>
              <div className="max-h-[220px] overflow-y-auto overscroll-contain py-1" data-lenis-prevent>
                {filteredCountries.length === 0 ? (
                  <p className="px-3 py-2 text-[13px] text-[#8A7A68]">No matches found</p>
                ) : (
                  filteredCountries.map((c) => (
                    <button
                      key={c.iso2}
                      type="button"
                      onClick={() => {
                        setCountry(c);
                        onPhoneCodeChange(c.dial);
                        setDialOpen(false);
                        setDialSearch("");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-black/5 transition-colors"
                    >
                      <span className="text-[16px] leading-none">{flagEmoji(c.iso2)}</span>
                      <span className="flex-1 truncate text-[#1A1A1A]">{c.name}</span>
                      <span className="shrink-0 text-[#1A1A1A]/60">{c.dial}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <input
          id={name}
          name={name}
          type="tel"
          value={value}
          onChange={onChange}
          className="w-full bg-transparent border-0 text-[#1A1A1A] outline-none"
        />
      </div>

      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
