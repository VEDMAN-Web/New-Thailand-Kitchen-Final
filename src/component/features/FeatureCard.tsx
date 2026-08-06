import Image from "next/image";

interface Props {
  item: {
    title: string;
    description: string;
    icon?: string;
  };
}

export default function FeatureCard({ item }: Props) {
  const icon = item.icon?.trim();
  const remoteIcon =
    Boolean(icon) &&
    (icon!.startsWith("http") || icon!.startsWith("/uploads"));

  return (
    <div className="group relative overflow-hidden bg-white rounded-2xl border border-black/5 p-7 sm:p-8 shadow-[0_6px_24px_rgba(0,0,0,0.04)] h-full">
      <span
        aria-hidden
        className="absolute inset-0 z-0 bg-[#E0905A] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"
      />

      <div className="relative z-10">
        {icon ? (
          <div className="relative mb-4 h-10 w-10">
            <Image
              src={icon}
              alt=""
              fill
              className="object-contain"
              sizes="40px"
              unoptimized={remoteIcon}
            />
          </div>
        ) : null}
        <h3 className="text-lg font-semibold text-[#1A1A1A] group-hover:text-white transition-colors duration-500">
          {item.title}
        </h3>

        <p className="mt-3 text-[#6B6B6B] text-sm leading-7 group-hover:text-white/90 transition-colors duration-500">
          {item.description}
        </p>
      </div>
    </div>
  );
}
