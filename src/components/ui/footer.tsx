import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Pill, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin 
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand & Contact */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Pill className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-background">MediLink</span>
            </div>
            <p className="text-background/80 text-sm">
              Your trusted partner for safe and reliable medical delivery services across the island.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-background/80">
                <Phone className="h-4 w-4" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-background/80">
                <Mail className="h-4 w-4" />
                <span>support@medilink.lk</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-background/80">
                <MapPin className="h-4 w-4" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-background">Quick Links</h3>
            <div className="space-y-2">
              <a href="#how-it-works" className="block text-sm text-background/80 hover:text-primary transition-colors">
                How it Works
              </a>
              <a href="#for-patients" className="block text-sm text-background/80 hover:text-primary transition-colors">
                For Patients
              </a>
              <a href="#for-doctors" className="block text-sm text-background/80 hover:text-primary transition-colors">
                For Doctors
              </a>
              <a href="#pharmacies" className="block text-sm text-background/80 hover:text-primary transition-colors">
                Partner Pharmacies
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-background">Support</h3>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-background/80 hover:text-primary transition-colors">
                Help Center
              </a>
              <a href="#" className="block text-sm text-background/80 hover:text-primary transition-colors">
                Contact Us
              </a>
              <a href="#" className="block text-sm text-background/80 hover:text-primary transition-colors">
                Track Order
              </a>
              <a href="#" className="block text-sm text-background/80 hover:text-primary transition-colors">
                FAQ
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-background">Stay Updated</h3>
            <p className="text-sm text-background/80">
              Get health tips and exclusive offers delivered to your inbox.
            </p>
            <div className="space-y-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-background/10 border-background/20 text-background placeholder:text-background/60"
              />
              <Button 
                size="sm" 
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-background/80 mb-4 md:mb-0">
            © 2024 MediLink. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-4">
            <a href="#" className="text-background/80 hover:text-primary transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-background/80 hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-background/80 hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-background/80 hover:text-primary transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-background/80 hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-background/80 hover:text-primary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}