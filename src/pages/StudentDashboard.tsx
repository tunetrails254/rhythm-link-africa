import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Music, BookOpen, TrendingUp, Video, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Lesson {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  price: number;
  status: string;
  lesson_type: string;
  meeting_link: string | null;
  notes: string | null;
  teacher_profiles: {
    id: string;
    user_id: string;
    profiles?: {
      full_name: string;
      avatar_url: string | null;
    };
  };
  instruments: {
    name: string;
  };
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLessons: 0,
    upcomingLessons: 0,
    completedLessons: 0,
    totalSpent: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLessons();
    }
  }, [user]);

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        teacher_profiles!inner(id, user_id),
        instruments(name)
      `)
      .eq('student_id', user?.id)
      .order('scheduled_at', { ascending: false });

    if (error) {
      console.error('Error fetching lessons:', error);
    } else {
      // Fetch teacher profiles separately
      const lessonsWithProfiles = await Promise.all(
        (data || []).map(async (lesson) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', lesson.teacher_profiles.user_id)
            .single();
          
          return {
            ...lesson,
            teacher_profiles: {
              ...lesson.teacher_profiles,
              profiles: profile
            }
          };
        })
      );
      
      setLessons(lessonsWithProfiles);
      
      const now = new Date();
      const upcoming = lessonsWithProfiles.filter(l => new Date(l.scheduled_at) > now && l.status !== 'cancelled');
      const completed = lessonsWithProfiles.filter(l => l.status === 'completed');
      
      setStats({
        totalLessons: lessonsWithProfiles.length,
        upcomingLessons: upcoming.length,
        completedLessons: completed.length,
        totalSpent: lessonsWithProfiles.reduce((sum, l) => sum + (l.price || 0), 0)
      });
    }
    setLoading(false);
  };

  const upcomingLessons = lessons.filter(l => 
    new Date(l.scheduled_at) > new Date() && l.status !== 'cancelled'
  );

  const pastLessons = lessons.filter(l => 
    new Date(l.scheduled_at) <= new Date() || l.status === 'completed'
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'secondary',
      confirmed: 'default',
      completed: 'outline',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">Student Dashboard</h1>
            <p className="text-muted-foreground">Track your lessons and learning progress</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalLessons}</p>
                    <p className="text-sm text-muted-foreground">Total Lessons</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.upcomingLessons}</p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completedLessons}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/10 rounded-lg">
                    <Music className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">KSH {stats.totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Invested</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lessons Tabs */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcomingLessons.length})</TabsTrigger>
              <TabsTrigger value="past">Past Lessons ({pastLessons.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingLessons.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No upcoming lessons</h3>
                    <p className="text-muted-foreground mb-4">Book a lesson with a teacher to get started</p>
                    <Button onClick={() => navigate('/teachers')}>Find Teachers</Button>
                  </CardContent>
                </Card>
              ) : (
                upcomingLessons.map(lesson => (
                  <Card key={lesson.id} className="hover:shadow-card transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-xl">
                            <Music className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {lesson.instruments?.name} Lesson
                            </h3>
                            <p className="text-muted-foreground">
                              with {lesson.teacher_profiles?.profiles?.full_name || 'Teacher'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(lesson.scheduled_at), 'MMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(lesson.scheduled_at), 'h:mm a')}
                              </span>
                              <span className="flex items-center gap-1">
                                {lesson.lesson_type === 'online' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                                {lesson.lesson_type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(lesson.status || 'pending')}
                          {lesson.meeting_link && lesson.status === 'confirmed' && (
                            <Button size="sm" asChild>
                              <a href={lesson.meeting_link} target="_blank" rel="noopener noreferrer">
                                <Video className="h-4 w-4 mr-1" />
                                Join
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastLessons.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No past lessons yet</h3>
                    <p className="text-muted-foreground">Your completed lessons will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                pastLessons.map(lesson => (
                  <Card key={lesson.id} className="opacity-80">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-muted rounded-xl">
                            <Music className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {lesson.instruments?.name} Lesson
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              with {lesson.teacher_profiles?.profiles?.full_name || 'Teacher'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(lesson.scheduled_at), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(lesson.status || 'completed')}
                          <span className="text-sm font-medium">KSH {lesson.price?.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
