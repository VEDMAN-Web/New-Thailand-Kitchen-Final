import Image from "next/image";
import { Download } from "lucide-react";

interface ProductProps {
  item: {
    id: number;
    category: string;
    title: string;
    image: string;
    download: string;
  };
}

export default function CatlogCard({ item }: ProductProps) {
  return (
    <div className="group bg-white rounded-[24px] p-3 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.06)] h-full">
      <div className="relative rounded-[18px] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          width={500}
          height={640}
          className="w-full h-[320px] sm:h-[360px] md:h-[400px] object-cover scale-110 transition-transform duration-700 ease-out group-hover:scale-100"
        />
      </div>

      <div className="flex items-end justify-between gap-3 px-2 pt-4 pb-2">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#E0905A] font-semibold mb-1.5">
            {item.category}
          </p>
          <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide text-[#1A1A1A]">
            {item.title}
          </h3>
        </div>

        <a
          href={item.download}
          download
          aria-label={`Download ${item.category} catalogue`}
          className="shrink-0 text-[#E0905A] hover:text-[#1A1A1A] transition-colors"
        >
          <Download size={22} />
        </a>
      </div>
    </div>
  );
}
