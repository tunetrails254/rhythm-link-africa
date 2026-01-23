import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TeacherCard } from "./TeacherCard";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedTeacher {
  name: string;
  image: string;
  instruments: string[];
  location: string;
  rating: number;
  reviews: number;
  price: number;
  online: boolean;
  id: string;
}

export const TeachersSection = () => {
  const [teachers, setTeachers] = useState<FeaturedTeacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedTeachers();
  }, []);

  const fetchFeaturedTeachers = async () => {
    const { data: teacherProfiles, error } = await supabase
      .from('teacher_profiles')
      .select(`
        id,
        user_id,
        hourly_rate,
        rating,
        total_reviews,
        is_online_available,
        teacher_instruments (
          instrument_id,
          instruments (name)
        )
      `)
      .order('rating', { ascending: false })
      .limit(4);

    if (error) {
      console.error('Error fetching teachers:', error);
      setLoading(false);
      return;
    }

    // Fetch profiles for each teacher
    const teacherIds = teacherProfiles?.map(t => t.user_id) || [];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, location')
      .in('id', teacherIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const formattedTeachers: FeaturedTeacher[] = (teacherProfiles || []).map(teacher => {
      const profile = profileMap.get(teacher.user_id);
      const instruments = teacher.teacher_instruments?.map(
        (ti: any) => ti.instruments?.name
      ).filter(Boolean) || [];

      return {
        id: teacher.id,
        name: profile?.full_name || 'Teacher',
        image: profile?.avatar_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop',
        instruments,
        location: profile?.location || 'Kenya',
        rating: Number(teacher.rating) || 0,
        reviews: teacher.total_reviews || 0,
        price: teacher.hourly_rate,
        online: teacher.is_online_available || false,
      };
    });

    setTeachers(formattedTeachers);
    setLoading(false);
  };

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
          <Button variant="outline" className="mt-6 md:mt-0 group" asChild>
            <Link to="/teachers">
              View All Teachers
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No teachers available yet. Be the first to join!</p>
            <Button className="mt-4" asChild>
              <Link to="/auth">Become a Teacher</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} {...teacher} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
