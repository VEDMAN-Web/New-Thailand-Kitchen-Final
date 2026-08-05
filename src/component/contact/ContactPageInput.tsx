"use client";

interface Props {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  error?: string;
  textarea?: boolean;
}

export default function ContactPageInput({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  textarea = false,
}: Props) {
  const shared =
    "w-full bg-transparent border-0 border-b border-[#D8CFC3] pb-3 pt-1 text-[#1A1A1A] placeholder:text-[#A8A090] outline-none focus:border-[#E0905A] transition-colors";

  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block text-xs tracking-[0.18em] uppercase text-[#8A7A68] mb-2"
      >
        {label}
      </label>

      {textarea ? (
        <textarea
          id={name}
          name={name}
          rows={4}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${shared} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={shared}
        />
      )}

      {error ? (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
