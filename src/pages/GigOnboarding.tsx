import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Music, Mic2, MapPin, DollarSign, Video, FileText, 
  Plus, X, Loader2, CheckCircle, ArrowRight, ArrowLeft 
} from 'lucide-react';

const PERFORMER_TYPES = [
  { value: 'solo', label: 'Solo Artist' },
  { value: 'duo', label: 'Duo' },
  { value: 'trio', label: 'Trio' },
  { value: 'band', label: 'Band' },
  { value: 'orchestra', label: 'Orchestra' },
  { value: 'dj', label: 'DJ' },
];

const GENRE_OPTIONS = [
  'Gospel', 'Jazz', 'Afrobeat', 'R&B', 'Soul', 'Classical', 
  'Pop', 'Rock', 'Reggae', 'Hip Hop', 'Traditional', 'Folk',
  'Blues', 'Country', 'Electronic', 'World Music'
];

const GigOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [stageName, setStageName] = useState('');
  const [bio, setBio] = useState('');
  const [performerType, setPerformerType] = useState('solo');
  const [location, setLocation] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [basePrice, setBasePrice] = useState('5000');
  const [pricePerHour, setPricePerHour] = useState('2000');
  const [videoUrls, setVideoUrls] = useState<string[]>(['']);
  const [audioUrls, setAudioUrls] = useState<string[]>(['']);
  const [setlist, setSetlist] = useState('');
  const [techRider, setTechRider] = useState('');

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter(g => g !== genre));
    } else if (genres.length < 5) {
      setGenres([...genres, genre]);
    } else {
      toast.error('Maximum 5 genres allowed');
    }
  };

  const addVideoUrl = () => {
    if (videoUrls.length < 5) {
      setVideoUrls([...videoUrls, '']);
    }
  };

  const removeVideoUrl = (index: number) => {
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
  };

  const updateVideoUrl = (index: number, value: string) => {
    const updated = [...videoUrls];
    updated[index] = value;
    setVideoUrls(updated);
  };

  const addAudioUrl = () => {
    if (audioUrls.length < 5) {
      setAudioUrls([...audioUrls, '']);
    }
  };

  const removeAudioUrl = (index: number) => {
    setAudioUrls(audioUrls.filter((_, i) => i !== index));
  };

  const updateAudioUrl = (index: number, value: string) => {
    const updated = [...audioUrls];
    updated[index] = value;
    setAudioUrls(updated);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to create a performer profile');
      navigate('/auth');
      return;
    }

    if (!stageName.trim()) {
      toast.error('Please enter your stage name');
      return;
    }

    if (genres.length === 0) {
      toast.error('Please select at least one genre');
      return;
    }

    setLoading(true);

    // Filter out empty URLs
    const filteredVideoUrls = videoUrls.filter(url => url.trim());
    const filteredAudioUrls = audioUrls.filter(url => url.trim());

    const { error } = await supabase.from('gig_profiles').insert({
      user_id: user.id,
      stage_name: stageName.trim(),
      bio: bio.trim() || null,
      performer_type: performerType,
      location: location.trim() || null,
      genres: genres,
      base_price: parseInt(basePrice) || 5000,
      price_per_hour: parseInt(pricePerHour) || 2000,
      video_urls: filteredVideoUrls,
      audio_urls: filteredAudioUrls,
      setlist: setlist.trim() || null,
      tech_rider: techRider.trim() || null,
      is_available: true,
    });

    if (error) {
      console.error('Error creating gig profile:', error);
      if (error.code === '23505') {
        toast.error('You already have a performer profile');
        navigate('/gigs');
      } else {
        toast.error('Failed to create profile. Please try again.');
      }
    } else {
      toast.success('Performer profile created successfully!');
      navigate('/gigs');
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 px-4">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to create a performer profile</p>
          <Button onClick={() => navigate('/auth')}>Go to Login</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              Create Your <span className="text-gradient">Performer Profile</span>
            </h1>
            <p className="text-muted-foreground">
              Showcase your talent and get booked for events
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-0.5 mx-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic2 className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Tell us about yourself and your act
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Stage Name / Band Name *
                  </label>
                  <Input
                    placeholder="e.g. The Groove Masters"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Performer Type *
                  </label>
                  <Select value={performerType} onValueChange={setPerformerType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERFORMER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Nairobi, Kenya"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Genres * (select up to 5)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENRE_OPTIONS.map((genre) => (
                      <Badge
                        key={genre}
                        variant={genres.includes(genre) ? "default" : "outline"}
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Bio / Description
                  </label>
                  <Textarea
                    placeholder="Tell potential clients about your experience, style, and what makes you unique..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {bio.length}/1000 characters
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => setStep(2)}
                  disabled={!stageName.trim() || genres.length === 0}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Media & Content */}
          {step === 2 && (
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Media & Setlist
                </CardTitle>
                <CardDescription>
                  Add videos, audio samples, and your setlist
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video URLs */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Video Links (YouTube, Vimeo, etc.)
                  </label>
                  <div className="space-y-2">
                    {videoUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="https://youtube.com/watch?v=..."
                          value={url}
                          onChange={(e) => updateVideoUrl(index, e.target.value)}
                        />
                        {videoUrls.length > 1 && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => removeVideoUrl(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {videoUrls.length < 5 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={addVideoUrl}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Another Video
                    </Button>
                  )}
                </div>

                {/* Audio URLs */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Audio Links (SoundCloud, Spotify, etc.)
                  </label>
                  <div className="space-y-2">
                    {audioUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="https://soundcloud.com/..."
                          value={url}
                          onChange={(e) => updateAudioUrl(index, e.target.value)}
                        />
                        {audioUrls.length > 1 && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => removeAudioUrl(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {audioUrls.length < 5 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={addAudioUrl}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Another Audio Link
                    </Button>
                  )}
                </div>

                {/* Setlist */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Setlist / Repertoire
                  </label>
                  <Textarea
                    placeholder="List the songs or type of music you typically perform..."
                    value={setlist}
                    onChange={(e) => setSetlist(e.target.value)}
                    rows={5}
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {setlist.length}/2000 characters
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Pricing & Requirements */}
          {step === 3 && (
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Pricing & Requirements
                </CardTitle>
                <CardDescription>
                  Set your rates and technical requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Base Price (KSH)
                    </label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      min={0}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Starting price for a gig
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Hourly Rate (KSH)
                    </label>
                    <Input
                      type="number"
                      placeholder="2000"
                      value={pricePerHour}
                      onChange={(e) => setPricePerHour(e.target.value)}
                      min={0}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Additional rate per hour
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Technical Rider / Requirements
                  </label>
                  <Textarea
                    placeholder="List your technical requirements (sound system, microphones, stage size, etc.)..."
                    value={techRider}
                    onChange={(e) => setTechRider(e.target.value)}
                    rows={5}
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {techRider.length}/2000 characters
                  </p>
                </div>

                {/* Summary */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-medium">Profile Summary</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Stage Name:</strong> {stageName}</p>
                    <p><strong>Type:</strong> {PERFORMER_TYPES.find(t => t.value === performerType)?.label}</p>
                    <p><strong>Genres:</strong> {genres.join(', ')}</p>
                    <p><strong>Starting at:</strong> KSH {parseInt(basePrice || '0').toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Music className="h-4 w-4 mr-2" />
                        Create Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GigOnboarding;
