import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { loginSchema, registerSchema, type LoginData, type RegisterData } from '@/lib/validation';
import type { UserRole } from '@/types';

/**
 * Custom hook for authentication form logic
 */
export function useAuthForm() {
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (data: LoginData) => {
    setLoading(true);
    try {
      const validatedData = loginSchema.parse(data);
      await login(validatedData.email, validatedData.password);
      
      toast({
        title: "Login successful",
        description: "Welcome back to MediLink!",
      });
      
      return true;
    } catch (error: any) {
      if (error.errors) {
        const errorMessages = error.errors.map((err: any) => err.message).join(', ');
        toast({
          title: "Validation failed",
          description: errorMessages,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Please check your credentials.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    setLoading(true);
    try {
      const validatedData = registerSchema.parse(data);
      
      await register({
        name: `${validatedData.firstName} ${validatedData.lastName}`.trim(),
        email: validatedData.email,
        phone: validatedData.phone,
        password: validatedData.password,
        role: validatedData.role,
        ...(validatedData.role === 'patient' && { nationalId: validatedData.nationalId }),
        ...(validatedData.role === 'doctor' && { medicalLicense: validatedData.license }),
      });
      
      toast({
        title: "Account created successfully",
        description: "Welcome to MediLink!",
      });
      
      return true;
    } catch (error: any) {
      if (error.errors) {
        const errorMessages = error.errors.map((err: any) => err.message).join(', ');
        toast({
          title: "Validation failed",
          description: errorMessages,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleLogin,
    handleRegister,
  };
}
