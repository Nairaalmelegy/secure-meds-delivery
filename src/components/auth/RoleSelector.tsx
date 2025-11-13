import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Stethoscope } from "lucide-react";
import type { UserRole } from "@/types";

interface RoleSelectorProps {
  selectedRole: 'patient' | 'doctor';
  onRoleChange: (role: 'patient' | 'doctor') => void;
  disabled?: boolean;
}

export function RoleSelector({ selectedRole, onRoleChange, disabled }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>I am a</Label>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={selectedRole === 'patient' ? 'default' : 'outline'}
          onClick={() => onRoleChange('patient')}
          className="flex flex-col items-center space-y-1 h-16"
          disabled={disabled}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Patient</span>
        </Button>
        <Button
          type="button"
          variant={selectedRole === 'doctor' ? 'default' : 'outline'}
          onClick={() => onRoleChange('doctor')}
          className="flex flex-col items-center space-y-1 h-16"
          disabled={disabled}
        >
          <Stethoscope className="h-5 w-5" />
          <span className="text-xs">Doctor</span>
        </Button>
      </div>
    </div>
  );
}
