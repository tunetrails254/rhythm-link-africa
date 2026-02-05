 import { useState, useEffect, useRef } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { MessageCircle, Send, Loader2 } from 'lucide-react';
 import { toast } from 'sonner';
 import { format } from 'date-fns';
 
 interface Message {
   id: string;
   sender_id: string;
   content: string;
   created_at: string;
   is_read: boolean;
 }
 
 interface ChatDialogProps {
   recipientId: string;
   recipientName: string;
 }
 
 export const ChatDialog = ({ recipientId, recipientName }: ChatDialogProps) => {
   const { user } = useAuth();
   const [open, setOpen] = useState(false);
   const [messages, setMessages] = useState<Message[]>([]);
   const [newMessage, setNewMessage] = useState('');
   const [loading, setLoading] = useState(false);
   const [sending, setSending] = useState(false);
   const [conversationId, setConversationId] = useState<string | null>(null);
   const scrollRef = useRef<HTMLDivElement>(null);
 
   useEffect(() => {
     if (open && user) {
       loadOrCreateConversation();
     }
   }, [open, user]);
 
   useEffect(() => {
     if (!conversationId) return;
 
     // Subscribe to new messages
     const channel = supabase
       .channel(`messages:${conversationId}`)
       .on(
         'postgres_changes',
         {
           event: 'INSERT',
           schema: 'public',
           table: 'messages',
           filter: `conversation_id=eq.${conversationId}`
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
   }, [conversationId]);
 
   useEffect(() => {
     // Scroll to bottom when messages change
     if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }
   }, [messages]);
 
   const loadOrCreateConversation = async () => {
     if (!user) return;
     setLoading(true);
 
     // Sort IDs to ensure consistent ordering for unique constraint
     const [participantOne, participantTwo] = [user.id, recipientId].sort();
 
     // Check if conversation exists
     const { data: existing, error: fetchError } = await supabase
       .from('conversations')
       .select('id')
       .or(`and(participant_one.eq.${participantOne},participant_two.eq.${participantTwo})`)
       .maybeSingle();
 
     if (fetchError) {
       console.error('Error fetching conversation:', fetchError);
       toast.error('Failed to load conversation');
       setLoading(false);
       return;
     }
 
     let convId = existing?.id;
 
     if (!convId) {
       // Create new conversation
       const { data: newConv, error: createError } = await supabase
         .from('conversations')
         .insert({ participant_one: participantOne, participant_two: participantTwo })
         .select('id')
         .single();
 
       if (createError) {
         console.error('Error creating conversation:', createError);
         toast.error('Failed to start conversation');
         setLoading(false);
         return;
       }
       convId = newConv.id;
     }
 
     setConversationId(convId);
 
     // Load messages
     const { data: msgs, error: msgsError } = await supabase
       .from('messages')
       .select('*')
       .eq('conversation_id', convId)
       .order('created_at', { ascending: true });
 
     if (msgsError) {
       console.error('Error loading messages:', msgsError);
     } else {
       setMessages(msgs || []);
     }
 
     setLoading(false);
   };
 
   const sendMessage = async () => {
     if (!newMessage.trim() || !conversationId || !user) return;
 
     setSending(true);
     const content = newMessage.trim();
     setNewMessage('');
 
     const { error } = await supabase.from('messages').insert({
       conversation_id: conversationId,
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
 
   if (!user) {
     return (
       <Button variant="outline" disabled>
         <MessageCircle className="h-4 w-4 mr-2" />
         Log in to message
       </Button>
     );
   }
 
   return (
     <Dialog open={open} onOpenChange={setOpen}>
       <DialogTrigger asChild>
         <Button variant="outline">
           <MessageCircle className="h-4 w-4 mr-2" />
           Message
         </Button>
       </DialogTrigger>
       <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
         <DialogHeader className="p-4 border-b">
           <DialogTitle>Chat with {recipientName}</DialogTitle>
         </DialogHeader>
 
         {loading ? (
           <div className="flex-1 flex items-center justify-center">
             <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
           </div>
         ) : (
           <>
             <ScrollArea className="flex-1 p-4" ref={scrollRef}>
               <div className="space-y-3">
                 {messages.length === 0 ? (
                   <p className="text-center text-muted-foreground text-sm py-8">
                     No messages yet. Start the conversation!
                   </p>
                 ) : (
                   messages.map((msg) => {
                     const isOwn = msg.sender_id === user.id;
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
                           <p className="text-sm whitespace-pre-wrap break-words">
                             {msg.content}
                           </p>
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
                   })
                 )}
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
                 {sending ? (
                   <Loader2 className="h-4 w-4 animate-spin" />
                 ) : (
                   <Send className="h-4 w-4" />
                 )}
               </Button>
             </div>
           </>
         )}
       </DialogContent>
     </Dialog>
   );
 };