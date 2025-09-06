import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill, Stethoscope, Truck, Shield, Clock, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

interface HeroSectionProps {
  onOrderClick: () => void;
  onFindDoctorClick: () => void;
  onTrackOrderClick: () => void;
}

export function HeroSection({ onOrderClick, onFindDoctorClick, onTrackOrderClick }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary-light/20 to-secondary-light/20 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Your Health,{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Delivered Safely
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Connect with verified doctors, upload prescriptions, and get medicines delivered 
                to your doorstep with complete safety and convenience.
              </p>
            </div>

            {/* Quick Access Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={onOrderClick}
                className="bg-gradient-primary hover:opacity-90 shadow-hero flex items-center space-x-2"
              >
                <Pill className="h-5 w-5" />
                <span>Order Medicine</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={onFindDoctorClick}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground flex items-center space-x-2"
              >
                <Stethoscope className="h-5 w-5" />
                <span>Find Doctor</span>
              </Button>
              <Button 
                size="lg" 
                variant="ghost" 
                onClick={onTrackOrderClick}
                className="hover:bg-primary/10 flex items-center space-x-2"
              >
                <Truck className="h-5 w-5" />
                <span>Track Order</span>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-success" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-info" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Stethoscope className="h-4 w-4 text-primary" />
                <span>Verified Doctors</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>Island Wide</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-hero">
              <img 
                src={heroImage} 
                alt="Medical delivery service with doctor and medicines"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Floating Cards */}
            <Card className="absolute -top-4 -left-4 p-4 bg-card shadow-card border-success border-2">
              <div className="flex items-center space-x-2">
                <div className="bg-success p-2 rounded-full">
                  <Pill className="h-4 w-4 text-success-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">1000+</p>
                  <p className="text-xs text-muted-foreground">Medicines Available</p>
                </div>
              </div>
            </Card>

            <Card className="absolute -bottom-4 -right-4 p-4 bg-card shadow-card border-primary border-2">
              <div className="flex items-center space-x-2">
                <div className="bg-primary p-2 rounded-full">
                  <Stethoscope className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">50+</p>
                  <p className="text-xs text-muted-foreground">Verified Doctors</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}