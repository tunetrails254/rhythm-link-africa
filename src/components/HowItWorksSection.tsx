import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Sign Up",
    description: "Create your free account as a student, teacher, or performer. Tell us about your musical journey.",
    highlight: "Takes 2 minutes",
  },
  {
    number: "02",
    title: "Discover",
    description: "Browse teachers by instrument, location, and price. Or post a gig request for your event.",
    highlight: "50+ instruments",
  },
  {
    number: "03",
    title: "Book & Pay",
    description: "Schedule lessons or hire performers. Pay securely with M-Pesa — money held until completion.",
    highlight: "Secure payments",
  },
  {
    number: "04",
    title: "Learn & Grow",
    description: "Take lessons online or in-person. Track progress, get assignments, and rate your experience.",
    highlight: "Personalized plans",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Start Your Music Journey in{" "}
            <span className="text-gradient">4 Simple Steps</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent z-0">
                  <ArrowRight className="absolute -right-2 -top-2 h-5 w-5 text-border" />
                </div>
              )}

              <div className="relative z-10 text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl gradient-hero text-primary-foreground font-display text-3xl font-bold mb-6 shadow-warm">
                  {step.number}
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-3 leading-relaxed">{step.description}</p>
                <span className="inline-block text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {step.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
