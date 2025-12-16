import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Jane Njeri",
    role: "Piano Student",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    quote: "Found an amazing piano teacher within walking distance. After 3 months, I can play my first complete song! The lesson plans keep me on track.",
    rating: 5,
  },
  {
    name: "Pastor John Mwangi",
    role: "Church Administrator",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    quote: "We needed a pianist urgently for Sunday service. Tunetrails connected us with Sarah within hours. She's now our regular worship leader!",
    rating: 5,
  },
  {
    name: "Kevin Otieno",
    role: "Guitar Teacher",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    quote: "As a teacher, this platform changed my life. I've tripled my students, manage bookings easily, and get paid via M-Pesa instantly.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-gold font-semibold text-sm uppercase tracking-wider mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Loved by Musicians{" "}
            <span className="text-gradient">Across Kenya</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="relative bg-background rounded-2xl p-8 border border-border/50 hover:shadow-card transition-all duration-300"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 left-8">
                <div className="bg-primary p-2 rounded-lg shadow-warm">
                  <Quote className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4 pt-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
