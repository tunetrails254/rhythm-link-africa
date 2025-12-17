import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Music, MapPin, DollarSign, User, X } from 'lucide-react';

const COMMON_INSTRUMENTS = [
  'Piano', 'Guitar', 'Drums', 'Violin', 'Bass', 'Vocals', 'Saxophone', 
  'Trumpet', 'Flute', 'Ukulele', 'Keyboard', 'Percussion', 'Cello',
  'Nyatiti', 'Djembe', 'Kalimba'
];

const TeacherOnboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [teacherProfileId, setTeacherProfileId] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [teachingStyle, setTeachingStyle] = useState('');
  const [isOnlineAvailable, setIsOnlineAvailable] = useState(true);
  const [isInPersonAvailable, setIsInPersonAvailable] = useState(true);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [customInstrument, setCustomInstrument] = useState('');
  const [existingInstruments, setExistingInstruments] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    setUserId(user.id);

    // Check if user is a teacher
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'teacher')
      .single();

    if (!roleData) {
      toast.error('Only teachers can access this page');
      navigate('/');
      return;
    }

    // Load existing profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setPhone(profile.phone || '');
    }

    // Load teacher profile
    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (teacherProfile) {
      setTeacherProfileId(teacherProfile.id);
      setHourlyRate(teacherProfile.hourly_rate?.toString() || '');
      setExperienceYears(teacherProfile.experience_years?.toString() || '');
      setTeachingStyle(teacherProfile.teaching_style || '');
      setIsOnlineAvailable(teacherProfile.is_online_available ?? true);
      setIsInPersonAvailable(teacherProfile.is_in_person_available ?? true);
    }

    // Load existing instruments
    const { data: instruments } = await supabase
      .from('instruments')
      .select('id, name')
      .order('name');
    
    if (instruments) {
      setExistingInstruments(instruments);
    }

    // Load teacher's current instruments
    if (teacherProfile) {
      const { data: teacherInstruments } = await supabase
        .from('teacher_instruments')
        .select('instruments(name)')
        .eq('teacher_id', teacherProfile.id);

      if (teacherInstruments) {
        const names = teacherInstruments
          .map(ti => (ti.instruments as any)?.name)
          .filter(Boolean);
        setSelectedInstruments(names);
      }
    }

    setLoading(false);
  };

  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments(prev => 
      prev.includes(instrument)
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    );
  };

  const addCustomInstrument = () => {
    if (customInstrument.trim() && !selectedInstruments.includes(customInstrument.trim())) {
      setSelectedInstruments(prev => [...prev, customInstrument.trim()]);
      setCustomInstrument('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !teacherProfileId) {
      toast.error('Session error. Please try again.');
      return;
    }

    if (selectedInstruments.length === 0) {
      toast.error('Please select at least one instrument you teach');
      return;
    }

    setSaving(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio,
          location,
          phone,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update teacher profile
      const { error: teacherError } = await supabase
        .from('teacher_profiles')
        .update({
          hourly_rate: parseInt(hourlyRate) || 500,
          experience_years: parseInt(experienceYears) || 0,
          teaching_style: teachingStyle,
          is_online_available: isOnlineAvailable,
          is_in_person_available: isInPersonAvailable,
        })
        .eq('id', teacherProfileId);

      if (teacherError) throw teacherError;

      // Handle instruments - first ensure they exist, then link
      // Delete existing teacher instruments
      await supabase
        .from('teacher_instruments')
        .delete()
        .eq('teacher_id', teacherProfileId);

      // Add new instruments
      for (const instrumentName of selectedInstruments) {
        // Check if instrument exists
        let instrumentId: string;
        const existing = existingInstruments.find(
          i => i.name.toLowerCase() === instrumentName.toLowerCase()
        );

        if (existing) {
          instrumentId = existing.id;
        } else {
          // Note: If instrument doesn't exist and user can't insert, 
          // we skip it (RLS prevents insert for most users)
          continue;
        }

        // Link instrument to teacher
        await supabase
          .from('teacher_instruments')
          .insert({
            teacher_id: teacherProfileId,
            instrument_id: instrumentId,
          });
      }

      toast.success('Profile updated successfully!');
      navigate('/teacher-dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Complete Your <span className="text-gradient">Teacher Profile</span>
            </h1>
            <p className="text-muted-foreground">
              Help students find you by filling out your teaching details
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Basic details about you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bio">About You</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell students about your background, experience, and teaching approach..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Nairobi, Westlands"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Instruments You Teach *
                </CardTitle>
                <CardDescription>Select all instruments you can teach</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {COMMON_INSTRUMENTS.map((instrument) => (
                    <Badge
                      key={instrument}
                      variant={selectedInstruments.includes(instrument) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleInstrument(instrument)}
                    >
                      {instrument}
                      {selectedInstruments.includes(instrument) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
                
                {/* Selected instruments from other sources */}
                {selectedInstruments.filter(i => !COMMON_INSTRUMENTS.includes(i)).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedInstruments.filter(i => !COMMON_INSTRUMENTS.includes(i)).map((instrument) => (
                      <Badge
                        key={instrument}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => toggleInstrument(instrument)}
                      >
                        {instrument}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={customInstrument}
                    onChange={(e) => setCustomInstrument(e.target.value)}
                    placeholder="Add another instrument..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInstrument())}
                  />
                  <Button type="button" variant="outline" onClick={addCustomInstrument}>
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Teaching Details
                </CardTitle>
                <CardDescription>Your rates and availability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (KSH) *</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="e.g. 1500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 5"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="teachingStyle">Teaching Style</Label>
                  <Textarea
                    id="teachingStyle"
                    value={teachingStyle}
                    onChange={(e) => setTeachingStyle(e.target.value)}
                    placeholder="Describe your teaching approach..."
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Availability</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="online"
                      checked={isOnlineAvailable}
                      onCheckedChange={(checked) => setIsOnlineAvailable(checked as boolean)}
                    />
                    <label htmlFor="online" className="text-sm cursor-pointer">
                      Available for online lessons
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inPerson"
                      checked={isInPersonAvailable}
                      onCheckedChange={(checked) => setIsInPersonAvailable(checked as boolean)}
                    />
                    <label htmlFor="inPerson" className="text-sm cursor-pointer">
                      Available for in-person lessons
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeacherOnboarding;
