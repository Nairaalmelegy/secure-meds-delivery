import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Stethoscope, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, registerSchema } from "@/lib/validation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'register';
  role?: 'patient' | 'doctor' | null;
}

const AuthModal = ({ isOpen, onClose, type, role }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState(type);
  const [userRole, setUserRole] = useState<'patient' | 'doctor'>('patient');
  // Set userRole from prop when modal opens
  useEffect(() => {
    if (isOpen && role) {
      setUserRole(role);
    }
  }, [isOpen, role]);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      if (activeTab === 'login') {
        // Validate login data
        const loginData = {
          email: formData.get('email') as string,
          password: formData.get('password') as string,
        };
        
        const validatedLogin = loginSchema.parse(loginData);
        
        await login(validatedLogin.email, validatedLogin.password);
        toast({
          title: "Login successful",
          description: "Welcome back to MediLink!",
        });
      } else {
        // Validate registration data
        const registerData = {
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          email: formData.get('registerEmail') as string,
          phone: formData.get('phone') as string,
          password: formData.get('registerPassword') as string,
          confirmPassword: formData.get('confirmPassword') as string,
          role: userRole,
          ...(userRole === 'patient' && { nationalId: formData.get('nationalId') as string }),
          ...(userRole === 'doctor' && { license: formData.get('license') as string }),
        };
        
        const validatedRegister = registerSchema.parse(registerData);
        
        await register({
          name: `${validatedRegister.firstName} ${validatedRegister.lastName}`.trim(),
          email: validatedRegister.email,
          phone: validatedRegister.phone,
          password: validatedRegister.password,
          role: validatedRegister.role,
          ...(userRole === 'patient' && { nationalId: validatedRegister.nationalId }),
          ...(userRole === 'doctor' && { medicalLicense: validatedRegister.license }),
        });
        
        toast({
          title: "Account created successfully",
          description: "Welcome to MediLink!",
        });
      }
      onClose();
    } catch (error: any) {
      // Handle validation errors
      if (error.errors) {
        const errorMessages = error.errors.map((err: any) => err.message).join(', ');
        toast({
          title: "Validation failed",
          description: errorMessages,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication failed",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                <div className="grid grid-cols-2 gap-2">
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
};

export default AuthModal;