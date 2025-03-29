
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  RefreshCw, 
  Send, 
  Sparkles, 
  User, 
  History, 
  Lightbulb, 
  Link2, 
  ShoppingBag,
  Scan 
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const skinTypes = ["normal", "dry", "oily", "combination", "sensitive"];
const skinConcerns = ["acne", "aging", "dryness", "redness", "hyperpigmentation", "sensitivity"];

const SkinCareAI = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [extractedProducts, setExtractedProducts] = useState([]);
  
  const [skinType, setSkinType] = useState('normal');
  const [concerns, setConcerns] = useState([]);
  const [includeActives, setIncludeActives] = useState(false);
  const [routineResponse, setRoutineResponse] = useState('');
  const [routineLoading, setRoutineLoading] = useState(false);
  const [routineProducts, setRoutineProducts] = useState([]);

  const toggleConcern = (concern) => {
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter(c => c !== concern));
    } else {
      setConcerns([...concerns, concern]);
    }
  };

  const extractProductsFromText = (text) => {
    // Simple regex to extract product names and URLs
    // Format assumed: "Product Name (http://example.com)" or similar patterns
    const productRegex = /([A-Za-z0-9\s&\-']+)\s*\(?(https?:\/\/[^\s)]+)?\)?/g;
    const amazonRegex = /https:\/\/(www\.)?amazon\.com\/[^\s]+/g;
    
    const products = [];
    const amazonLinks = text.match(amazonRegex) || [];
    
    let match;
    while ((match = productRegex.exec(text)) !== null) {
      const productName = match[1].trim();
      // Skip if product name is too short or appears to be part of a sentence
      if (productName.length < 4 || productName.toLowerCase().startsWith('http')) continue;
      
      let productLink = match[2] || null;
      // If no link was found directly with the product, check if there's an Amazon link nearby
      if (!productLink && amazonLinks.length > 0) {
        // Find the closest Amazon link (simple approach)
        const linkIndex = Math.floor(products.length % amazonLinks.length);
        productLink = amazonLinks[linkIndex];
      }
      
      // Avoid duplicates
      if (!products.some(p => p.product_name === productName)) {
        products.push({
          product_name: productName,
          product_link: productLink,
          product_description: null // We don't have descriptions in this simple extraction
        });
      }
    }
    
    return products;
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setChatLoading(true);
    try {
      // Call the Supabase function for AI response
      const { data, error } = await supabase.functions.invoke('skincare-ai', {
        body: {
          action: 'chat',
          message: chatMessage
        }
      });
      
      if (error) throw error;
      const cleanedResponse = cleanMarkdown(data.result);
      setChatResponse(cleanedResponse);
      
      // Extract potential product recommendations
      const products = extractProductsFromText(cleanedResponse);
      setExtractedProducts(products);
      
      // Save chat to history
      if (user) {
        await supabase.functions.invoke('skincare-history', {
          body: {
            action: 'save-chat',
            data: {
              message: chatMessage,
              response: cleanedResponse,
              products: products
            }
          }
        });
      }
      
      toast.success('Response received and saved to your history');
    } catch (error) {
      console.error('Error calling AI:', error);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateRoutine = async () => {
    setRoutineLoading(true);
    try {
      // Call the Supabase function for routine generation
      const { data, error } = await supabase.functions.invoke('skincare-ai', {
        body: {
          action: 'generate-routine',
          skin_type: skinType,
          concerns,
          include_actives: includeActives
        }
      });
      
      if (error) throw error;
      const cleanedResponse = cleanMarkdown(data.result);
      setRoutineResponse(cleanedResponse);
      
      // Extract potential product recommendations
      const products = extractProductsFromText(cleanedResponse);
      setRoutineProducts(products);
      
      // Save routine to history as a chat
      if (user) {
        await supabase.functions.invoke('skincare-history', {
          body: {
            action: 'save-chat',
            data: {
              message: `Generate a skincare routine for ${skinType} skin with concerns: ${concerns.join(', ')}${includeActives ? ' including active ingredients' : ''}`,
              response: cleanedResponse,
              products: products
            }
          }
        });
      }
      
      toast.success('Routine generated and saved to your history');
    } catch (error) {
      console.error('Error generating routine:', error);
      toast.error('Failed to generate routine. Please try again.');
    } finally {
      setRoutineLoading(false);
    }
  };

  const cleanMarkdown = (text) => {
    if (!text) return '';
    
    let cleaned = text.replace(/#+\s/g, '');
    cleaned = cleaned.replace(/\*\*/g, '');
    cleaned = cleaned.replace(/\*/g, '');
    cleaned = cleaned.replace(/\_\_/g, '');
    cleaned = cleaned.replace(/\_/g, '');
    cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
    
    return cleaned;
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
              <Scan className="h-4 w-4" />
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
            Your <span className="text-primary">SkinIQ</span> Assistant
          </h1>
          <p className="text-muted-foreground mt-2">
            Chat with our AI or generate personalized skincare routines
          </p>
        </motion.div>
        
        <Tabs defaultValue="chat" className="w-full max-w-3xl mx-auto">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat with AI
            </TabsTrigger>
            <TabsTrigger value="routine" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Routine
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary animate-pulse" />
                      Skincare Chat
                    </CardTitle>
                    <CardDescription>
                      Ask any skincare-related questions and get expert advice
                    </CardDescription>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => navigate('/profile')}
                        >
                          <History className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only">History</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        View chat history
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {chatResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-muted/70 backdrop-blur-sm p-6 rounded-lg mb-6 border border-primary/10 whitespace-pre-wrap shadow-md"
                  >
                    <div className="flex items-center gap-2 text-primary mb-2 font-medium">
                      <Sparkles className="h-4 w-4" />
                      AI Response
                    </div>
                    
                    {chatResponse.split('\n').map((paragraph, i) => (
                      paragraph ? (
                        <p key={i} className="mb-3 last:mb-0">
                          {paragraph}
                        </p>
                      ) : <br key={i} />
                    ))}
                    
                    {extractedProducts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-primary/10">
                        <div className="flex items-center gap-2 text-primary mb-2 font-medium">
                          <ShoppingBag className="h-4 w-4" />
                          Recommended Products
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {extractedProducts.map((product, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="h-6 w-6 rounded-full p-1">
                                {index + 1}
                              </Badge>
                              <span>{product.product_name}</span>
                              {product.product_link && (
                                <a 
                                  href={product.product_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  <Link2 className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                <form onSubmit={handleChatSubmit}>
                  <Textarea 
                    placeholder="e.g., How can I treat hormonal acne?" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="min-h-[120px] border-2 focus-visible:ring-primary/30 shadow-sm"
                    disabled={chatLoading}
                  />
                </form>
              </CardContent>
              <CardFooter className="border-t bg-muted/30">
                <Button 
                  onClick={handleChatSubmit} 
                  disabled={!chatMessage.trim() || chatLoading}
                  className="w-full relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
                  {chatLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      Send Message
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="routine">
            <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Routine Generator
                    </CardTitle>
                    <CardDescription>
                      Create a customized skincare routine based on your needs
                    </CardDescription>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => navigate('/profile')}
                        >
                          <History className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only">History</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        View routine history
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="skin-type">Skin Type</Label>
                  <Select value={skinType} onValueChange={setSkinType}>
                    <SelectTrigger id="skin-type" className="border-2 focus:ring-primary/30">
                      <SelectValue placeholder="Select your skin type" />
                    </SelectTrigger>
                    <SelectContent>
                      {skinTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Skin Concerns (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {skinConcerns.map(concern => (
                      <div key={concern} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`concern-${concern}`} 
                          checked={concerns.includes(concern)}
                          onCheckedChange={() => toggleConcern(concern)}
                          className="border-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <label
                          htmlFor={`concern-${concern}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {concern.charAt(0).toUpperCase() + concern.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-actives" 
                    checked={includeActives}
                    onCheckedChange={(checked) => setIncludeActives(checked === true)}
                    className="border-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <label
                    htmlFor="include-actives"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include active ingredients (retinoids, acids, etc.)
                  </label>
                </div>
                
                {routineResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-muted/70 backdrop-blur-sm p-6 rounded-lg mt-4 border border-primary/10 whitespace-pre-wrap shadow-md"
                  >
                    <div className="flex items-center gap-2 text-primary mb-2 font-medium">
                      <Sparkles className="h-4 w-4" />
                      Your Personalized Routine
                    </div>
                    
                    {routineResponse.split('\n').map((paragraph, i) => (
                      paragraph ? (
                        <p key={i} className="mb-3 last:mb-0">
                          {paragraph}
                        </p>
                      ) : <br key={i} />
                    ))}
                    
                    {routineProducts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-primary/10">
                        <div className="flex items-center gap-2 text-primary mb-2 font-medium">
                          <ShoppingBag className="h-4 w-4" />
                          Recommended Products
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {routineProducts.map((product, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="h-6 w-6 rounded-full p-1">
                                {index + 1}
                              </Badge>
                              <span>{product.product_name}</span>
                              {product.product_link && (
                                <a 
                                  href={product.product_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  <Link2 className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/30">
                <Button 
                  onClick={handleGenerateRoutine} 
                  disabled={routineLoading}
                  className="w-full relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
                  {routineLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      Generate Routine
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SkinCareAI;
