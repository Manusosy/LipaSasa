import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
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
              <div className="flex items-center justify-center">
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