-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'teacher');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- User roles policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles" 
ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create instruments table
CREATE TABLE public.instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instruments are viewable by everyone" 
ON public.instruments FOR SELECT USING (true);

-- Seed common instruments
INSERT INTO public.instruments (name, category) VALUES
  ('Piano', 'Keyboard'),
  ('Guitar', 'String'),
  ('Electric Guitar', 'String'),
  ('Bass Guitar', 'String'),
  ('Drums', 'Percussion'),
  ('Violin', 'String'),
  ('Saxophone', 'Wind'),
  ('Vocals', 'Voice'),
  ('Ukulele', 'String'),
  ('Keyboard', 'Keyboard'),
  ('Trumpet', 'Brass'),
  ('Flute', 'Wind'),
  ('Nyatiti', 'Traditional'),
  ('Djembe', 'Percussion');

-- Create teacher_profiles table (extends profiles for teachers)
CREATE TABLE public.teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  hourly_rate INTEGER NOT NULL DEFAULT 500,
  experience_years INTEGER DEFAULT 0,
  teaching_style TEXT,
  availability TEXT,
  is_online_available BOOLEAN DEFAULT true,
  is_in_person_available BOOLEAN DEFAULT true,
  rating NUMERIC(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher profiles are viewable by everyone" 
ON public.teacher_profiles FOR SELECT USING (true);

CREATE POLICY "Teachers can insert their own profile" 
ON public.teacher_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can update their own profile" 
ON public.teacher_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create teacher_instruments junction table
CREATE TABLE public.teacher_instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teacher_profiles(id) ON DELETE CASCADE NOT NULL,
  instrument_id UUID REFERENCES public.instruments(id) ON DELETE CASCADE NOT NULL,
  proficiency_level TEXT DEFAULT 'advanced',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (teacher_id, instrument_id)
);

ALTER TABLE public.teacher_instruments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher instruments are viewable by everyone" 
ON public.teacher_instruments FOR SELECT USING (true);

CREATE POLICY "Teachers can manage their instruments" 
ON public.teacher_instruments FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teacher_profiles 
    WHERE id = teacher_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can delete their instruments" 
ON public.teacher_instruments FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.teacher_profiles 
    WHERE id = teacher_id AND user_id = auth.uid()
  )
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.teacher_profiles(id) ON DELETE CASCADE NOT NULL,
  instrument_id UUID REFERENCES public.instruments(id) NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  lesson_type TEXT DEFAULT 'online' CHECK (lesson_type IN ('online', 'in_person')),
  price INTEGER NOT NULL,
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Security definer function to get teacher user_id
CREATE OR REPLACE FUNCTION public.get_teacher_user_id(_teacher_profile_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.teacher_profiles WHERE id = _teacher_profile_id
$$;

CREATE POLICY "Students can view their lessons" 
ON public.lessons FOR SELECT 
USING (auth.uid() = student_id OR auth.uid() = public.get_teacher_user_id(teacher_id));

CREATE POLICY "Students can create lessons" 
ON public.lessons FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Participants can update lessons" 
ON public.lessons FOR UPDATE 
USING (auth.uid() = student_id OR auth.uid() = public.get_teacher_user_id(teacher_id));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teacher_profiles_updated_at
BEFORE UPDATE ON public.teacher_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user creation (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User')
  );
  
  -- Insert role from metadata
  IF NEW.raw_user_meta_data ->> 'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data ->> 'role')::app_role);
  END IF;
  
  -- If teacher, create teacher_profile
  IF NEW.raw_user_meta_data ->> 'role' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (user_id, hourly_rate)
    VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data ->> 'hourly_rate')::INTEGER, 500));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();