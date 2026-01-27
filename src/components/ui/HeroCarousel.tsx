import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const data = [
  {
    category: "Rods",
    image: "/images/home/heromain2.jpg", // Placeholder
  },
  {
    category: "Sheets",
    image: "/images/home/heromain2.jpg", // Placeholder
  },
  {
    category: "Tubes",
    image: "/images/home/heromain2.jpg", // Placeholder
  },
  {
    category: "Custom",
    image: "/images/home/heromain2.jpg", // Placeholder
  },
]

export function HeroCarousel() {
  return (
    <div className="w-full max-w-xs mt-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-sm font-semibold text-muted-foreground">Popular Products</span>
          <div className="flex gap-1">
            <CarouselPrevious className="static translate-y-0 h-6 w-6" />
            <CarouselNext className="static translate-y-0 h-6 w-6" />
          </div>
        </div>
        <CarouselContent className="-ml-2">
          {data.map((item, index) => (
            <CarouselItem key={index} className="pl-2 basis-1/2 md:basis-1/3 lg:basis-1/3">
              <div className="p-0">
                <div className="rounded-xl overflow-hidden aspect-square border-2 border-transparent hover:border-primary transition-all cursor-pointer group relative">
                  <img
                    src={item.image}
                    alt={item.category}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                  <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white uppercase tracking-wider">{item.category}</span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
