import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Import payment provider logos
import mpesaLogo from '@/assets/logos/mpesa-logo.png';
import visaMastercardLogo from '@/assets/logos/visa-mastercard-logo.png';
import flutterwaveLogo from '@/assets/logos/flutterwave-logo.png';
import airtelMoneyLogo from '@/assets/logos/airtel-money-logo.png';

const paymentProviders = [
  {
    name: 'M-Pesa',
    logo: mpesaLogo,
    alt: 'M-Pesa mobile money payment system logo'
  },
  {
    name: 'Visa & Mastercard',
    logo: visaMastercardLogo,
    alt: 'Visa and Mastercard payment cards logo'
  },
  {
    name: 'Flutterwave',
    logo: flutterwaveLogo,
    alt: 'Flutterwave payment gateway logo'
  },
  {
    name: 'Airtel Money',
    logo: airtelMoneyLogo,
    alt: 'Airtel Money mobile payment service logo'
  }
];

export const PaymentLogosCarousel: React.FC = () => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {paymentProviders.map((provider, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3">
              <div className="flex items-center justify-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                <img
                  src={provider.logo}
                  alt={provider.alt}
                  className="h-8 md:h-10 w-auto object-contain filter brightness-90 hover:brightness-100 transition-all duration-300"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-12 bg-background/80 backdrop-blur-sm border-border/50" />
        <CarouselNext className="hidden sm:flex -right-12 bg-background/80 backdrop-blur-sm border-border/50" />
      </Carousel>
    </div>
  );
};