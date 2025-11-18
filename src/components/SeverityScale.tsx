import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SeverityScaleProps {
  onSelect: (value: number) => void;
  disabled?: boolean;
}

const severityLabels = [
  { value: 0, label: 'None', color: 'bg-green-500' },
  { value: 1, label: 'Minimal', color: 'bg-green-400' },
  { value: 2, label: 'Mild', color: 'bg-yellow-400' },
  { value: 3, label: 'Moderate', color: 'bg-orange-400' },
  { value: 4, label: 'Severe', color: 'bg-red-400' },
  { value: 5, label: 'Extreme', color: 'bg-red-600' },
];

export default function SeverityScale({ onSelect, disabled }: SeverityScaleProps) {
  return (
    <div className="space-y-3 p-4 bg-background border rounded-lg">
      <div className="text-sm font-medium text-foreground/80">
        Select severity level:
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {severityLabels.map(({ value, label, color }) => (
          <Button
            key={value}
            variant="outline"
            disabled={disabled}
            onClick={() => onSelect(value)}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-3 hover:scale-105 transition-transform",
              "hover:border-primary hover:bg-primary/5"
            )}
          >
            <div className={cn("w-8 h-8 rounded-full", color)} />
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs">{label}</div>
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground text-center pt-2">
        0 = No symptoms | 5 = Most severe symptoms
      </div>
    </div>
  );
}