
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, User, ArrowLeft, Database, Camera, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { RecommendedProducts } from '@/components/skincare/RecommendedProducts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Product = {
  product_name: string;
  product_description?: string;
  product_link?: string;
};

type ChatHistory = {
  id: string;
  message: string;
  response: string;
  created_at: string;
  recommended_products?: Product[];
};

const SkinCareAI: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your personalized skincare assistant. How can I help you today? You can ask me about recommended routines, products for specific concerns, or general skincare advice."
    }
  ]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [userProfile, setUserProfile] = useState<{skin_type?: string; skin_tone?: string} | null>(null);

  // Fetch user profile information (skin type, skin tone)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('skin_type, skin_tone')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('skincare-history', {
          body: { 
            action: 'get-history',
            data: { type: 'chat' }
          }
        });
        
        if (error) throw error;
        if (data.chats) {
          setChatHistory(data.chats);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        toast.error('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatHistory();
  }, [user]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    if (isSending) return;
    
    setIsSending(true);
    const userMessage = message.trim();
    setMessage('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      // Show a temporary loading message
      setMessages(prev => [...prev, { role: 'assistant', content: '...' }]);
      
      // Call the skincare-ai edge function
      const { data, error } = await supabase.functions.invoke('skincare-ai', {
        body: { 
          message: userMessage,
          skin_type: userProfile?.skin_type || '',
          skin_tone: userProfile?.skin_tone || '' 
        }
      });
      
      if (error) throw error;
      
      // Remove the loading message
      setMessages(prev => prev.slice(0, -1));
      
      // Add the actual assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      // Check if we have product recommendations
      if (data.products && data.products.length > 0) {
        setSuggestedProducts(data.products);
      }
      
      // Save chat to history
      if (user) {
        await supabase.functions.invoke('skincare-history', {
          body: { 
            action: 'save-chat',
            data: {
              message: userMessage,
              response: data.response,
              products: data.products
            }
          }
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the loading message
      setMessages(prev => prev.slice(0, -1));
      // Add error message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
      toast.error('Failed to get a response');
    } finally {
      setIsSending(false);
      // After sending, focus back on the input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message when Enter is pressed (but not with Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const loadChatHistory = (chat: ChatHistory) => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your personalized skincare assistant. How can I help you today?"
      },
      { role: 'user', content: chat.message },
      { role: 'assistant', content: chat.response }
    ]);
    
    // Load any products from the chat
    if (chat.recommended_products && chat.recommended_products.length > 0) {
      setSuggestedProducts(chat.recommended_products);
    } else {
      setSuggestedProducts([]);
    }
  };

  const startNewChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm your personalized skincare assistant. How can I help you today? You can ask me about recommended routines, products for specific concerns, or general skincare advice."
    }]);
    setSuggestedProducts([]);
    setMessage('');
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen w-full">
      <AnimatedBackground />
      
      <div className="w-full max-w-screen-xl px-6 py-8 mx-auto">
        <motion.div 
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo size="md" />
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4" />
              Profile
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => navigate('/skin-analyzer')}
            >
              <Camera className="h-4 w-4" />
              Skin Scanner
            </Button>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar on larger screens - Chat History */}
          <motion.div 
            className="hidden lg:block"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-[80vh] border-2 border-primary/20 shadow-lg shadow-primary/10 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-center">
                  <span>Chat History</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={startNewChat}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>Your recent conversations</CardDescription>
              </CardHeader>
              <ScrollArea className="h-[calc(80vh-5rem)] p-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : chatHistory.length > 0 ? (
                  <div className="space-y-2">
                    {chatHistory.map((chat) => (
                      <div 
                        key={chat.id} 
                        className="p-3 rounded-md bg-card hover:bg-muted cursor-pointer border border-border"
                        onClick={() => loadChatHistory(chat)}
                      >
                        <div className="font-medium truncate">{chat.message}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(chat.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    No chat history yet
                  </div>
                )}
              </ScrollArea>
            </Card>
          </motion.div>
          
          {/* Main Content - Chat and Products */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs defaultValue="chat" className="h-[80vh]">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="products">Recommended Products</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="h-full">
                <Card className="h-full border-2 border-primary/20 shadow-lg shadow-primary/10 overflow-hidden flex flex-col">
                  <CardHeader className="py-3">
                    <CardTitle className="flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                      SkinCare AI Assistant
                    </CardTitle>
                    {userProfile?.skin_type && userProfile?.skin_tone && (
                      <CardDescription>
                        Personalized for {userProfile.skin_type} skin with {userProfile.skin_tone} tone
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 mb-4">
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex items-start max-w-[80%]">
                            {msg.role === 'assistant' && (
                              <Avatar className="h-8 w-8 mr-2 mt-1">
                                <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {msg.content === '...' ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                              ) : (
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                              )}
                            </div>
                            
                            {msg.role === 'user' && (
                              <Avatar className="h-8 w-8 ml-2 mt-1">
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t">
                    <div className="flex items-end gap-2">
                      <Textarea
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your skincare question here..."
                        className="min-h-[60px] resize-none"
                        disabled={isSending}
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        className="h-10 w-10"
                        disabled={isSending || !message.trim()}
                        onClick={handleSendMessage}
                      >
                        {isSending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="products" className="h-full">
                <Card className="h-full border-2 border-primary/20 shadow-lg shadow-primary/10 overflow-hidden">
                  <CardHeader>
                    <CardTitle>Recommended Products</CardTitle>
                    <CardDescription>
                      Products suggested based on your skincare needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {suggestedProducts.length > 0 ? (
                      <RecommendedProducts products={suggestedProducts} />
                    ) : (
                      <div className="text-center py-10">
                        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No Products Yet</h3>
                        <p className="text-muted-foreground">
                          Chat with the AI assistant to get personalized product recommendations
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SkinCareAI;
