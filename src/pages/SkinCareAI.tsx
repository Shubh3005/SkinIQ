import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, RefreshCw, Scan, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AnimatedBackground from '@/components/AnimatedBackground';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RecommendedProducts } from '@/components/skincare/RecommendedProducts';
import { Card } from '@/components/ui/card';
import { parseProductsFromText } from '@/utils/productParser';

interface Message {
  role: string;
  content: string;
  timestamp?: Date;
}

const SkinCareAI = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: "Welcome to SkinCare AI! I can help you with skincare recommendations, answer questions about skin conditions, and suggest personalized routines based on your skin type. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [skinType, setSkinType] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    fetchSkinType();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSkinType = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('skin_type')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching skin type:', error);
        return;
      }
      
      if (data && data.skin_type) {
        setSkinType(data.skin_type);
        console.log('Loaded skin type:', data.skin_type);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Save the user's message to the database
      if (user) {
        const { error: chatError } = await supabase
          .from('chat_history')
          .insert({
            user_id: user.id,
            message: input,
            response: '' // To be filled later when response comes
          });
          
        if (chatError) {
          console.error('Error saving chat:', chatError);
        }
      }
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/skincare-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          message: input,
          skinType,
          previousMessages: messages.filter(m => m.role !== 'system').slice(-4)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      const responseText = data.text || "I'm sorry, I couldn't process your request. Please try again.";
      
      const botMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      
      // Parse products from the response
      const parsedProducts = parseProductsFromText(responseText);
      if (parsedProducts.length > 0) {
        setRecommendedProducts(parsedProducts);
      }
      
      // Update the chat history with the AI response
      if (user) {
        const { data: chatData, error: updateError } = await supabase
          .from('chat_history')
          .select('id')
          .eq('user_id', user.id)
          .eq('message', input)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (updateError) {
          console.error('Error fetching chat to update:', updateError);
        } else if (chatData && chatData.length > 0) {
          const { error } = await supabase
            .from('chat_history')
            .update({ response: botMessage.content })
            .eq('id', chatData[0].id);
            
          if (error) {
            console.error('Error updating chat response:', error);
          }
        }
      }
      
    } catch (error) {
      console.error('Error getting response:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden relative">
      <AnimatedBackground />
      
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold">
              Skin<span className="text-primary">Care</span> AI
            </h1>
            <p className="text-sm text-muted-foreground">
              Your personal skincare assistant
            </p>
          </div>
          
          {skinType && (
            <Badge variant="outline" className="px-3 py-1 text-xs bg-primary/10">
              Skin Type: {skinType.charAt(0).toUpperCase() + skinType.slice(1)}
            </Badge>
          )}
        </motion.div>
        
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 flex flex-col bg-card rounded-xl shadow-lg overflow-hidden border border-border/50"
          >
            <div className="p-4 border-b flex justify-between items-center bg-card">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-primary/20">
                  <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm">SkinCare Assistant</h3>
                  <p className="text-xs text-muted-foreground">AI-powered skin specialist</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setMessages([{
                  role: 'system',
                  content: "Welcome to SkinCare AI! I can help you with skincare recommendations, answer questions about skin conditions, and suggest personalized routines based on your skin type. How can I assist you today?",
                  timestamp: new Date(),
                }])}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 
                      ${message.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-4' 
                        : message.role === 'system' 
                          ? 'bg-muted border border-border/50' 
                          : 'bg-card border border-border/50'
                      }`}
                  >
                    {message.role !== 'user' ? (
                      <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-0 prose-li:my-0">
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    {message.timestamp && (
                      <div className={`text-[10px] mt-1 text-right ${message.role === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 border-t bg-card">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about skincare routines, products, or concerns..."
                  className="pr-20 min-h-[60px] max-h-[120px] resize-none"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={isLoading || !input.trim()} 
                  className="absolute right-2 bottom-2"
                >
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex justify-between mt-2">
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    <Scan className="h-3 w-3 mr-1" />
                    Analyze Skin
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Upload Image
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground pr-2">Powered by AI</p>
              </div>
            </form>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:w-80 flex flex-col gap-4"
          >
            <Card className="p-4 border border-border/50">
              <h3 className="font-medium text-sm mb-2">Example Questions</h3>
              <div className="space-y-2">
                {[
                  "What's a good routine for my skin type?",
                  "How can I treat acne scars?",
                  "Recommend products for sensitive skin",
                  "What ingredients should I avoid?",
                ].map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-auto py-2"
                    onClick={() => setInput(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </Card>
            
            <RecommendedProducts products={recommendedProducts} />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SkinCareAI;
