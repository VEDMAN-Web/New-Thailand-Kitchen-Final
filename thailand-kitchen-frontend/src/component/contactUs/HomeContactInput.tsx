"use client";

interface Props {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  error?: string;
}

export default function HomeContactInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
}: Props) {
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block text-[11px] tracking-[0.18em] uppercase text-[#8A7A68] mb-2"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent border-0 border-b border-[#1A1A1A]/20 pb-3 pt-1 text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors"
      />
      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
