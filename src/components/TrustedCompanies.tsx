import React from 'react';

const trustedCompanies = [
  { name: 'Company 1', logo: '/image1.png' },
  { name: 'Company 2', logo: '/image2.png' },
  { name: 'Company 3', logo: '/image3.png' },
  { name: 'Company 4', logo: '/image4.png' },
  { name: 'Company 5', logo: '/image5.png' },
] as const;

export const TrustedCompanies: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white shadow-sm">
      <div className="flex items-center gap-2">
        {trustedCompanies.map((company, index) => (
          <div 
            key={index}
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white/50"
          >
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="w-7 h-7 object-contain hover:scale-110 transition-transform"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                console.error(`Failed to load image: ${company.logo}`);
              }}
            />
          </div>
        ))}
      </div>
      <span className="text-sm font-medium text-[#0033a1]/80">
        Rated 4.9/5 by 500+ businesses
      </span>
    </div>
  );
};
