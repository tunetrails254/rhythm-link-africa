import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar, Clock, Music, DollarSign, Users, Star, 
  Video, MapPin, Loader2, Plus, X, Save, Settings 
} from 'lucide-react';
import { format } from 'date-fns';

interface TeacherProfile {
  id: string;
  user_id: string;
  hourly_rate: number;
  experience_years: number;
  is_online_available: boolean;
  is_in_person_available: boolean;
  teaching_style: string | null;
  availability: string | null;
  rating: number;
  total_reviews: number;
  total_lessons: number;
}

interface Lesson {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  price: number;
  status: string;
  lesson_type: string;
  meeting_link: string | null;
  student_id: string;
  instruments: { name: string };
  student_profile?: { full_name: string };
}

interface Instrument {
  id: string;
  name: string;
  category: string | null;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [teacherInstruments, setTeacherInstruments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [hourlyRate, setHourlyRate] = useState(500);
  const [experienceYears, setExperienceYears] = useState(0);
  const [isOnlineAvailable, setIsOnlineAvailable] = useState(true);
  const [isInPersonAvailable, setIsInPersonAvailable] = useState(true);
  const [teachingStyle, setTeachingStyle] = useState('');
  const [availability, setAvailability] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    // Fetch teacher profile
    const { data: profile, error: profileError } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching teacher profile:', profileError);
    }

    if (profile) {
      setTeacherProfile(profile);
      setHourlyRate(profile.hourly_rate);
      setExperienceYears(profile.experience_years || 0);
      setIsOnlineAvailable(profile.is_online_available ?? true);
      setIsInPersonAvailable(profile.is_in_person_available ?? true);
      setTeachingStyle(profile.teaching_style || '');
      setAvailability(profile.availability || '');

      // Fetch teacher's instruments
      const { data: teacherInsts } = await supabase
        .from('teacher_instruments')
        .select('instrument_id')
        .eq('teacher_id', profile.id);

      if (teacherInsts) {
        setTeacherInstruments(teacherInsts.map(ti => ti.instrument_id));
      }

      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*, instruments(name)')
        .eq('teacher_id', profile.id)
        .order('scheduled_at', { ascending: false });

      if (lessonsData) {
        // Fetch student profiles
        const lessonsWithStudents = await Promise.all(
          lessonsData.map(async (lesson) => {
            const { data: studentProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', lesson.student_id)
              .single();
            return { ...lesson, student_profile: studentProfile };
          })
        );
        setLessons(lessonsWithStudents);
      }
    }

    // Fetch all instruments
    const { data: allInstruments } = await supabase
      .from('instruments')
      .select('*')
      .order('name');

    if (allInstruments) {
      setInstruments(allInstruments);
    }

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!teacherProfile) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('teacher_profiles')
      .update({
        hourly_rate: hourlyRate,
        experience_years: experienceYears,
        is_online_available: isOnlineAvailable,
        is_in_person_available: isInPersonAvailable,
        teaching_style: teachingStyle,
        availability: availability
      })
      .eq('id', teacherProfile.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Profile updated successfully' });
    }
    setSaving(false);
  };

  const toggleInstrument = async (instrumentId: string) => {
    if (!teacherProfile) return;

    if (teacherInstruments.includes(instrumentId)) {
      // Remove
      await supabase
        .from('teacher_instruments')
        .delete()
        .eq('teacher_id', teacherProfile.id)
        .eq('instrument_id', instrumentId);
      
      setTeacherInstruments(prev => prev.filter(id => id !== instrumentId));
    } else {
      // Add
      await supabase
        .from('teacher_instruments')
        .insert({ teacher_id: teacherProfile.id, instrument_id: instrumentId });
      
      setTeacherInstruments(prev => [...prev, instrumentId]);
    }
  };

  const updateLessonStatus = async (lessonId: string, status: string) => {
    const { error } = await supabase
      .from('lessons')
      .update({ status })
      .eq('id', lessonId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update lesson', variant: 'destructive' });
    } else {
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, status } : l));
      toast({ title: 'Updated', description: `Lesson ${status}` });
    }
  };

  const upcomingLessons = lessons.filter(l => 
    new Date(l.scheduled_at) > new Date() && l.status !== 'cancelled'
  );

  const pendingLessons = lessons.filter(l => l.status === 'pending');

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!teacherProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12 px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-display font-bold mb-2">Teacher Profile Required</h1>
            <p className="text-muted-foreground mb-6">
              You need to sign up as a teacher to access this dashboard.
            </p>
            <Button onClick={() => navigate('/auth')}>Sign Up as Teacher</Button>
          </div>
        </main>
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
            <h1 className="text-3xl font-display font-bold mb-2">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Manage your profile, lessons, and bookings</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{teacherProfile.total_lessons}</p>
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
                    <p className="text-2xl font-bold">{upcomingLessons.length}</p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/10 rounded-lg">
                    <Star className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{teacherProfile.rating || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">KSH {hourlyRate}</p>
                    <p className="text-sm text-muted-foreground">/hour</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="bookings">
                Bookings {pendingLessons.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{pendingLessons.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="profile">Profile Settings</TabsTrigger>
              <TabsTrigger value="instruments">Instruments</TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              {lessons.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground">Students will be able to book lessons with you</p>
                  </CardContent>
                </Card>
              ) : (
                lessons.map(lesson => (
                  <Card key={lesson.id} className="hover:shadow-card transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${
                            lesson.status === 'pending' ? 'bg-yellow-500/10' : 'bg-primary/10'
                          }`}>
                            <Music className={`h-6 w-6 ${
                              lesson.status === 'pending' ? 'text-yellow-500' : 'text-primary'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {lesson.instruments?.name} Lesson
                            </h3>
                            <p className="text-muted-foreground">
                              Student: {lesson.student_profile?.full_name || 'Unknown'}
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
                          <Badge variant={
                            lesson.status === 'confirmed' ? 'default' :
                            lesson.status === 'pending' ? 'secondary' :
                            lesson.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {lesson.status}
                          </Badge>
                          <span className="font-semibold">KSH {lesson.price?.toLocaleString()}</span>
                          
                          {lesson.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => updateLessonStatus(lesson.id, 'confirmed')}
                              >
                                Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateLessonStatus(lesson.id, 'cancelled')}
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Profile Settings Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Profile Settings
                  </CardTitle>
                  <CardDescription>Update your teaching profile and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate (KSH)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        min={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teachingStyle">Teaching Style</Label>
                    <Textarea
                      id="teachingStyle"
                      placeholder="Describe your teaching approach and methodology..."
                      value={teachingStyle}
                      onChange={(e) => setTeachingStyle(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Textarea
                      id="availability"
                      placeholder="E.g., Weekdays 9am-5pm, Saturdays 10am-2pm..."
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={isOnlineAvailable}
                        onCheckedChange={setIsOnlineAvailable}
                      />
                      <Label>Available for Online Lessons</Label>
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        checked={isInPersonAvailable}
                        onCheckedChange={setIsInPersonAvailable}
                      />
                      <Label>Available for In-Person Lessons</Label>
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Instruments Tab */}
            <TabsContent value="instruments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Instruments You Teach
                  </CardTitle>
                  <CardDescription>Select the instruments you can teach</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {instruments.map(instrument => (
                      <Button
                        key={instrument.id}
                        variant={teacherInstruments.includes(instrument.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleInstrument(instrument.id)}
                        className="gap-1"
                      >
                        {teacherInstruments.includes(instrument.id) ? (
                          <X className="h-3 w-3" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                        {instrument.name}
                      </Button>
                    ))}
                  </div>
                  
                  {instruments.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No instruments available. Contact admin to add instruments.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
