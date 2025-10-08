import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleSelector } from "./RoleSelector";

interface RegisterFormProps {
  userRole: 'patient' | 'doctor';
  onRoleChange: (role: 'patient' | 'doctor') => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export function RegisterForm({ userRole, onRoleChange, onSubmit, loading }: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Role Selection */}
      <RoleSelector 
        selectedRole={userRole} 
        onRoleChange={onRoleChange}
        disabled={loading}
      />

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName" 
            name="firstName"
            placeholder="First name"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input 
            id="lastName" 
            name="lastName"
            placeholder="Last name"
            required
            disabled={loading}
          />
        </div>
      </div>
      
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="registerEmail">Email</Label>
        <Input 
          id="registerEmail" 
          name="registerEmail"
          type="email" 
          placeholder="Enter your email"
          required
          disabled={loading}
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input 
          id="phone" 
          name="phone"
          type="tel" 
          placeholder="+94 XX XXX XXXX"
          required
          disabled={loading}
        />
      </div>

      {/* Conditional Fields */}
      {userRole === 'patient' && (
        <div className="space-y-2">
          <Label htmlFor="nationalId">National ID</Label>
          <Input 
            id="nationalId" 
            name="nationalId"
            placeholder="National ID number"
            required
            disabled={loading}
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
            disabled={loading}
          />
        </div>
      )}
      
      {/* Password Fields */}
      <div className="space-y-2">
        <Label htmlFor="registerPassword">Password</Label>
        <Input 
          id="registerPassword" 
          name="registerPassword"
          type="password" 
          placeholder="Create a password"
          required
          disabled={loading}
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
          disabled={loading}
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
  );
}
