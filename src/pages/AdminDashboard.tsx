import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome, Admin {user?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the admin dashboard. Doctor approval workflow will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
