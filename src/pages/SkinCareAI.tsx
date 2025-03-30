
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, User, Search, Check, RefreshCw, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { parseProductsFromText } from '@/utils/productParser';
import { RecommendedProducts } from '@/components/skincare/RecommendedProducts';

interface ChatMessage {
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

interface RoutineStep {
  step: string;
  description: string;
  time?: 'morning' | 'evening' | 'both';
}

const SkinCareAI = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [personalized, setPersonalized] = useState<RoutineStep[]>([]);
  const [products, setProducts] = useState([]);
  const [skinProfile, setSkinProfile] = useState<{type: string, tone: string} | null>(null);
  
  // Initial welcome message
  useEffect(() => {
    setChatHistory([
      {
        sender: 'ai',
        message: 'Hello! I\'m your personal skincare assistant. I can help you with personalized skincare routines, product recommendations, and advice based on your skin type and concerns. What can I help you with today?',
        timestamp: new Date()
      }
    ]);
    
    // Fetch user's skin profile
    const fetchSkinProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('skin_type, skin_tone')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching skin profile:', error);
        } else if (data) {
          setSkinProfile({
            type: data.skin_type || '',
            tone: data.skin_tone || ''
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchSkinProfile();
  }, [user]);
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      sender: 'user',
      message: message.trim(),
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Call to Supabase Edge Function - fixed to pass correct parameters
      const { data, error } = await supabase.functions.invoke('skincare-ai', {
        body: {
          message: userMessage.message,
          userSkinType: skinProfile?.type || '',
          userSkinTone: skinProfile?.tone || '',
          history: chatHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.message
          }))
        }
      });
      
      if (error) {
        console.error('Error from skincare-ai function:', error);
        toast.error('Failed to get a response');
        return;
      }
      
      const aiResponse: ChatMessage = {
        sender: 'ai',
        message: data.message || 'Sorry, I couldn\'t process your request',
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, aiResponse]);
      
      // Parse and store recommended products
      const parsedProducts = parseProductsFromText(aiResponse.message);
      if (parsedProducts.length > 0) {
        setProducts(parsedProducts);
        
        // Save recommended products to database
        if (user) {
          try {
            await supabase.from('recommended_products').insert(
              parsedProducts.map(product => ({
                user_id: user.id,
                product_name: product.product_name,
                product_description: product.product_description || null,
                product_link: product.product_link || null
              }))
            );
          } catch (err) {
            console.error('Error saving products:', err);
          }
        }
      }
      
      // Try to extract routine steps
      if (aiResponse.message.toLowerCase().includes('routine') || 
          aiResponse.message.toLowerCase().includes('steps') ||
          message.toLowerCase().includes('routine')) {
        const steps = extractRoutineSteps(aiResponse.message);
        if (steps.length > 0) {
          setPersonalized(steps);
        }
      }
      
      // Store chat history in database
      if (user) {
        try {
          await supabase.from('chat_history').insert({
            user_id: user.id,
            message: userMessage.message,
            response: aiResponse.message
          });
        } catch (err) {
          console.error('Error storing chat history:', err);
        }
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };
  
  const extractRoutineSteps = (text: string): RoutineStep[] => {
    try {
      const steps: RoutineStep[] = [];
      const lines = text.split('\n');
      
      let currentSection: 'morning' | 'evening' | 'both' = 'both';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.toLowerCase().includes('morning routine') || 
            trimmedLine.toLowerCase().includes('am routine')) {
          currentSection = 'morning';
          continue;
        }
        
        if (trimmedLine.toLowerCase().includes('evening routine') || 
            trimmedLine.toLowerCase().includes('night routine') || 
            trimmedLine.toLowerCase().includes('pm routine')) {
          currentSection = 'evening';
          continue;
        }
        
        // Look for numbered or bulleted step
        const stepMatch = trimmedLine.match(/^(\d+\.|[\*\-•])\s*([^:]+)(?::\s*(.+))?$/);
        
        if (stepMatch) {
          const step = stepMatch[2].trim();
          const description = stepMatch[3] ? stepMatch[3].trim() : '';
          
          steps.push({
            step,
            description,
            time: currentSection
          });
        }
      }
      
      return steps;
    } catch (error) {
      console.error('Error extracting routine steps:', error);
      return [];
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <AnimatedBackground />
      
      <div className="w-full max-w-screen-xl px-6 py-8 mx-auto flex-1 flex flex-col">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="md" />
          
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
              <Search className="h-4 w-4" />
              Skin Analyzer
            </Button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold">
            <span className="text-primary">SkinCare</span> AI Assistant
          </h1>
          <p className="text-muted-foreground mt-2">
            Get personalized skincare advice and product recommendations
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-screen-xl w-full flex-1">
          {/* First column (chat) - takes 3/5 of the space */}
          <div className="md:col-span-3 flex flex-col">
            <Card className="flex-1 border-2 border-primary/20 shadow-lg shadow-primary/10 flex flex-col h-[600px]">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  SkinCare AI Chat
                </CardTitle>
                <CardDescription>
                  Ask questions about skincare routines and get personalized advice
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">{msg.message}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
                            <span className="text-xs">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask about skincare routines, products, or specific concerns..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[60px]"
                      disabled={isLoading}
                    />
                    <Button
                      className="h-full aspect-square"
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isLoading}
                    >
                      {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() => setMessage("What's a good routine for my skin type?")}
                      disabled={isLoading}
                    >
                      Routine for my skin type
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() => setMessage("Recommend products for dry sensitive skin")}
                      disabled={isLoading}
                    >
                      Product recommendations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Second column (results) - takes 2/5 of the space */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <Tabs defaultValue="routine" className="flex-1">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="routine" className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Personalized Routine</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Products</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="routine" className="mt-4 h-[550px]">
                <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10 h-full">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      Personalized Routine
                    </CardTitle>
                    <CardDescription>
                      Customized skincare steps based on your profile and concerns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ScrollArea className="h-[400px] pr-4">
                      {personalized.length > 0 ? (
                        <div className="space-y-6">
                          {['morning', 'evening', 'both'].map(time => {
                            const timeSteps = personalized.filter(step => 
                              step.time === time || (time === 'both' && !step.time)
                            );
                            
                            if (timeSteps.length === 0) return null;
                            
                            return (
                              <div key={time} className="space-y-4">
                                <h3 className="font-semibold text-primary capitalize">
                                  {time === 'both' ? 'Daily' : `${time.charAt(0).toUpperCase() + time.slice(1)}`} Routine
                                </h3>
                                <div className="space-y-3">
                                  {timeSteps.map((step, index) => (
                                    <div 
                                      key={index} 
                                      className="p-3 rounded-lg border border-primary/10 bg-muted/50"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="bg-primary/20 text-primary h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium">
                                          {index + 1}
                                        </div>
                                        <h4 className="font-medium">{step.step}</h4>
                                      </div>
                                      {step.description && (
                                        <p className="mt-2 text-sm text-muted-foreground pl-8">
                                          {step.description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                          <p className="text-muted-foreground mb-2">
                            Ask the AI about a skincare routine for your skin type to see personalized steps.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMessage("Can you suggest a simple skincare routine for me?")}
                            disabled={isLoading}
                          >
                            Get Routine Suggestions
                          </Button>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="products" className="mt-4 h-[550px]">
                <RecommendedProducts 
                  products={products}
                  title="Recommended Products"
                  description="Products tailored to your skin needs"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinCareAI;
