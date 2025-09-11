import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as 'patient' | 'doctor' | 'pharmacy',
    nationalId: '',
    medicalLicense: '',
    pharmacyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const registrationData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      };

      // Add role-specific fields
      if (formData.role === 'patient' && formData.nationalId) {
        registrationData.nationalId = formData.nationalId;
      } else if (formData.role === 'doctor' && formData.medicalLicense) {
        registrationData.medicalLicense = formData.medicalLicense;
      } else if (formData.role === 'pharmacy' && formData.pharmacyName) {
        registrationData.pharmacyName = formData.pharmacyName;
      }

      await register(registrationData);
      
      if (formData.role === 'doctor') {
        toast({
          title: "Registration successful!",
          description: "Your account is pending approval from our pharmacy admin. You'll be notified once approved.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Welcome to MediLink!",
          description: "Your account has been created successfully",
        });
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor': return 'bg-primary/10 text-primary border-primary/20';
      case 'pharmacy': return 'bg-secondary/10 text-secondary border-secondary/20';
      default: return 'bg-success/10 text-success border-success/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-hero bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-secondary rounded-full flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
            Join MediLink
          </CardTitle>
          <p className="text-muted-foreground">Create your account to get started</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <Label>Account Type</Label>
            <div className="flex gap-2">
              {(['patient', 'doctor', 'pharmacy'] as const).map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={formData.role === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleInputChange('role', role)}
                  className={formData.role === role ? 'bg-gradient-primary' : ''}
                  disabled={loading}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>
            <Badge className={getRoleColor(formData.role)} variant="outline">
              {formData.role === 'patient' && 'Patients can order medicines and upload prescriptions'}
              {formData.role === 'doctor' && 'Doctors can verify prescriptions (requires admin approval)'}
              {formData.role === 'pharmacy' && 'Pharmacies can manage medicines and orders'}
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {formData.role === 'patient' && (
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID (Optional)</Label>
                <Input
                  id="nationalId"
                  placeholder="Enter your National ID"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange('nationalId', e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {formData.role === 'doctor' && (
              <div className="space-y-2">
                <Label htmlFor="medicalLicense">Medical License (Optional)</Label>
                <Input
                  id="medicalLicense"
                  placeholder="Enter your medical license number"
                  value={formData.medicalLicense}
                  onChange={(e) => handleInputChange('medicalLicense', e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {formData.role === 'pharmacy' && (
              <div className="space-y-2">
                <Label htmlFor="pharmacyName">Pharmacy Name (Optional)</Label>
                <Input
                  id="pharmacyName"
                  placeholder="Enter your pharmacy name"
                  value={formData.pharmacyName}
                  onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-secondary hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}