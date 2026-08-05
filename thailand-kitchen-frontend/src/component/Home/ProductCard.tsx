import Image from "next/image";

interface ProductCardProps {
  image: string;
  title: string;
}

const ProductCard = ({ image, title }: ProductCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl cursor-pointer">

      <Image
        src={image}
        alt={title}
        width={600}
        height={700}
        className="h-[420px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Bottom Content */}
      <div className="absolute bottom-6 left-5 right-5">

        <div className="w-16 h-[2px] bg-[#C48A2C] mb-4"></div>

        <h3 className="text-white text-lg font-medium line-clamp-2">
          {title}
        </h3>

      </div>

    </div>
  );
};

export default ProductCard;