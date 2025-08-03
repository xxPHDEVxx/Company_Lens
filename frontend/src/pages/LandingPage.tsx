import { 
  HeroSection, 
  HowItWorks, 
  StatsSection, 
  TestimonialsSection, 
  FAQSection, 
  Footer 
} from '../components/landing_page';

const LandingPage = () => (
  <div className="min-h-screen">
    {/* Hero Section */}
    <HeroSection />
    
    {/* How It Works Section */}
    <HowItWorks />
    
    {/* Stats Section */}
    <StatsSection />
    
    {/* Testimonials Section */}
    <TestimonialsSection />
    
    {/* FAQ Section */}
    <FAQSection />
    
    {/* Footer */}
    <Footer />
  </div>
);

export default LandingPage; 