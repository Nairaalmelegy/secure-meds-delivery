import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export function LoginForm({ onSubmit, loading }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email"
          type="email" 
          placeholder="Enter your email"
          required
          disabled={loading}
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
          disabled={loading}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-primary"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>

      <div className="text-center">
        <a href="#" className="text-sm text-primary hover:underline">
          Forgot your password?
        </a>
      </div>
    </form>
  );
}
