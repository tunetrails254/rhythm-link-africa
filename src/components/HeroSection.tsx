import { Button } from "@/components/ui/button";
import { Music, Users, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-10" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8 animate-slide-up">
            <Music className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Africa's Music Ecosystem</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up delay-100">
            Learn Music.{" "}
            <span className="text-gradient">Hire Talent.</span>
            <br />
            Connect & Create.
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up delay-200">
            Find the perfect music teacher near you, book musicians for your event, 
            or showcase your talent. Tunetrails connects Kenya's music community.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-300">
            <Button size="xl" variant="hero" className="group" asChild>
              <Link to="/teachers">
                Start Learning
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link to="/auth">Hire Musicians</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto animate-slide-up delay-400">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-primary mr-2" />
                <span className="font-display text-3xl font-bold text-foreground">500+</span>
              </div>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Music className="h-5 w-5 text-accent mr-2" />
                <span className="font-display text-3xl font-bold text-foreground">50+</span>
              </div>
              <p className="text-sm text-muted-foreground">Instruments</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-gold mr-2" />
                <span className="font-display text-3xl font-bold text-foreground">1000+</span>
              </div>
              <p className="text-sm text-muted-foreground">Gigs Booked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="hsl(var(--card))"
          />
        </svg>
      </div>
    </section>
  );
};
