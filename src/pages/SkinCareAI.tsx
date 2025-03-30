
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCheck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { parseProductsFromText } from '@/utils/productParser';
import AnimatedBackground from '@/components/AnimatedBackground';
import { RecommendedProducts } from '@/components/skincare/RecommendedProducts';
import { useNavigate } from 'react-router-dom';

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
      content: "Hello! I'm your personal skincare assistant. I can help you with personalized skincare routines, product recommendations, and advice based on your skin type and concerns. What can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [skinType, setSkinType] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");

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
      console.log("Parsed products:", parsedProducts);
      if (parsedProducts.length > 0) {
        setRecommendedProducts(parsedProducts);
        
        // Save products to database
        if (user) {
          try {
            const { data: chatData } = await supabase
              .from('chat_history')
              .select('id')
              .eq('user_id', user.id)
              .eq('message', input)
              .order('created_at', { ascending: false })
              .limit(1);
              
            if (chatData && chatData.length > 0) {
              const chatId = chatData[0].id;
              
              // Save recommended products
              for (const product of parsedProducts) {
                await supabase
                  .from('recommended_products')
                  .insert({
                    user_id: user.id,
                    chat_id: chatId,
                    product_name: product.product_name,
                    product_description: product.product_description || '',
                    product_link: product.product_link || ''
                  });
              }
            }
          } catch (error) {
            console.error('Error saving recommended products:', error);
          }
        }
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

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const getRoutineSuggestions = () => {
    const prompt = `Based on my ${skinType || ''} skin type, can you recommend a complete morning and evening skincare routine with specific product recommendations?`;
    setInput(prompt);
    setActiveTab("chat");
  };

  return (
    <div className="min-h-screen w-full pb-10 relative">
      <AnimatedBackground />
      
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="text-amber-700">SkinCare</span>{" "}
            <span className="text-slate-800">AI Assistant</span>
          </h1>
          <p className="text-slate-600 mt-2">
            Get personalized skincare advice and product recommendations
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3">
            <Card className="overflow-hidden border-amber-100 shadow-md">
              <div className="p-4 border-b border-amber-100 bg-amber-50/50">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-amber-700 mr-2" />
                  <h2 className="text-lg font-semibold text-slate-800">SkinCare AI Chat</h2>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Ask questions about skincare routines and get personalized advice
                </p>
              </div>
              
              <div className="bg-white h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`${
                      message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'
                    }`}
                  >
                    <div
                      className={`rounded-2xl p-3 ${
                        message.role === 'user'
                          ? 'bg-amber-100 text-slate-800 ml-auto'
                          : message.role === 'system'
                            ? 'bg-amber-50 border border-amber-100 text-slate-700'
                            : 'bg-white border border-amber-100 text-slate-800'
                      }`}
                    >
                      {message.role !== 'user' ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="my-1">{children}</p>,
                            h1: ({ children }) => <h1 className="text-xl font-bold my-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-bold my-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-md font-bold my-2">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc pl-5 my-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 my-1">{children}</ol>,
                            li: ({ children }) => <li className="my-0.5">{children}</li>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      {message.timestamp && (
                        <div className="text-[10px] mt-1 text-right text-slate-500">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 border-t border-amber-100">
                <div className="relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about skincare routines, products, or specific concerns..."
                    className="min-h-[60px] pr-16 resize-none border-amber-200 focus-visible:ring-amber-500"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={isLoading || !input.trim()} 
                    className="absolute right-2 bottom-2 bg-amber-600 hover:bg-amber-700"
                  >
                    {isLoading ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-amber-200 text-amber-800"
                    onClick={() => handleQuickPrompt("Routine for my skin type")}
                  >
                    Routine for my skin type
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-amber-200 text-amber-800"
                    onClick={() => handleQuickPrompt("Product recommendations")}
                  >
                    Product recommendations
                  </Button>
                </div>
              </form>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="routine" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-amber-50 border border-amber-100">
                <TabsTrigger 
                  value="routine" 
                  className="data-[state=active]:bg-white data-[state=active]:text-amber-800"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Personalized Routine
                </TabsTrigger>
                <TabsTrigger 
                  value="products" 
                  className="data-[state=active]:bg-white data-[state=active]:text-amber-800"
                >
                  Products
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="routine" className="mt-4">
                <Card className="border-amber-100 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <CheckCheck className="h-5 w-5 text-amber-600 mr-2" />
                      <h3 className="text-lg font-semibold text-slate-800">Personalized Routine</h3>
                    </div>
                    <p className="text-slate-600 mb-4">
                      Customized skincare steps based on your profile and concerns
                    </p>
                    
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-slate-700 mb-6">
                        Ask the AI about a skincare routine for your 
                        {skinType ? ` ${skinType}` : ''} skin type to see personalized steps.
                      </p>
                      <Button 
                        onClick={getRoutineSuggestions}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Get Routine Suggestions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="products" className="mt-4">
                <RecommendedProducts 
                  products={recommendedProducts} 
                  title="Recommended Products"
                  description="Products that may help with your skin concerns"
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
