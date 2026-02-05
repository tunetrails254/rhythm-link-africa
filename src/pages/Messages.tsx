 import { useState, useEffect } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { useNavigate } from 'react-router-dom';
 import { Navbar } from '@/components/Navbar';
 import { Footer } from '@/components/Footer';
 import { Card, CardContent } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { MessageCircle, Send, Loader2, ArrowLeft, User } from 'lucide-react';
 import { toast } from 'sonner';
 import { format } from 'date-fns';
 
 interface Conversation {
   id: string;
   participant_one: string;
   participant_two: string;
   updated_at: string;
   other_user?: {
     id: string;
     full_name: string;
     avatar_url: string | null;
   };
   last_message?: string;
 }
 
 interface Message {
   id: string;
   sender_id: string;
   content: string;
   created_at: string;
   is_read: boolean;
 }
 
 const Messages = () => {
   const { user, loading: authLoading } = useAuth();
   const navigate = useNavigate();
   const [conversations, setConversations] = useState<Conversation[]>([]);
   const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
   const [messages, setMessages] = useState<Message[]>([]);
   const [newMessage, setNewMessage] = useState('');
   const [loading, setLoading] = useState(true);
   const [sending, setSending] = useState(false);
 
   useEffect(() => {
     if (!authLoading && !user) {
       navigate('/auth');
     }
   }, [user, authLoading, navigate]);
 
   useEffect(() => {
     if (user) {
       loadConversations();
     }
   }, [user]);
 
   useEffect(() => {
     if (!selectedConversation) return;
 
     loadMessages(selectedConversation.id);
 
     // Subscribe to new messages
     const channel = supabase
       .channel(`messages:${selectedConversation.id}`)
       .on(
         'postgres_changes',
         {
           event: 'INSERT',
           schema: 'public',
           table: 'messages',
           filter: `conversation_id=eq.${selectedConversation.id}`
         },
         (payload) => {
           const newMsg = payload.new as Message;
           setMessages((prev) => [...prev, newMsg]);
         }
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, [selectedConversation]);
 
   const loadConversations = async () => {
     if (!user) return;
     setLoading(true);
 
     const { data, error } = await supabase
       .from('conversations')
       .select('*')
       .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
       .order('updated_at', { ascending: false });
 
     if (error) {
       console.error('Error loading conversations:', error);
       toast.error('Failed to load conversations');
       setLoading(false);
       return;
     }
 
     // Fetch other user profiles
     const convWithUsers = await Promise.all(
       (data || []).map(async (conv) => {
         const otherId = conv.participant_one === user.id ? conv.participant_two : conv.participant_one;
         const { data: profile } = await supabase
           .from('profiles')
           .select('id, full_name, avatar_url')
           .eq('id', otherId)
           .single();
 
         // Get last message
         const { data: lastMsg } = await supabase
           .from('messages')
           .select('content')
           .eq('conversation_id', conv.id)
           .order('created_at', { ascending: false })
           .limit(1)
           .single();
 
         return {
           ...conv,
           other_user: profile || { id: otherId, full_name: 'Unknown User', avatar_url: null },
           last_message: lastMsg?.content || 'No messages yet'
         };
       })
     );
 
     setConversations(convWithUsers);
     setLoading(false);
   };
 
   const loadMessages = async (conversationId: string) => {
     const { data, error } = await supabase
       .from('messages')
       .select('*')
       .eq('conversation_id', conversationId)
       .order('created_at', { ascending: true });
 
     if (error) {
       console.error('Error loading messages:', error);
     } else {
       setMessages(data || []);
     }
   };
 
   const sendMessage = async () => {
     if (!newMessage.trim() || !selectedConversation || !user) return;
 
     setSending(true);
     const content = newMessage.trim();
     setNewMessage('');
 
     const { error } = await supabase.from('messages').insert({
       conversation_id: selectedConversation.id,
       sender_id: user.id,
       content
     });
 
     if (error) {
       console.error('Error sending message:', error);
       toast.error('Failed to send message');
       setNewMessage(content);
     }
 
     setSending(false);
   };
 
   const handleKeyPress = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter' && !e.shiftKey) {
       e.preventDefault();
       sendMessage();
     }
   };
 
   if (authLoading) {
     return (
       <div className="min-h-screen bg-background">
         <Navbar />
         <div className="flex items-center justify-center py-40">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
 
       <div className="pt-24 pb-16 px-4">
         <div className="container mx-auto max-w-5xl">
           <h1 className="text-3xl font-display font-bold mb-6">Messages</h1>
 
           <Card className="h-[600px] flex overflow-hidden">
             {/* Conversations List */}
             <div className="w-1/3 border-r flex flex-col">
               <div className="p-4 border-b">
                 <h2 className="font-semibold">Conversations</h2>
               </div>
               <ScrollArea className="flex-1">
                 {loading ? (
                   <div className="flex items-center justify-center py-8">
                     <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                   </div>
                 ) : conversations.length === 0 ? (
                   <div className="p-4 text-center text-muted-foreground text-sm">
                     <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                     No conversations yet
                   </div>
                 ) : (
                   conversations.map((conv) => (
                     <button
                       key={conv.id}
                       onClick={() => setSelectedConversation(conv)}
                       className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left ${
                         selectedConversation?.id === conv.id ? 'bg-muted' : ''
                       }`}
                     >
                       <Avatar>
                         <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                         <AvatarFallback>
                           <User className="h-4 w-4" />
                         </AvatarFallback>
                       </Avatar>
                       <div className="flex-1 min-w-0">
                         <p className="font-medium truncate">{conv.other_user?.full_name}</p>
                         <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                       </div>
                     </button>
                   ))
                 )}
               </ScrollArea>
             </div>
 
             {/* Chat Area */}
             <div className="flex-1 flex flex-col">
               {selectedConversation ? (
                 <>
                   <div className="p-4 border-b flex items-center gap-3">
                     <Button
                       variant="ghost"
                       size="icon"
                       className="md:hidden"
                       onClick={() => setSelectedConversation(null)}
                     >
                       <ArrowLeft className="h-4 w-4" />
                     </Button>
                     <Avatar>
                       <AvatarImage src={selectedConversation.other_user?.avatar_url || undefined} />
                       <AvatarFallback>
                         <User className="h-4 w-4" />
                       </AvatarFallback>
                     </Avatar>
                     <span className="font-semibold">{selectedConversation.other_user?.full_name}</span>
                   </div>
 
                   <ScrollArea className="flex-1 p-4">
                     <div className="space-y-3">
                       {messages.map((msg) => {
                         const isOwn = msg.sender_id === user?.id;
                         return (
                           <div
                             key={msg.id}
                             className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                           >
                             <div
                               className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                 isOwn
                                   ? 'bg-primary text-primary-foreground rounded-br-sm'
                                   : 'bg-muted rounded-bl-sm'
                               }`}
                             >
                               <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                               <p
                                 className={`text-xs mt-1 ${
                                   isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                 }`}
                               >
                                 {format(new Date(msg.created_at), 'HH:mm')}
                               </p>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </ScrollArea>
 
                   <div className="p-4 border-t flex gap-2">
                     <Input
                       placeholder="Type a message..."
                       value={newMessage}
                       onChange={(e) => setNewMessage(e.target.value)}
                       onKeyPress={handleKeyPress}
                       disabled={sending}
                     />
                     <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                       {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                     </Button>
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex items-center justify-center text-muted-foreground">
                   <div className="text-center">
                     <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                     <p>Select a conversation to start chatting</p>
                   </div>
                 </div>
               )}
             </div>
           </Card>
         </div>
       </div>
 
       <Footer />
     </div>
   );
 };
 
 export default Messages;