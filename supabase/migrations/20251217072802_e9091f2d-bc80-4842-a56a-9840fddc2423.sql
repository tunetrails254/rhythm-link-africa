-- Gig performer profiles
CREATE TABLE public.gig_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  performer_type TEXT DEFAULT 'solo', -- solo, band, duo, ensemble
  bio TEXT,
  genres TEXT[] DEFAULT '{}',
  video_urls TEXT[] DEFAULT '{}',
  audio_urls TEXT[] DEFAULT '{}',
  setlist TEXT,
  tech_rider TEXT,
  base_price INTEGER DEFAULT 5000,
  price_per_hour INTEGER DEFAULT 2000,
  location TEXT,
  is_available BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_gigs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Gig bookings
CREATE TABLE public.gig_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_profile_id UUID NOT NULL REFERENCES public.gig_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- wedding, church, corporate, party, etc.
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_hours INTEGER DEFAULT 2,
  venue TEXT,
  location TEXT,
  special_requests TEXT,
  total_price INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Wallets for payment system
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gig_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gig_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Gig profiles policies
CREATE POLICY "Gig profiles are viewable by everyone"
ON public.gig_profiles FOR SELECT USING (true);

CREATE POLICY "Users can create their own gig profile"
ON public.gig_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gig profile"
ON public.gig_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Gig bookings policies
CREATE POLICY "Users can view their own bookings"
ON public.gig_bookings FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = (SELECT user_id FROM public.gig_profiles WHERE id = gig_profile_id));

CREATE POLICY "Users can create bookings"
ON public.gig_bookings FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Participants can update bookings"
ON public.gig_bookings FOR UPDATE
USING (auth.uid() = client_id OR auth.uid() = (SELECT user_id FROM public.gig_profiles WHERE id = gig_profile_id));

-- Wallet policies
CREATE POLICY "Users can view their own wallet"
ON public.wallets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
ON public.wallets FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_gig_profiles_updated_at
BEFORE UPDATE ON public.gig_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gig_bookings_updated_at
BEFORE UPDATE ON public.gig_bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user to create wallet
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));

  -- Create wallet for new user
  insert into public.wallets (user_id, balance)
  values (new.id, 0.00)
  on conflict (user_id) do nothing;

  -- Check if registering as teacher
  if new.raw_user_meta_data->>'role' = 'teacher' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'teacher');
    
    insert into public.teacher_profiles (user_id, hourly_rate)
    values (new.id, coalesce((new.raw_user_meta_data->>'hourly_rate')::integer, 500));
  else
    insert into public.user_roles (user_id, role)
    values (new.id, 'student');
  end if;

  return new;
end;
$$;