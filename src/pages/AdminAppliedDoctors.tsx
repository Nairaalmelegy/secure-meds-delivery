import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminAppliedDoctors() {
  // TODO: Fetch and display list of pending doctors for approval
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Applied Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div>List of doctors pending approval will appear here.</div>
        </CardContent>
      </Card>
    </div>
  );
}
