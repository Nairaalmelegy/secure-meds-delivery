import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Stethoscope, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, type }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(type);
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | 'pharmacy'>('patient');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      if (activeTab === 'login') {
        await login(
          formData.get('email') as string,
          formData.get('password') as string
        );
        toast({
          title: "Login successful",
          description: "Welcome back to MediLink!",
        });
      } else {
        const registerData = {
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          email: formData.get('registerEmail') as string,
          phone: formData.get('phone') as string,
          password: formData.get('registerPassword') as string,
          role: userRole,
          ...(userRole === 'patient' && { nationalId: formData.get('nationalId') as string }),
          ...(userRole === 'doctor' && { medicalLicense: formData.get('license') as string }),
          ...(userRole === 'pharmacy' && { pharmacyName: formData.get('pharmacyName') as string }),
        };
        
        await register(registerData);
        toast({
          title: "Account created successfully",
          description: "Welcome to MediLink!",
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            Welcome to MediLink
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
            
            <div className="text-center">
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot your password?
              </a>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
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
                    name="firstName"
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registerEmail">Email</Label>
                <Input 
                  id="registerEmail" 
                  name="registerEmail"
                  type="email" 
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone"
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
                    name="nationalId"
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
                    name="license"
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
                    name="pharmacyName"
                    placeholder="Pharmacy name"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="registerPassword">Password</Label>
                <Input 
                  id="registerPassword" 
                  name="registerPassword"
                  type="password" 
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
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