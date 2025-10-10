import React, { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const paymentProviders = [
  {
    name: 'M-Pesa',
    logo: '/lovable-uploads/57976727-1964-4bfb-8a24-8203e4dabe4a.png',
    alt: 'M-Pesa mobile money payment system logo'
  },
  {
    name: 'Visa & Mastercard',
    logo: '/lovable-uploads/9f22c927-5c7d-4a77-a269-90809c6e582a.png',
    alt: 'Visa and Mastercard payment cards logo'
  },
  {
    name: 'Flutterwave',
    logo: '/lovable-uploads/06f57747-f061-4922-b5cf-d0c6eed53b19.png',
    alt: 'Flutterwave payment gateway logo'
  },
  {
    name: 'Airtel Money',
    logo: '/lovable-uploads/2d04d732-18aa-40b1-ad81-3c1f3310fb0a.png',
    alt: 'Airtel Money mobile payment service logo'
  },
  {
    name: 'Paystack',
    logo: '/lovable-uploads/05ed5649-3537-4f4f-bfb3-bb04270fd29f.png',
    alt: 'Paystack payment gateway logo'
  }
];

export const PaymentLogosCarousel: React.FC = () => {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (api) {
      // Restart the autoplay when it reaches the end
      api.on('select', () => {
        if (api.selectedScrollSnap() === api.scrollSnapList().length - 1) {
          api.scrollTo(0);
        }
      });
    }
  }, [api]);

  const plugin = React.useMemo(
    () =>
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        rootNode: (emblaRoot) => emblaRoot.parentElement,
      }),
    []
  );

  return (
    <div className="w-full overflow-hidden">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          skipSnaps: false,
          dragFree: true,
        }}
        plugins={[plugin]}
        className="w-full"
        setApi={setApi}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {[...paymentProviders, ...paymentProviders].map((provider, index) => (
            <CarouselItem 
              key={index} 
              className="pl-2 md:pl-4 basis-1/4 md:basis-1/5 transition-opacity duration-300 hover:opacity-80"
            >
              <div className="flex items-center justify-center p-2 grayscale hover:grayscale-0 transition-all duration-300">
                <img
                  src={provider.logo}
                  alt={provider.alt}
                  className="h-8 md:h-10 w-auto object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};