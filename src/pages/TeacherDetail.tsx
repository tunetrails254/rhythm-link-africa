import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Star, MapPin, User, Video, Users, Clock, Music, 
  Calendar as CalendarIcon, Loader2, ArrowLeft, CheckCircle
} from 'lucide-react';

interface TeacherProfile {
  id: string;
  user_id: string;
  hourly_rate: number;
  experience_years: number | null;
  teaching_style: string | null;
  is_online_available: boolean | null;
  is_in_person_available: boolean | null;
  rating: number | null;
  total_reviews: number | null;
  total_lessons: number | null;
  availability: string | null;
}

interface Profile {
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  email: string;
}

interface Instrument {
  id: string;
  name: string;
}

interface TeacherInstrument {
  instrument_id: string;
  proficiency_level: string | null;
  instruments: Instrument | null;
}

const TeacherDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [instruments, setInstruments] = useState<TeacherInstrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [lessonType, setLessonType] = useState<string>('online');
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) fetchTeacherDetails();
  }, [id]);

  const fetchTeacherDetails = async () => {
    setLoading(true);
    
    // Fetch teacher profile
    const { data: teacherData, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (teacherError || !teacherData) {
      console.error('Error fetching teacher:', teacherError);
      toast.error('Teacher not found');
      navigate('/teachers');
      return;
    }

    setTeacher(teacherData);

    // Fetch user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, location, bio, email')
      .eq('id', teacherData.user_id)
      .single();

    if (profileData) setProfile(profileData);

    // Fetch instruments
    const { data: instrumentsData } = await supabase
      .from('teacher_instruments')
      .select(`
        instrument_id,
        proficiency_level,
        instruments (
          id,
          name
        )
      `)
      .eq('teacher_id', id);

    if (instrumentsData) setInstruments(instrumentsData as unknown as TeacherInstrument[]);

    setLoading(false);
  };

  const handleBookLesson = async () => {
    if (!user) {
      toast.error('Please log in to book a lesson');
      navigate('/auth');
      return;
    }

    if (!selectedDate || !selectedTime || !selectedInstrument) {
      toast.error('Please fill in all required fields');
      return;
    }

    setBooking(true);

    // Combine date and time
    const scheduledAt = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const price = teacher!.hourly_rate * (duration / 60);

    const { error } = await supabase.from('lessons').insert({
      student_id: user.id,
      teacher_id: teacher!.id,
      instrument_id: selectedInstrument,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: duration,
      price: price,
      lesson_type: lessonType,
      notes: notes || null,
      status: 'pending'
    });

    if (error) {
      console.error('Error booking lesson:', error);
      toast.error('Failed to book lesson. Please try again.');
    } else {
      toast.success('Lesson booked successfully! The teacher will confirm shortly.');
      navigate('/student-dashboard');
    }

    setBooking(false);
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!teacher || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/teachers')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teachers
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16 text-primary/40" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h1 className="text-2xl md:text-3xl font-display font-bold">
                            {profile.full_name}
                          </h1>
                          {profile.location && (
                            <p className="text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-4 w-4" />
                              {profile.location}
                            </p>
                          )}
                        </div>
                        
                        {teacher.rating && teacher.rating > 0 && (
                          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg">
                            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-lg">{teacher.rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">
                              ({teacher.total_reviews} reviews)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quick stats */}
                      <div className="flex flex-wrap gap-4 mt-4">
                        {teacher.experience_years && teacher.experience_years > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span>{teacher.experience_years}+ years experience</span>
                          </div>
                        )}
                        {teacher.total_lessons && teacher.total_lessons > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{teacher.total_lessons} lessons taught</span>
                          </div>
                        )}
                        {teacher.is_online_available && (
                          <div className="flex items-center gap-2 text-sm">
                            <Video className="h-4 w-4 text-accent" />
                            <span>Online available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instruments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Instruments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {instruments.map((ti) => (
                      <Badge 
                        key={ti.instrument_id} 
                        variant="secondary"
                        className="text-sm py-1.5 px-3"
                      >
                        {ti.instruments?.name}
                        {ti.proficiency_level && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({ti.proficiency_level})
                          </span>
                        )}
                      </Badge>
                    ))}
                    {instruments.length === 0 && (
                      <p className="text-muted-foreground">No instruments listed</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* About */}
              {profile.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {profile.bio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Teaching Style */}
              {teacher.teaching_style && (
                <Card>
                  <CardHeader>
                    <CardTitle>Teaching Style</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {teacher.teaching_style}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Availability */}
              {teacher.availability && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {teacher.availability}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Book a Lesson</span>
                    <span className="text-primary">
                      KSH {teacher.hourly_rate}/hr
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Instrument Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Instrument *
                    </label>
                    <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose instrument" />
                      </SelectTrigger>
                      <SelectContent>
                        {instruments.map((ti) => (
                          <SelectItem key={ti.instrument_id} value={ti.instrument_id}>
                            {ti.instruments?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lesson Type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Lesson Type *
                    </label>
                    <Select value={lessonType} onValueChange={setLessonType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {teacher.is_online_available && (
                          <SelectItem value="online">Online (Video Call)</SelectItem>
                        )}
                        {teacher.is_in_person_available && (
                          <SelectItem value="in_person">In Person</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Duration
                    </label>
                    <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Picker */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Date *
                    </label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Time *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className="text-xs"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Notes (optional)
                    </label>
                    <Textarea
                      placeholder="Any specific topics you'd like to cover..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Price Summary */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        KSH {(teacher.hourly_rate * (duration / 60)).toLocaleString()}
                      </span>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleBookLesson}
                      disabled={booking || !selectedDate || !selectedTime || !selectedInstrument}
                    >
                      {booking ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        <>
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Book Lesson
                        </>
                      )}
                    </Button>

                    {!user && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        You'll need to log in to complete your booking
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TeacherDetail;
