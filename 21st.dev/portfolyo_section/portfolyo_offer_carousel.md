Installation: npx shadcn@latest add https://21st.dev/r/ravikatiyar162/offer-carousel

How to use: 

Prompt: 
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
offer-carousel.tsx
import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils"; // Your utility for merging Tailwind classes

// Define the type for a single offer item
export interface Offer {
  id: string | number;
  imageSrc: string;
  imageAlt: string;
  tag: string;
  title: string;
  description: string;
  brandLogoSrc: string;
  brandName: string;
  promoCode?: string;
  href: string;
}

// Props for the OfferCard component
interface OfferCardProps {
  offer: Offer;
}

// The individual card component with hover animation
const OfferCard = React.forwardRef<HTMLAnchorElement, OfferCardProps>(({ offer }, ref) => (
  <motion.a
    ref={ref}
    href={offer.href}
    className="relative flex-shrink-0 w-[300px] h-[380px] rounded-2xl overflow-hidden group snap-start"
    whileHover={{ y: -8 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    style={{ perspective: "1000px" }}
  >
    {/* Background Image */}
    <img
      src={offer.imageSrc}
      alt={offer.imageAlt}
      className="absolute inset-0 w-full h-2/4 object-cover transition-transform duration-500 group-hover:scale-110"
    />
    {/* Card Content */}
    <div className="absolute bottom-0 left-0 right-0 h-2/4 bg-card p-5 flex flex-col justify-between">
      <div className="space-y-2">
        {/* Tag */}
        <div className="flex items-center text-xs text-muted-foreground">
          <Tag className="w-4 h-4 mr-2 text-primary" />
          <span>{offer.tag}</span>
        </div>
        {/* Title & Description */}
        <h3 className="text-xl font-bold text-card-foreground leading-tight">{offer.title}</h3>
        <p className="text-sm text-muted-foreground">{offer.description}</p>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <img src={offer.brandLogoSrc} alt={`${offer.brandName} logo`} className="w-8 h-8 rounded-full bg-muted" />
          <div>
            <p className="text-xs font-semibold text-card-foreground">{offer.brandName}</p>
            {offer.promoCode && (
              <p className="text-xs text-muted-foreground">{offer.promoCode}</p>
            )}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground transform transition-transform duration-300 group-hover:rotate-[-45deg] group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  </motion.a>
));
OfferCard.displayName = "OfferCard";

// Props for the OfferCarousel component
export interface OfferCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  offers: Offer[];
}

// The main carousel component with scroll functionality
const OfferCarousel = React.forwardRef<HTMLDivElement, OfferCarouselProps>(
  ({ offers, className, ...props }, ref) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const { current } = scrollContainerRef;
        const scrollAmount = current.clientWidth * 0.8; // Scroll by 80% of the container width
        current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    };

    return (
      <div ref={ref} className={cn("relative w-full group", className)} {...props}>
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute top-1/2 -translate-y-1/2 left-0 z-10 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm border border-border flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/80 disabled:opacity-0"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
        
        {/* Right Scroll Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute top-1/2 -translate-y-1/2 right-0 z-10 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm border border-border flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/80 disabled:opacity-0"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    );
  }
);
OfferCarousel.displayName = "OfferCarousel";

export { OfferCarousel, OfferCard };

demo.tsx
import { OfferCarousel, type Offer } from "@/components/ui/offer-carousel";

// Sample data for the carousel
const sampleOffers: Offer[] = [
  {
    id: 1,
    imageSrc: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1966&auto=format&fit=crop",
    imageAlt: "International travel landmarks collage",
    tag: "Discount",
    title: "Up to ₹3000 OFF",
    description: "On International Flights.",
    brandLogoSrc: "https://static.twidpay.com/co/mobile_app_images/brand_logos/square/easemytripsquare.png?size=40",
    brandName: "Ease My Trip",
    promoCode: "EMTWID",
    href: "#",
  },
  {
    id: 2,
    imageSrc: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop",
    imageAlt: "A delicious looking burger",
    tag: "Discount",
    title: "Snack more. Save more.",
    description: "Get ₹75 OFF on purchases of ₹299 or more.",
    brandLogoSrc: "https://static.twidpay.com/co/mobile_app_images/brand_logos/square/mcdonaldssquare.png?size=40",
    brandName: "McD",
    promoCode: "TWID75",
    href: "#",
  },
  {
    id: 3,
    imageSrc: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop",
    imageAlt: "Logos of popular streaming services",
    tag: "Discount",
    title: "Flat ₹550 OFF on Timesprime",
    description: "Exclusive offer on Times Prime Membership.",
    brandLogoSrc: "https://static.twidpay.com/co/mobile_app_images/brand_logos/square/timesprimesquare.png?size=40",
    brandName: "Timesprime",
    promoCode: "TWID550",
    href: "#",
  },
  {
    id: 4,
    imageSrc: "https://plus.unsplash.com/premium_photo-1728889749470-97eb0a2e2028?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2FzaGJhY2t8ZW58MHx8MHx8fDA%3D?q=80&w=2070&auto=format&fit=crop",
    imageAlt: "A person holding a phone with a payment app",
    tag: "Cashback",
    title: "10% Instant Cashback",
    description: "On RuPay Credit Card transactions.",
    brandLogoSrc: "https://static.twidpay.com/co/mobile_app_images/icons/rupay_rcc.png?size=40",
    brandName: "Rupay CC",
    promoCode: "RCC10",
    href: "#",
  },
    {
    id: 5,
    imageSrc: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop",
    imageAlt: "Gourmet food on a plate",
    tag: "Offer",
    title: "Flat 20% OFF",
    description: "On dining at partner restaurants.",
    brandLogoSrc: "https://twidpay.com/assets/new-square-logos/swiggysquare.webp?size=40",
    brandName: "Dineout",
    promoCode: "DINE20",
    href: "#",
  },
];


// The demo component
export default function OfferCarouselDemo() {
  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold mb-6 text-foreground">Deals of the Day</h2>
        <OfferCarousel offers={sampleOffers} />
      </div>
    </div>
  );
}
```

Install NPM dependencies:
```bash
lucide-react, framer-motion
```

Code:

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils"; // Your utility for merging Tailwind classes

// Define the type for a single offer item
export interface Offer {
  id: string | number;
  imageSrc: string;
  imageAlt: string;
  tag: string;
  title: string;
  description: string;
  brandLogoSrc: string;
  brandName: string;
  promoCode?: string;
  href: string;
}

// Props for the OfferCard component
interface OfferCardProps {
  offer: Offer;
}

// The individual card component with hover animation
const OfferCard = React.forwardRef<HTMLAnchorElement, OfferCardProps>(({ offer }, ref) => (
  <motion.a
    ref={ref}
    href={offer.href}
    className="relative flex-shrink-0 w-[300px] h-[380px] rounded-2xl overflow-hidden group snap-start"
    whileHover={{ y: -8 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    style={{ perspective: "1000px" }}
  >
    {/* Background Image */}
    <img
      src={offer.imageSrc}
      alt={offer.imageAlt}
      className="absolute inset-0 w-full h-2/4 object-cover transition-transform duration-500 group-hover:scale-110"
    />
    {/* Card Content */}
    <div className="absolute bottom-0 left-0 right-0 h-2/4 bg-card p-5 flex flex-col justify-between">
      <div className="space-y-2">
        {/* Tag */}
        <div className="flex items-center text-xs text-muted-foreground">
          <Tag className="w-4 h-4 mr-2 text-primary" />
          <span>{offer.tag}</span>
        </div>
        {/* Title & Description */}
        <h3 className="text-xl font-bold text-card-foreground leading-tight">{offer.title}</h3>
        <p className="text-sm text-muted-foreground">{offer.description}</p>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <img src={offer.brandLogoSrc} alt={`${offer.brandName} logo`} className="w-8 h-8 rounded-full bg-muted" />
          <div>
            <p className="text-xs font-semibold text-card-foreground">{offer.brandName}</p>
            {offer.promoCode && (
              <p className="text-xs text-muted-foreground">{offer.promoCode}</p>
            )}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground transform transition-transform duration-300 group-hover:rotate-[-45deg] group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  </motion.a>
));
OfferCard.displayName = "OfferCard";

// Props for the OfferCarousel component
export interface OfferCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  offers: Offer[];
}

// The main carousel component with scroll functionality
const OfferCarousel = React.forwardRef<HTMLDivElement, OfferCarouselProps>(
  ({ offers, className, ...props }, ref) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const { current } = scrollContainerRef;
        const scrollAmount = current.clientWidth * 0.8; // Scroll by 80% of the container width
        current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    };

    return (
      <div ref={ref} className={cn("relative w-full group", className)} {...props}>
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute top-1/2 -translate-y-1/2 left-0 z-10 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm border border-border flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/80 disabled:opacity-0"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
        
        {/* Right Scroll Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute top-1/2 -translate-y-1/2 right-0 z-10 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm border border-border flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/80 disabled:opacity-0"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    );
  }
);
OfferCarousel.displayName = "OfferCarousel";

export { OfferCarousel, OfferCard };