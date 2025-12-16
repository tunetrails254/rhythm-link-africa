import { Button } from "@/components/ui/button";
import { ArrowRight, Music, Users } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 gradient-hero opacity-5" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          {/* For Students */}
          <div className="bg-card rounded-3xl p-8 md:p-12 border border-border/50 hover:shadow-card transition-all duration-300">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
              <Music className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-3xl font-bold mb-4">
              Ready to Learn?
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Join thousands of students discovering their musical potential. 
              Find teachers for any instrument, from beginner to advanced.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Free to sign up
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Pay only for lessons you take
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                M-Pesa payments supported
              </li>
            </ul>
            <Button size="lg" variant="hero" className="w-full md:w-auto group">
              Start Learning Today
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* For Teachers */}
          <div className="bg-card rounded-3xl p-8 md:p-12 border border-border/50 hover:shadow-card transition-all duration-300">
            <div className="inline-flex p-4 rounded-2xl bg-accent/10 mb-6">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-display text-3xl font-bold mb-4">
              Share Your Talent
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Grow your teaching practice or get booked for gigs. 
              Build your reputation and earn on your own terms.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                Set your own rates
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                Get paid instantly via M-Pesa
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                Only 10% platform fee
              </li>
            </ul>
            <Button size="lg" variant="accent" className="w-full md:w-auto group">
              Join as Teacher/Performer
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
