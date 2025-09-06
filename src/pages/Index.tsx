import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { HeroSection } from "@/components/ui/hero-section";
import { InfoSections } from "@/components/ui/info-sections";
import { Testimonials } from "@/components/ui/testimonials";
import { Footer } from "@/components/ui/footer";
import { AuthModal } from "@/components/ui/auth-modal";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const { toast } = useToast();

  const handleAuthClick = (type: 'login' | 'register') => {
    setAuthType(type);
    setIsAuthModalOpen(true);
  };

  const handleOrderClick = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Medicine ordering will be available once you sign up and login.",
    });
  };

  const handleFindDoctorClick = () => {
    toast({
      title: "Feature Coming Soon", 
      description: "Doctor search will be available in the next update.",
    });
  };

  const handleTrackOrderClick = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Order tracking will be available once you place an order.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      
      <HeroSection 
        onOrderClick={handleOrderClick}
        onFindDoctorClick={handleFindDoctorClick}
        onTrackOrderClick={handleTrackOrderClick}
      />
      
      <InfoSections />
      
      <Testimonials />
      
      <Footer />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        type={authType}
      />
    </div>
  );
};

export default Index;
