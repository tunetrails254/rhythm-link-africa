-- Add 'parent' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'parent';

-- Create children profiles table (for kids managed by parents)
CREATE TABLE public.child_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for child_profiles
CREATE POLICY "Parents can view their children" 
ON public.child_profiles 
FOR SELECT 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create child profiles" 
ON public.child_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their children" 
ON public.child_profiles 
FOR UPDATE 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their children" 
ON public.child_profiles 
FOR DELETE 
USING (auth.uid() = parent_id);

-- Teachers can view child profiles for lessons they teach
CREATE POLICY "Teachers can view child profiles for their lessons" 
ON public.child_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN teacher_profiles tp ON tp.id = l.teacher_id
    WHERE l.student_id = child_profiles.id 
    AND tp.user_id = auth.uid()
  )
);

-- Add child_id column to lessons table (nullable - for regular students it's null)
ALTER TABLE public.lessons 
ADD COLUMN child_id UUID REFERENCES public.child_profiles(id) ON DELETE SET NULL;

-- Update lessons RLS to allow parents to create/view lessons for their children
DROP POLICY IF EXISTS "Students can create lessons" ON public.lessons;
CREATE POLICY "Students and parents can create lessons" 
ON public.lessons 
FOR INSERT 
WITH CHECK (
  auth.uid() = student_id 
  OR (
    child_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM child_profiles 
      WHERE id = child_id AND parent_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Students can view their lessons" ON public.lessons;
CREATE POLICY "Students and parents can view lessons" 
ON public.lessons 
FOR SELECT 
USING (
  auth.uid() = student_id 
  OR auth.uid() = get_teacher_user_id(teacher_id)
  OR (
    child_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM child_profiles 
      WHERE id = child_id AND parent_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Participants can update lessons" ON public.lessons;
CREATE POLICY "Participants can update lessons" 
ON public.lessons 
FOR UPDATE 
USING (
  auth.uid() = student_id 
  OR auth.uid() = get_teacher_user_id(teacher_id)
  OR (
    child_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM child_profiles 
      WHERE id = child_id AND parent_id = auth.uid()
    )
  )
);

-- Create trigger for updated_at on child_profiles
CREATE TRIGGER update_child_profiles_updated_at
BEFORE UPDATE ON public.child_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();