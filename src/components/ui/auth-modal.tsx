import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Stethoscope, Building2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, type }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(type);
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | 'pharmacy'>('patient');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log('Form submitted');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            Welcome to MediLink
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-primary">
                Login
              </Button>
            </form>
            
            <div className="text-center">
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot your password?
              </a>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label>I am a</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={userRole === 'patient' ? 'default' : 'outline'}
                    onClick={() => setUserRole('patient')}
                    className="flex flex-col items-center space-y-1 h-16"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-xs">Patient</span>
                  </Button>
                  <Button
                    type="button"
                    variant={userRole === 'doctor' ? 'default' : 'outline'}
                    onClick={() => setUserRole('doctor')}
                    className="flex flex-col items-center space-y-1 h-16"
                  >
                    <Stethoscope className="h-5 w-5" />
                    <span className="text-xs">Doctor</span>
                  </Button>
                  <Button
                    type="button"
                    variant={userRole === 'pharmacy' ? 'default' : 'outline'}
                    onClick={() => setUserRole('pharmacy')}
                    className="flex flex-col items-center space-y-1 h-16"
                  >
                    <Building2 className="h-5 w-5" />
                    <span className="text-xs">Pharmacy</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email</Label>
                <Input 
                  id="signupEmail" 
                  type="email" 
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+94 XX XXX XXXX"
                  required
                />
              </div>

              {userRole === 'patient' && (
                <div className="space-y-2">
                  <Label htmlFor="nationalId">National ID</Label>
                  <Input 
                    id="nationalId" 
                    placeholder="National ID number"
                    required
                  />
                </div>
              )}

              {userRole === 'doctor' && (
                <div className="space-y-2">
                  <Label htmlFor="license">Medical License Number</Label>
                  <Input 
                    id="license" 
                    placeholder="Medical license number"
                    required
                  />
                </div>
              )}

              {userRole === 'pharmacy' && (
                <div className="space-y-2">
                  <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                  <Input 
                    id="pharmacyName" 
                    placeholder="Pharmacy name"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="signupPassword">Password</Label>
                <Input 
                  id="signupPassword" 
                  type="password" 
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-primary">
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </div>
      </DialogContent>
    </Dialog>
  );
}