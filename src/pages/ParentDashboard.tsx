import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Users, Music, Calendar, PartyPopper, Edit2, Trash2 } from 'lucide-react';

interface ChildProfile {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  avatar_url: string | null;
  notes: string | null;
  created_at: string;
}

interface Lesson {
  id: string;
  scheduled_at: string;
  status: string;
  duration_minutes: number;
  price: number;
  child_id: string;
  teacher_profiles: {
    id: string;
    user_id: string;
  };
  instruments: {
    name: string;
  };
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  
  // Form state
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [childNotes, setChildNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    try {
      // Load children
      const { data: childrenData, error: childrenError } = await supabase
        .from('child_profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);

      // Load lessons for all children
      if (childrenData && childrenData.length > 0) {
        const childIds = childrenData.map(c => c.id);
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select(`
            id,
            scheduled_at,
            status,
            duration_minutes,
            price,
            child_id,
            teacher_profiles:teacher_id (id, user_id),
            instruments:instrument_id (name)
          `)
          .in('child_id', childIds)
          .order('scheduled_at', { ascending: false })
          .limit(20);

        if (lessonsError) throw lessonsError;
        setLessons((lessonsData as any) || []);
      }
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async () => {
    if (!childName.trim()) {
      toast.error('Please enter your child\'s name');
      return;
    }

    setSaving(true);
    try {
      if (editingChild) {
        // Update existing child
        const { error } = await supabase
          .from('child_profiles')
          .update({
            full_name: childName,
            date_of_birth: childDob || null,
            notes: childNotes || null,
          })
          .eq('id', editingChild.id);

        if (error) throw error;
        toast.success('Child profile updated!');
      } else {
        // Add new child
        const { error } = await supabase
          .from('child_profiles')
          .insert({
            parent_id: user!.id,
            full_name: childName,
            date_of_birth: childDob || null,
            notes: childNotes || null,
          });

        if (error) throw error;
        toast.success('Child added successfully!');
      }

      // Reset form and reload
      setChildName('');
      setChildDob('');
      setChildNotes('');
      setEditingChild(null);
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditChild = (child: ChildProfile) => {
    setEditingChild(child);
    setChildName(child.full_name);
    setChildDob(child.date_of_birth || '');
    setChildNotes(child.notes || '');
    setDialogOpen(true);
  };

  const handleDeleteChild = async (childId: string) => {
    if (!confirm('Are you sure you want to remove this child? This will also delete their lesson history.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('child_profiles')
        .delete()
        .eq('id', childId);

      if (error) throw error;
      toast.success('Child removed');
      loadData();
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const getChildAge = (dob: string | null) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getChildLessons = (childId: string) => {
    return lessons.filter(l => l.child_id === childId);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">Parent Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your children's music journey</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/gigs')}>
              <PartyPopper className="h-4 w-4 mr-2" />
              Hire for Event
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingChild(null);
                setChildName('');
                setChildDob('');
                setChildNotes('');
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Child
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingChild ? 'Edit Child Profile' : 'Add a Child'}</DialogTitle>
                  <DialogDescription>
                    {editingChild ? 'Update your child\'s information' : 'Add your child to book lessons on their behalf'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="child-name">Child's Name</Label>
                    <Input
                      id="child-name"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-dob">Date of Birth (optional)</Label>
                    <Input
                      id="child-dob"
                      type="date"
                      value={childDob}
                      onChange={(e) => setChildDob(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-notes">Notes (optional)</Label>
                    <Textarea
                      id="child-notes"
                      value={childNotes}
                      onChange={(e) => setChildNotes(e.target.value)}
                      placeholder="Any allergies, preferences, or things the teacher should know..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleAddChild} className="w-full" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {editingChild ? 'Update Child' : 'Add Child'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Children Grid */}
        {children.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Children Added Yet</h2>
            <p className="text-muted-foreground mb-6">
              Add your children to start booking music lessons for them
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Child
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => {
              const age = getChildAge(child.date_of_birth);
              const childLessons = getChildLessons(child.id);
              const upcomingLessons = childLessons.filter(l => new Date(l.scheduled_at) > new Date() && l.status !== 'cancelled');
              const completedLessons = childLessons.filter(l => l.status === 'completed');

              return (
                <Card key={child.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{child.full_name}</CardTitle>
                        <CardDescription>
                          {age !== null ? `${age} years old` : 'Age not set'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditChild(child)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteChild(child.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {child.notes && (
                      <p className="text-sm text-muted-foreground">{child.notes}</p>
                    )}
                    
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        <Calendar className="h-3 w-3 mr-1" />
                        {upcomingLessons.length} upcoming
                      </Badge>
                      <Badge variant="outline">
                        <Music className="h-3 w-3 mr-1" />
                        {completedLessons.length} completed
                      </Badge>
                    </div>

                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate(`/teachers?child=${child.id}`)}
                    >
                      <Music className="h-4 w-4 mr-2" />
                      Book a Lesson
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Recent Lessons Section */}
        {lessons.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-display font-bold mb-6">Recent Lessons</h2>
            <div className="space-y-3">
              {lessons.slice(0, 5).map((lesson) => {
                const child = children.find(c => c.id === lesson.child_id);
                return (
                  <Card key={lesson.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{child?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {lesson.instruments?.name} • {lesson.duration_minutes} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {new Date(lesson.scheduled_at).toLocaleDateString()}
                        </p>
                        <Badge variant={
                          lesson.status === 'completed' ? 'default' :
                          lesson.status === 'cancelled' ? 'destructive' :
                          'secondary'
                        }>
                          {lesson.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ParentDashboard;
