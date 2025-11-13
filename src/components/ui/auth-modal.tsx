import { useState, useEffect, FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuthForm } from "@/hooks/useAuthForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'register';
  role?: 'patient' | 'doctor' | null;
}

const AuthModal = ({ isOpen, onClose, type, role }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState(type);
  const [userRole, setUserRole] = useState<'patient' | 'doctor'>('patient');
  const { loading, handleLogin, handleRegister } = useAuthForm();

  // Set userRole from prop when modal opens
  useEffect(() => {
    if (isOpen && role) {
      setUserRole(role);
    }
  }, [isOpen, role]);

  const onLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const success = await handleLogin({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    if (success) {
      onClose();
    }
  };

  const onRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const success = await handleRegister({
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('registerEmail') as string,
      phone: formData.get('phone') as string,
      password: formData.get('registerPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      role: userRole,
      ...(userRole === 'patient' && { nationalId: formData.get('nationalId') as string }),
      ...(userRole === 'doctor' && { license: formData.get('license') as string }),
    });

    if (success) {
      onClose();
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
            <LoginForm onSubmit={onLoginSubmit} loading={loading} />
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <RegisterForm 
              userRole={userRole}
              onRoleChange={setUserRole}
              onSubmit={onRegisterSubmit}
              loading={loading}
            />
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
