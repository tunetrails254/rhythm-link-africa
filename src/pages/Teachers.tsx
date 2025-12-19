import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Star, Music, Filter, X, Loader2, User } from 'lucide-react';

interface Instrument {
  id: string;
  name: string;
  category: string | null;
}

interface TeacherData {
  id: string;
  user_id: string;
  hourly_rate: number;
  experience_years: number | null;
  teaching_style: string | null;
  is_online_available: boolean | null;
  is_in_person_available: boolean | null;
  rating: number | null;
  total_reviews: number | null;
  profiles: {
    full_name: string;
    avatar_url: string | null;
    location: string | null;
    bio: string | null;
  } | null;
  teacher_instruments: {
    instrument_id: string;
    instruments: {
      name: string;
    } | null;
  }[];
}

const Teachers = () => {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    fetchInstruments();
    fetchTeachers();
  }, []);

  const fetchInstruments = async () => {
    const { data } = await supabase
      .from('instruments')
      .select('*')
      .order('name');
    
    if (data) setInstruments(data);
  };

  const fetchTeachers = async () => {
    setLoading(true);
    
    // First get teacher profiles
    const { data: teacherData, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select(`
        id,
        user_id,
        hourly_rate,
        experience_years,
        teaching_style,
        is_online_available,
        is_in_person_available,
        rating,
        total_reviews,
        teacher_instruments (
          instrument_id,
          instruments (
            name
          )
        )
      `)
      .order('rating', { ascending: false });

    if (teacherError) {
      console.error('Error fetching teachers:', teacherError);
      setLoading(false);
      return;
    }

    if (!teacherData || teacherData.length === 0) {
      setTeachers([]);
      setLoading(false);
      return;
    }

    // Get profiles for all teacher user_ids
    const userIds = teacherData.map(t => t.user_id);
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, location, bio')
      .in('id', userIds);

    // Merge the data
    const mergedData = teacherData.map(teacher => ({
      ...teacher,
      profiles: profilesData?.find(p => p.id === teacher.user_id) || null
    }));

    setTeachers(mergedData as unknown as TeacherData[]);
    setLoading(false);
  };

  // Filter teachers
  const filteredTeachers = teachers.filter((teacher) => {
    const profile = teacher.profiles;
    if (!profile) return false;

    // Search query (name or bio)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = profile.full_name?.toLowerCase().includes(query);
      const matchesBio = profile.bio?.toLowerCase().includes(query);
      if (!matchesName && !matchesBio) return false;
    }

    // Instrument filter
    if (selectedInstrument && selectedInstrument !== 'all') {
      const hasInstrument = teacher.teacher_instruments?.some(
        (ti) => ti.instrument_id === selectedInstrument
      );
      if (!hasInstrument) return false;
    }

    // Location filter
    if (locationFilter) {
      const location = profile.location?.toLowerCase() || '';
      if (!location.includes(locationFilter.toLowerCase())) return false;
    }

    // Price range filter
    if (teacher.hourly_rate < priceRange[0] || teacher.hourly_rate > priceRange[1]) {
      return false;
    }

    // Rating filter
    if (minRating > 0 && (teacher.rating || 0) < minRating) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedInstrument('all');
    setLocationFilter('');
    setPriceRange([0, 10000]);
    setMinRating(0);
  };

  const hasActiveFilters = searchQuery || selectedInstrument !== 'all' || locationFilter || priceRange[0] > 0 || priceRange[1] < 10000 || minRating > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-center mb-4">
            Find Your Perfect <span className="text-gradient">Music Teacher</span>
          </h1>
          <p className="text-muted-foreground text-center text-lg mb-8 max-w-2xl mx-auto">
            Browse qualified teachers, compare prices, and book your first lesson today
          </p>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
              <SelectTrigger className="w-full md:w-[200px] h-12">
                <Music className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Instrument" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instruments</SelectItem>
                {instruments.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id}>
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="h-12"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-card rounded-xl shadow-card max-w-3xl mx-auto animate-slide-up">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Nairobi"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: {priceRange[0]} - {priceRange[1]} KSH/hr
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={10000}
                    step={100}
                    className="mt-4"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                  <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any rating</SelectItem>
                      <SelectItem value="3">3+ stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-4">
                  <X className="h-4 w-4 mr-1" /> Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {loading ? 'Loading...' : `${filteredTeachers.length} teacher${filteredTeachers.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-20">
              <Music className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-medium mb-2">No teachers found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

const TeacherCard = ({ teacher }: { teacher: TeacherData }) => {
  const profile = teacher.profiles;
  if (!profile) return null;

  const instrumentNames = teacher.teacher_instruments
    ?.map((ti) => ti.instruments?.name)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Card className="group hover:shadow-warm transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        {/* Image/Avatar */}
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-20 w-20 text-primary/40" />
          )}
          {/* Rating Badge */}
          {teacher.rating && teacher.rating > 0 && (
            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-sm">{teacher.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
            {profile.full_name}
          </h3>
          
          {profile.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
              <MapPin className="h-3 w-3" />
              {profile.location}
            </p>
          )}

          {/* Instruments */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {instrumentNames?.map((name, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {name}
              </Badge>
            ))}
            {teacher.teacher_instruments?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{teacher.teacher_instruments.length - 3}
              </Badge>
            )}
          </div>

          {/* Bio excerpt */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {profile.bio}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <span className="text-xl font-bold text-primary">{teacher.hourly_rate}</span>
              <span className="text-sm text-muted-foreground"> KSH/hr</span>
            </div>
            <Button size="sm" asChild>
              <Link to={`/teachers/${teacher.id}`}>View Profile</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Teachers;
