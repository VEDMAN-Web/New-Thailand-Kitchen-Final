import Image from "next/image";

interface StatCardProps {
  icon: string;
  number: string;
  title: string;
}

export default function StatCard({
  icon,
  number,
  title,
}: StatCardProps) {
  return (
    <div
      className="
        bg-[#FAF5EF]
        border
        border-[#D7C0A0]
        rounded-3xl
        px-8
        py-8
        flex
        items-center
        gap-5
        shadow-sm
        hover:shadow-lg
        transition
        duration-300
      "
    >
      <Image
        src={icon}
        alt={title}
        width={60}
        height={60}
      />

      <div>
        <h2 className="text-4xl font-bold text-[#C18C4A]">
          {number}
        </h2>

        <p className="text-[#5B4630] font-medium mt-1">
          {title}
        </p>
      </div>
    </div>
  );
}