import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminPrescriptionsOrders() {
  // TODO: Fetch and display prescriptions needing review and pending orders
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions & Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Prescriptions and orders needing approval will appear here.</div>
        </CardContent>
      </Card>
    </div>
  );
}
