import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Music, Users, Play, Loader2 } from 'lucide-react';

interface GigProfile {
  id: string;
  user_id: string;
  stage_name: string;
  performer_type: string;
  bio: string;
  genres: string[];
  video_urls: string[];
  base_price: number;
  price_per_hour: number;
  location: string;
  rating: number;
  total_reviews: number;
  total_gigs: number;
}

const eventTypes = [
  'All Events',
  'Wedding',
  'Church Service',
  'Corporate Event',
  'Birthday Party',
  'Concert',
  'Festival',
  'Private Event'
];

const performerTypes = [
  'All Types',
  'Solo',
  'Duo',
  'Band',
  'Ensemble'
];

const Gigs = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<GigProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventType, setEventType] = useState('All Events');
  const [performerType, setPerformerType] = useState('All Types');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    fetchGigProfiles();
  }, []);

  const fetchGigProfiles = async () => {
    const { data, error } = await supabase
      .from('gig_profiles')
      .select('*')
      .eq('is_available', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching gig profiles:', error);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.stage_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.genres?.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = performerType === 'All Types' || 
      profile.performer_type?.toLowerCase() === performerType.toLowerCase();

    let matchesPrice = true;
    if (priceRange === 'under5k') matchesPrice = profile.base_price < 5000;
    else if (priceRange === '5k-15k') matchesPrice = profile.base_price >= 5000 && profile.base_price <= 15000;
    else if (priceRange === 'over15k') matchesPrice = profile.base_price > 15000;

    return matchesSearch && matchesType && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6 bg-gradient-to-br from-accent/10 via-background to-primary/5">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Hire Musicians for Your <span className="text-gradient">Event</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Find talented performers for weddings, church services, corporate events, and more
          </p>
          <Button asChild>
            <Link to="/gig-onboarding">
              <Music className="h-4 w-4 mr-2" />
              Become a Performer
            </Link>
          </Button>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-6 border-b border-border sticky top-16 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={performerType} onValueChange={setPerformerType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {performerTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under5k">Under KSH 5,000</SelectItem>
                <SelectItem value="5k-15k">KSH 5,000 - 15,000</SelectItem>
                <SelectItem value="over15k">Over KSH 15,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-20">
              <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No performers found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map(profile => (
                <Card key={profile.id} className="group hover:shadow-card transition-all duration-300 overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 relative">
                    {profile.video_urls?.[0] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="icon" variant="secondary" className="rounded-full">
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                    )}
                    <Badge className="absolute top-3 right-3 capitalize">
                      {profile.performer_type}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display font-semibold text-lg">{profile.stage_name}</h3>
                        {profile.location && (
                          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                            <MapPin className="h-3 w-3" />
                            {profile.location}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-gold fill-gold" />
                        <span className="font-semibold">{profile.rating || 'New'}</span>
                        {profile.total_reviews > 0 && (
                          <span className="text-muted-foreground">({profile.total_reviews})</span>
                        )}
                      </div>
                    </div>

                    {profile.genres?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {profile.genres.slice(0, 3).map(genre => (
                          <span key={genre} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div>
                        <span className="font-semibold text-foreground">KSH {profile.base_price?.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground"> starting</span>
                      </div>
                      <Button size="sm" onClick={() => navigate(`/gig/${profile.id}`)}>
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gigs;
