 import { Button } from "@/components/ui/button";
 import { MusicWaves } from "./MusicWaves";
 import { Menu, X, LogOut, MessageCircle } from "lucide-react";
 import { useState, useEffect } from "react";
 import { Link, useNavigate } from "react-router-dom";
 import { useAuth } from "@/hooks/useAuth";
 import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
 const [unreadCount, setUnreadCount] = useState(0);
 
 useEffect(() => {
   if (!user) {
     setUnreadCount(0);
     return;
   }
 
   // Fetch initial unread count
   const fetchUnreadCount = async () => {
     const { count } = await supabase
       .from('messages')
       .select('*, conversations!inner(*)', { count: 'exact', head: true })
       .neq('sender_id', user.id)
       .eq('is_read', false)
       .or(`conversations.participant_one.eq.${user.id},conversations.participant_two.eq.${user.id}`);
     
     setUnreadCount(count || 0);
   };
 
   fetchUnreadCount();
 
   // Subscribe to new messages in real-time
   const channel = supabase
     .channel('navbar-messages')
     .on(
       'postgres_changes',
       {
         event: 'INSERT',
         schema: 'public',
         table: 'messages'
       },
       async (payload) => {
         const newMsg = payload.new as { sender_id: string; conversation_id: string };
         // Only increment if the message is not from us
         if (newMsg.sender_id !== user.id) {
           // Verify we're part of this conversation
           const { data: conv } = await supabase
             .from('conversations')
             .select('id')
             .eq('id', newMsg.conversation_id)
             .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
             .single();
           
           if (conv) {
             setUnreadCount((prev) => prev + 1);
           }
         }
       }
     )
     .on(
       'postgres_changes',
       {
         event: 'UPDATE',
         schema: 'public',
         table: 'messages',
         filter: 'is_read=eq.true'
       },
       () => {
         // Refetch count when messages are marked as read
         fetchUnreadCount();
       }
     )
     .subscribe();
 
   return () => {
     supabase.removeChannel(channel);
   };
 }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <MusicWaves className="group-hover:scale-110 transition-transform" barCount={4} />
            <span className="font-display font-bold text-xl text-foreground">
              Tune<span className="text-primary">trails</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/teachers" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Find Teachers
            </Link>
            <Link to="/gigs" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Hire Musicians
            </Link>
            {user && (
              <>
               <Link to="/messages" className="relative text-muted-foreground hover:text-foreground transition-colors font-medium">
                 <MessageCircle className="h-5 w-5" />
                 {unreadCount > 0 && (
                   <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                     {unreadCount > 9 ? '9+' : unreadCount}
                   </span>
                 )}
               </Link>
                <Link to="/student-dashboard" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  My Lessons
                </Link>
              </>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? null : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/student-dashboard')}>
                    My Lessons
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/teacher-dashboard')}>
                    Teacher Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link to="/teachers" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>
                Find Teachers
              </Link>
              <Link to="/gigs" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>
                Hire Musicians
              </Link>
              {user && (
                <>
                 <Link to="/messages" className="relative text-muted-foreground hover:text-foreground transition-colors font-medium py-2 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                   <MessageCircle className="h-5 w-5" />
                   Messages
                   {unreadCount > 0 && (
                     <span className="bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                       {unreadCount > 9 ? '9+' : unreadCount}
                     </span>
                   )}
                 </Link>
                  <Link to="/student-dashboard" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>
                    My Lessons
                  </Link>
                  <Link to="/teacher-dashboard" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>
                    Teacher Dashboard
                  </Link>
                </>
              )}
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                {user ? (
                  <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full" asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>Log In</Link>
                    </Button>
                    <Button variant="default" className="w-full" asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
