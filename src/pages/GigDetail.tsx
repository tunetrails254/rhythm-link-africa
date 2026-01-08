import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Star, MapPin, Music, Users, Calendar as CalendarIcon, 
  Clock, DollarSign, Play, ExternalLink, Loader2, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface GigProfile {
  id: string;
  user_id: string;
  stage_name: string;
  bio: string | null;
  performer_type: string;
  genres: string[];
  location: string | null;
  base_price: number;
  price_per_hour: number;
  rating: number;
  total_reviews: number;
  total_gigs: number;
  video_urls: string[];
  audio_urls: string[];
  setlist: string | null;
  tech_rider: string | null;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

const eventTypes = [
  'Wedding', 'Corporate Event', 'Birthday Party', 'Church Service', 
  'Concert', 'Festival', 'Private Party', 'Funeral', 'Other'
];

const GigDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [gig, setGig] = useState<GigProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  
  // Booking form
  const [eventDate, setEventDate] = useState<Date>();
  const [startTime, setStartTime] = useState('18:00');
  const [duration, setDuration] = useState(2);
  const [eventType, setEventType] = useState('');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    fetchGigProfile();
  }, [id]);

  const fetchGigProfile = async () => {
    const { data, error } = await supabase
      .from('gig_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching gig profile:', error);
      toast({ title: 'Error', description: 'Performer not found', variant: 'destructive' });
      navigate('/gigs');
      return;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', data.user_id)
      .single();

    setGig({ ...data, profiles: profile });
    setLoading(false);
  };

  const calculateTotal = () => {
    if (!gig) return 0;
    return gig.base_price + (gig.price_per_hour * duration);
  };

  const handleBookGig = async () => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You need to be logged in to book a performer' });
      navigate('/auth');
      return;
    }

    if (!eventDate || !eventType || !venue || !location) {
      toast({ title: 'Missing information', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setBooking(true);

    const { error } = await supabase.from('gig_bookings').insert({
      gig_profile_id: gig!.id,
      client_id: user.id,
      event_date: format(eventDate, 'yyyy-MM-dd'),
      start_time: startTime,
      duration_hours: duration,
      event_type: eventType,
      venue: venue,
      location: location,
      special_requests: specialRequests || null,
      total_price: calculateTotal(),
      status: 'pending'
    });

    if (error) {
      console.error('Error booking gig:', error);
      toast({ title: 'Booking failed', description: 'Please try again', variant: 'destructive' });
    } else {
      toast({ title: 'Booking submitted!', description: 'The performer will review your request' });
      navigate('/student-dashboard');
    }

    setBooking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gig) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/gigs')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Performers
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <Music className="h-12 w-12 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{gig.performer_type}</Badge>
                        {gig.rating > 0 && (
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-gold text-gold" />
                            {gig.rating.toFixed(1)} ({gig.total_reviews} reviews)
                          </span>
                        )}
                      </div>
                      <h1 className="text-3xl font-display font-bold mb-2">{gig.stage_name}</h1>
                      {gig.location && (
                        <p className="flex items-center gap-1 text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4" />
                          {gig.location}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {gig.genres?.map((genre, i) => (
                          <Badge key={i} variant="outline">{genre}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bio */}
              {gig.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{gig.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Media */}
              {(gig.video_urls?.length > 0 || gig.audio_urls?.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Media
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {gig.video_urls?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Videos</h4>
                        <div className="space-y-2">
                          {gig.video_urls.map((url, i) => (
                            <a 
                              key={i} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Video {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {gig.audio_urls?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Audio Samples</h4>
                        <div className="space-y-2">
                          {gig.audio_urls.map((url, i) => (
                            <a 
                              key={i} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Audio {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Setlist */}
              {gig.setlist && (
                <Card>
                  <CardHeader>
                    <CardTitle>Setlist / Repertoire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{gig.setlist}</p>
                  </CardContent>
                </Card>
              )}

              {/* Technical Rider */}
              {gig.tech_rider && (
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{gig.tech_rider}</p>
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{gig.total_gigs}</p>
                      <p className="text-sm text-muted-foreground">Gigs Performed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{gig.total_reviews}</p>
                      <p className="text-sm text-muted-foreground">Reviews</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{gig.rating > 0 ? gig.rating.toFixed(1) : 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Book This Performer
                  </CardTitle>
                  <CardDescription>
                    Fill in your event details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pricing */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Price</span>
                      <span className="font-medium">KSH {gig.base_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per Hour</span>
                      <span className="font-medium">KSH {gig.price_per_hour.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Date *</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !eventDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventDate ? format(eventDate, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={eventDate}
                          onSelect={setEventDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Time *</label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duration (hours)</label>
                    <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 8].map(h => (
                          <SelectItem key={h} value={h.toString()}>{h} hour{h > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Type *</label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Venue */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Venue Name *</label>
                    <Input
                      placeholder="e.g., Serena Hotel"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location *</label>
                    <Input
                      placeholder="e.g., Nairobi, Kenya"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Special Requests</label>
                    <Textarea
                      placeholder="Any specific songs or requirements..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Estimated Total</span>
                      <span className="text-2xl font-bold text-primary">
                        KSH {calculateTotal().toLocaleString()}
                      </span>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleBookGig}
                      disabled={booking}
                    >
                      {booking ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CalendarIcon className="h-4 w-4 mr-2" />
                      )}
                      {booking ? 'Submitting...' : 'Request Booking'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      The performer will confirm your booking
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GigDetail;
