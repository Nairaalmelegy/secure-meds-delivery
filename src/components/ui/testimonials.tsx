import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      content: "MediLink made it so easy to get my medications during recovery. The doctors verified my prescription quickly and delivery was super fast!",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Dr. Michael Chen",
      role: "General Practitioner",
      content: "As a doctor, I appreciate how MediLink allows me to help patients even after consultations. The verification process is smooth and secure.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Priya Patel",
      role: "Patient",
      content: "Finally, a platform that takes healthcare seriously. I can track my orders, manage prescriptions, and trust the quality of medicines.",
      rating: 5,
      avatar: "PP"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            What Our Users Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of satisfied patients and doctors who trust MediLink
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                
                <div className="relative">
                  <Quote className="h-8 w-8 text-primary/20 absolute -top-2 -left-2" />
                  <p className="text-muted-foreground italic pl-6">
                    "{testimonial.content}"
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 pt-4 border-t border-border">
                  <div className="bg-gradient-primary p-3 rounded-full">
                    <span className="text-primary-foreground font-semibold text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-border">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">10,000+</div>
            <div className="text-muted-foreground">Happy Patients</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary">500+</div>
            <div className="text-muted-foreground">Verified Doctors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-info">50+</div>
            <div className="text-muted-foreground">Partner Pharmacies</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning">99.9%</div>
            <div className="text-muted-foreground">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}