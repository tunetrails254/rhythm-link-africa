import { Button } from "@/components/ui/button";
import { TeacherCard } from "./TeacherCard";
import { ArrowRight } from "lucide-react";

const teachers = [
  {
    name: "Amina Wanjiku",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    instruments: ["Piano", "Keyboard"],
    location: "Nairobi, Westlands",
    rating: 4.9,
    reviews: 47,
    price: 1500,
    online: true,
  },
  {
    name: "David Ochieng",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    instruments: ["Guitar", "Bass", "Ukulele"],
    location: "Nairobi, Kilimani",
    rating: 4.8,
    reviews: 62,
    price: 1200,
    online: true,
  },
  {
    name: "Grace Muthoni",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    instruments: ["Vocals", "Piano"],
    location: "Nairobi, Karen",
    rating: 5.0,
    reviews: 28,
    price: 2000,
    online: false,
  },
  {
    name: "Peter Kimani",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    instruments: ["Drums", "Percussion"],
    location: "Mombasa",
    rating: 4.7,
    reviews: 35,
    price: 1000,
    online: true,
  },
];

export const TeachersSection = () => {
  return (
    <section id="teachers" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              Featured Teachers
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Learn From the{" "}
              <span className="text-gradient">Best</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Our verified teachers are passionate musicians ready to share their expertise.
            </p>
          </div>
          <Button variant="outline" className="mt-6 md:mt-0 group">
            View All Teachers
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.name} {...teacher} />
          ))}
        </div>
      </div>
    </section>
  );
};
