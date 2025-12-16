import { Button } from "@/components/ui/button";
import { GigCard } from "./GigCard";
import { ArrowRight, Mic2, Church, PartyPopper, Building2 } from "lucide-react";

const gigs = [
  {
    name: "The Groove Masters",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    type: "band" as const,
    genres: ["Afrobeat", "Reggae", "R&B"],
    location: "Nairobi",
    rating: 4.9,
    reviews: 34,
    startingPrice: 25000,
  },
  {
    name: "Sarah Atieno",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=400&fit=crop",
    type: "solo" as const,
    genres: ["Gospel", "Contemporary"],
    location: "Nairobi, Langata",
    rating: 5.0,
    reviews: 52,
    startingPrice: 5000,
  },
  {
    name: "Jazz Collective",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=400&fit=crop",
    type: "band" as const,
    genres: ["Jazz", "Soul", "Blues"],
    location: "Nairobi",
    rating: 4.8,
    reviews: 28,
    startingPrice: 35000,
  },
  {
    name: "Michael Omondi",
    image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&h=400&fit=crop",
    type: "solo" as const,
    genres: ["Classical", "Wedding"],
    location: "Mombasa",
    rating: 4.9,
    reviews: 41,
    startingPrice: 8000,
  },
];

const eventTypes = [
  { icon: Church, label: "Church Services" },
  { icon: PartyPopper, label: "Weddings & Parties" },
  { icon: Building2, label: "Corporate Events" },
  { icon: Mic2, label: "Live Performances" },
];

export const GigsSection = () => {
  return (
    <section id="gigs" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-accent/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            Gig Marketplace
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Hire Musicians for{" "}
            <span className="text-gradient">Any Event</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            From church services to weddings, find the perfect musician or band 
            to make your event unforgettable.
          </p>

          {/* Event type pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {eventTypes.map((event) => (
              <div
                key={event.label}
                className="flex items-center gap-2 bg-card border border-border/50 px-4 py-2 rounded-full hover:border-accent/50 transition-colors cursor-pointer"
              >
                <event.icon className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">{event.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {gigs.map((gig) => (
            <GigCard key={gig.name} {...gig} />
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="accent" className="group">
            Explore All Performers
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
