import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => any);
  cell?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface ModernTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  className?: string;
}

export function ModernTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  className,
}: ModernTableProps<T>) {
  const getValue = (row: T, accessor: keyof T | ((row: T) => any)) => {
    if (typeof accessor === "function") {
      return accessor(row);
    }
    return row[accessor];
  };

  return (
    <div className={cn("bg-card rounded-lg border overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "text-left px-6 py-4 text-sm font-semibold text-muted-foreground",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "hover:bg-muted/20 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((column, colIdx) => {
                  const value = getValue(row, column.accessor);
                  return (
                    <td
                      key={colIdx}
                      className={cn("px-6 py-4 text-sm", column.className)}
                    >
                      {column.cell ? column.cell(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}

export { Badge, Button, Avatar, AvatarFallback, MoreVertical };
