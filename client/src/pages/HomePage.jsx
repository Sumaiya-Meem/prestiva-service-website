import React from 'react';
import Seo from '../components/utils/Seo';
import HeroSection from '../components/sections/home/HeroSection';
import TrustStats from '../components/sections/home/TrustStats';
import ServicesOverview from '../components/sections/home/ServicesOverview';
import CommercialSpotlight from '../components/sections/home/CommercialSpotlight';
import WhoWeWorkWith from '../components/sections/home/WhoWeWorkWith';
import WhyChoose from '../components/sections/home/WhyChoose';
import Reviews from '../components/sections/home/Reviews';
import BeforeAfterGallery from '../components/sections/home/BeforeAfterGallery';
import ResultsReel from '../components/sections/home/ResultsReel';
import PricingOverview from '../components/sections/home/PricingOverview';
import AddOnServices from '../components/sections/home/AddOnServices';
import FAQ from '../components/sections/home/FAQ';
import ServiceAreas from '../components/sections/home/ServiceAreas';
import AboutMini from '../components/sections/home/AboutMini';
import CTABanner from '../components/sections/home/CTABanner';

const HomePage = () => {
  return (
    <div className="home-page">
      <Seo
        title="Premium Property Maintenance, Landscaping & Cleaning in Adelaide | Prestiva"
        description="Your Partner in Property Excellence. Property maintenance, landscaping and turf, plus commercial & builders cleaning across Adelaide. Fully insured, police checked. Get a free quote — call 0403 540 227."
        path="/"
      />
      <HeroSection />
      <TrustStats />
      <ServicesOverview />
      <CommercialSpotlight />
      <WhoWeWorkWith />
      <WhyChoose />
      <Reviews />
      <BeforeAfterGallery />
      <ResultsReel />
      <PricingOverview />
      <AddOnServices />
      <FAQ />
      <ServiceAreas />
      <AboutMini />
      <CTABanner />
    </div>
  );
};

export default HomePage;
