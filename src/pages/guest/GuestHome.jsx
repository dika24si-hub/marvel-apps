import React from "react";
import GuestNavbar from "../../components/guest/GuestNavbar";
import HeroSection from "../../components/guest/HeroSection";
import StatisticsSection from "../../components/guest/StatisticsSection";
import FeaturesSection from "../../components/guest/FeaturesSection";
import HowItWorksSection from "../../components/guest/HowItWorksSection";
import AdvantagesSection from "../../components/guest/AdvantagesSection";
import AboutSection from "../../components/guest/AboutSection";
import DoctorsSection from "../../components/guest/DoctorsSection";
import TestimonialSection from "../../components/guest/TestimonialSection";
import GallerySection from "../../components/guest/GallerySection";
import PricingSection from "../../components/guest/PricingSection";
import FAQSection from "../../components/guest/FAQSection";
import CTASection from "../../components/guest/CTASection";
import GuestFooter from "../../components/guest/GuestFooter";
import ChatWidget from "../../components/guest/ChatWidget";
import "./guest.css";

const GuestHome = () => {
  return (
    <div className="guest-page">
      {/* 1 */}  <GuestNavbar />
      {/* 2 */}  <HeroSection />
      {/* 3 */}  <StatisticsSection />
      {/* 4 */}  <FeaturesSection />
      {/* 5 */}  <HowItWorksSection />
      {/* 6 */}  <AdvantagesSection />
      {/* 7 */}  <AboutSection />
      {/* 8 */}  <DoctorsSection />
      {/* 9 */}  <TestimonialSection />
      {/* 10 */} <GallerySection />
      {/* 11 */} <PricingSection />
      {/* 12 */} <FAQSection />
      {/* 13 */} <CTASection />
      {/* 14 */} <GuestFooter />
      <ChatWidget />
    </div>
  );
};

export default GuestHome;
