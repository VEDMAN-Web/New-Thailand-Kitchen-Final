export interface Testimonial {
  id: number;
  image: string;
  name: string;
  role: string;
  rating: number;
  review: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    image: "/testimonial/image1.png",
    name: "Brooklyn Simmons",
    role: "Homeowner, Bangkok",
    rating: 5,
    review:
      "We had a small kitchen with eleven years of accumulated clutter and no real system. The team came in, listened to how we actually cook, and redesigned everything around our habits. The pull-out pantry and the corner unit with rotating shelves changed everything. It feels twice the size now.",
  },
  {
    id: 2,
    image: "/testimonial/image1.png",
    name: "Sarah Johnson",
    role: "Homeowner, Phuket",
    rating: 5,
    review:
      "Excellent craftsmanship and premium finishing. Every cabinet is perfectly installed and the design looks luxurious. The team guided us through every material choice and the result is beyond what we imagined.",
  },
  {
    id: 3,
    image: "/testimonial/image1.png",
    name: "Michael Brown",
    role: "Homeowner, Chiang Mai",
    rating: 5,
    review:
      "Professional team from consultation to installation. Highly recommended for anyone looking for a modern kitchen. They respected our timeline and the finish quality is exceptional throughout.",
  },
];
