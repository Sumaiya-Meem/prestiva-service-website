import React from 'react';
import HeroSection from '../components/sections/home/HeroSection';
import TrustStats from '../components/sections/home/TrustStats';
import ServicesOverview from '../components/sections/home/ServicesOverview';
import CommercialSpotlight from '../components/sections/home/CommercialSpotlight';
import WhyChoose from '../components/sections/home/WhyChoose';
import Reviews from '../components/sections/home/Reviews';
import BeforeAfterGallery from '../components/sections/home/BeforeAfterGallery';
import PricingOverview from '../components/sections/home/PricingOverview';
import CleaningChecklist from '../components/sections/home/CleaningChecklist';
import AddOnServices from '../components/sections/home/AddOnServices';
import FAQ from '../components/sections/home/FAQ';
import ServiceAreas from '../components/sections/home/ServiceAreas';
import AboutMini from '../components/sections/home/AboutMini';
import CTABanner from '../components/sections/home/CTABanner';

const HomePage = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <TrustStats />
      <ServicesOverview />
      <CommercialSpotlight />
      <WhyChoose />
      <Reviews />
      <BeforeAfterGallery />
      <PricingOverview />
      <CleaningChecklist />
      <AddOnServices />
      <FAQ />
      <ServiceAreas />
      <AboutMini />
      <CTABanner />
    </div>
  );
};

export default HomePage;
