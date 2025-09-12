import React, { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { HeroSection } from "@/components/ui/hero-section";
import { InfoSections } from "@/components/ui/info-sections";
import { Testimonials } from "@/components/ui/testimonials";
import { Footer } from "@/components/ui/footer";
import AuthModal from "@/components/ui/auth-modal";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const [signupRole, setSignupRole] = useState<'patient' | 'doctor' | null>(null);
  const { toast } = useToast();

  const handleAuthClick = (type: 'login' | 'register') => {
    setAuthType(type);
    setSignupRole(null);
    setIsAuthModalOpen(true);
  };

  // Listen for custom events from InfoSections buttons
  // (e.g. Start Ordering Now, Sign up as a doctor)
  // detail: { type: 'login' | 'register', role: 'patient' | 'doctor' }
  React.useEffect(() => {
    const handler = (e: any) => {
      setAuthType(e.detail.type);
      setSignupRole(e.detail.role || null);
      setIsAuthModalOpen(true);
    };
    window.addEventListener('open-auth-modal', handler);
    return () => window.removeEventListener('open-auth-modal', handler);
  }, []);


  // 'Get Started' button: go to signup
  const handleOrderClick = () => {
    setAuthType('register');
    setIsAuthModalOpen(true);
  };

  // 'Learn More' button: scroll to How it Works
  const handleFindDoctorClick = () => {
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
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
        role={signupRole}
      />
    </div>
  );
};

export default Index;
