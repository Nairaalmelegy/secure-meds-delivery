import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Mail, Shield, Edit, Save, X, MapPin, CreditCard } from 'lucide-react';
import { orderApi, prescriptionApi, userApi } from '@/lib/api';
import PatientSidebar from '@/components/PatientSidebar';
import LottieLoader from '@/components/LottieLoader';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Change password handler
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setPasswordLoading(true);
    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast({ title: 'Password changed', description: 'Your password has been updated.' });
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to change password', variant: 'destructive' });
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch profile, orders, and prescriptions in parallel
        const [profile, ordersRes, prescriptionsRes] = await Promise.all([
          userApi.getProfile(),
          orderApi.getMyOrders(),
          prescriptionApi.getMyPrescriptions(),
        ]);
        setOrders(ordersRes || []);
        setPrescriptions(prescriptionsRes || []);
        // Set formData with phone/address from DB
        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
        });
        // Optionally update user context if needed
        if (setUser) setUser(profile);
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser, toast]);

  const handleSave = async () => {
    try {
      // Only send editable fields, including phone
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        clinic: 'N/A', // Send dummy clinic for backend validation
      };
      // Ensure phone is not empty
      if (!updateData.phone) {
        toast({
          title: 'Error',
          description: 'Phone number is required',
          variant: 'destructive',
        });
        return;
      }
      const updated = await userApi.updateProfile(updateData);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      if (setUser) setUser(updated); // update context if available
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'doctor': return 'bg-primary/10 text-primary border-primary/20';
      case 'patient': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <PatientSidebar>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="mx-auto p-6">
          {/* Profile Header */}
          <div className="mb-8 p-6 bg-gradient-primary rounded-2xl text-white shadow-hero">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
                <div className="flex items-center gap-3">
                  <Badge className={`${getRoleBadgeColor(user?.role || '')} bg-white/20 text-white border-white/20`}>
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </Badge>
                  <span className="text-white/80 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Profile Info */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Personal Information
                    </CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-foreground font-medium">{user?.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{user?.email}</span>
                        <Badge className="bg-success/10 text-success border-success/20 text-xs">
                          Verified
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {formData.phone || 'Not provided'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="role">Account Type</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Badge className={getRoleBadgeColor(user?.role || '')}>
                          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Default Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter your address"
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formData.address || 'No default address set'}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Account Security */}
              <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Password</span>
                    <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                      Change Password
                    </Button>
      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)} disabled={passwordLoading}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={passwordLoading}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-secondary" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground mb-3">Cash on Delivery</p>
                    <Button variant="outline" size="sm" disabled>
                      Add Payment Method (Coming Soon)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              {user?.role === 'patient' && (
                <Card className="border-0 shadow-card bg-gradient-secondary text-white">
                  <CardHeader>
                    <CardTitle className="text-white/90">Account Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/80">Total Orders</span>
                      <span className="font-medium">{orders.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Prescriptions</span>
                      <span className="font-medium">{prescriptions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Total Spent</span>
                      <span className="font-medium">EGP {totalSpent.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </PatientSidebar>
  );
}