import { Star, MapPin, Video, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeacherCardProps {
  name: string;
  image: string;
  instruments: string[];
  location: string;
  rating: number;
  reviews: number;
  price: number;
  online: boolean;
}

export const TeacherCard = ({
  name,
  image,
  instruments,
  location,
  rating,
  reviews,
  price,
  online,
}: TeacherCardProps) => {
  return (
    <div className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-card hover:border-primary/30 transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {online && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
            <Video className="h-3 w-3" />
            Online
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display font-semibold text-lg">{name}</h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
              <MapPin className="h-3 w-3" />
              {location}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 text-gold fill-gold" />
            <span className="font-semibold">{rating}</span>
            <span className="text-muted-foreground">({reviews})</span>
          </div>
        </div>

        {/* Instruments */}
        <div className="flex flex-wrap gap-2 mb-4">
          {instruments.map((instrument) => (
            <span
              key={instrument}
              className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
            >
              {instrument}
            </span>
          ))}
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-semibold text-foreground">KSH {price.toLocaleString()}</span>
            <span>/hour</span>
          </div>
          <Button size="sm">Book Now</Button>
        </div>
      </div>
    </div>
  );
};
