import { Star, MapPin, Users, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GigCardProps {
  name: string;
  image: string;
  type: "solo" | "band";
  genres: string[];
  location: string;
  rating: number;
  reviews: number;
  startingPrice: number;
}

export const GigCard = ({
  name,
  image,
  type,
  genres,
  location,
  rating,
  reviews,
  startingPrice,
}: GigCardProps) => {
  return (
    <div className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-card hover:border-accent/30 transition-all duration-300">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="flex items-center gap-2">
            {type === "band" ? (
              <div className="flex items-center gap-1 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                <Users className="h-3 w-3" />
                Band
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                <Music className="h-3 w-3" />
                Solo Artist
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
            <Star className="h-3 w-3 text-gold fill-gold" />
            <span className="font-semibold">{rating}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-lg mb-1">{name}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="h-3 w-3" />
          {location}
          <span className="mx-1">•</span>
          <span>{reviews} bookings</span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-2 mb-4">
          {genres.map((genre) => (
            <span
              key={genre}
              className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-md"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <span className="text-xs text-muted-foreground">Starting from</span>
            <p className="font-semibold text-foreground">KSH {startingPrice.toLocaleString()}</p>
          </div>
          <Button size="sm" variant="accent">View Profile</Button>
        </div>
      </div>
    </div>
  );
};
