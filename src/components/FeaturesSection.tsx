import { 
  Search, 
  Video, 
  CreditCard, 
  Star, 
  Calendar, 
  Music2, 
  Users, 
  MapPin 
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Find Your Teacher",
    description: "Search by instrument, location, skill level, or budget. Piano, guitar, drums, nyatiti — any instrument you want to learn.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Video,
    title: "Learn Online or In-Person",
    description: "Seamless Zoom integration for virtual lessons or meet locally. Learn from anywhere in Kenya.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description: "Pay securely via M-Pesa or card. Teachers get paid instantly, and you only pay after lessons.",
    color: "text-gold",
    bgColor: "bg-gold/10",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    description: "Read authentic reviews from students. Build trust and find the perfect match for your learning style.",
    color: "text-sunset",
    bgColor: "bg-sunset/10",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Book one-time or recurring lessons. Set your availability, reschedule easily, get reminders.",
    color: "text-teal-vibrant",
    bgColor: "bg-teal-vibrant/10",
  },
  {
    icon: Music2,
    title: "Personalized Learning",
    description: "Custom lesson plans, progress tracking, assignments, and sheet music — all in one place.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Hire for Events",
    description: "Need a pianist for Sunday service? A band for your wedding? Find and book performers instantly.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: MapPin,
    title: "Location-Based",
    description: "Find teachers and performers near you. Support local musicians and grow your community.",
    color: "text-gold",
    bgColor: "bg-gold/10",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            Features
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Everything You Need for{" "}
            <span className="text-gradient">Music Success</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you're learning your first chord or booking a band for your event, 
            Tunetrails has the tools to make it happen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
