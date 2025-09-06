import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Search, 
  Truck, 
  Shield, 
  Stethoscope, 
  Pill, 
  Star, 
  Clock,
  Users,
  Building2,
  Heart
} from "lucide-react";

export function InfoSections() {
  return (
    <div className="space-y-20">
      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              How MediLink Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple, secure, and fast - get your medicines delivered in just a few steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 shadow-card hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Upload Prescription</h3>
                <p className="text-muted-foreground">
                  Upload your prescription image or PDF. Our system will verify it with licensed doctors.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 shadow-card hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="bg-secondary/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Search className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Find & Order</h3>
                <p className="text-muted-foreground">
                  Search for medicines, add to cart, and checkout securely with multiple payment options.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 shadow-card hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="bg-info/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Truck className="h-8 w-8 text-info" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Safe Delivery</h3>
                <p className="text-muted-foreground">
                  Track your order in real-time and receive your medicines safely at your doorstep.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Patients Section */}
      <section id="for-patients" className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                For Patients
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need for your healthcare needs in one platform
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary p-2 rounded-full">
                    <Pill className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Easy Medicine Ordering</h4>
                    <p className="text-muted-foreground text-sm">Search and order from 1000+ medicines</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-secondary p-2 rounded-full">
                    <Upload className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Prescription Management</h4>
                    <p className="text-muted-foreground text-sm">Upload and track all your prescriptions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-info p-2 rounded-full">
                    <Clock className="h-4 w-4 text-info-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Order Tracking</h4>
                    <p className="text-muted-foreground text-sm">Real-time updates on your order status</p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" className="bg-gradient-primary">
                Start Ordering Now
              </Button>
            </div>
            
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Customer Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">100%</div>
                  <div className="text-sm text-muted-foreground">Secure Payments</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-info">2 Hours</div>
                  <div className="text-sm text-muted-foreground">Fast Delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning">5★</div>
                  <div className="text-sm text-muted-foreground">Customer Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Doctors Section */}
      <section id="for-doctors" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-secondary/5 to-primary/5 p-8 rounded-2xl">
              <div className="space-y-6">
                <div className="bg-secondary p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <Stethoscope className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Doctor Dashboard</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Patient Management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-secondary" />
                    <span className="text-muted-foreground">Medical Records Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-warning" />
                    <span className="text-muted-foreground">Rewards & Commission</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                For Doctors
              </h2>
              <p className="text-lg text-muted-foreground">
                Join our network of verified healthcare professionals
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-secondary p-2 rounded-full">
                    <Shield className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Prescription Verification</h4>
                    <p className="text-muted-foreground text-sm">Verify patient prescriptions securely</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-primary p-2 rounded-full">
                    <Users className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Patient Records</h4>
                    <p className="text-muted-foreground text-sm">Access complete medical history</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-warning p-2 rounded-full">
                    <Star className="h-4 w-4 text-warning-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Earn Rewards</h4>
                    <p className="text-muted-foreground text-sm">Get commission and points for verified prescriptions</p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Join as Doctor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* For Pharmacies Section */}
      <section id="pharmacies" className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              For Pharmacies
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Partner with us to expand your reach and serve more patients
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 shadow-card">
              <CardContent className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Inventory Management</h3>
                <p className="text-muted-foreground">
                  Manage your medicine stock and pricing through our admin panel.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 shadow-card">
              <CardContent className="space-y-4">
                <div className="bg-secondary/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Truck className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Order Processing</h3>
                <p className="text-muted-foreground">
                  Receive and process orders efficiently with our streamlined system.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 shadow-card">
              <CardContent className="space-y-4">
                <div className="bg-info/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Shield className="h-8 w-8 text-info" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Secure Payments</h3>
                <p className="text-muted-foreground">
                  Get paid securely and on time for all your processed orders.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}