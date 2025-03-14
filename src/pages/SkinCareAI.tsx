
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, RefreshCw, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

const skinTypes = ["normal", "dry", "oily", "combination", "sensitive"];
const skinConcerns = ["acne", "aging", "dryness", "redness", "hyperpigmentation", "sensitivity"];

const SkinCareAI = () => {
  const { user } = useAuth();
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  const [skinType, setSkinType] = useState('normal');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [includeActives, setIncludeActives] = useState(false);
  const [routineResponse, setRoutineResponse] = useState('');
  const [routineLoading, setRoutineLoading] = useState(false);

  // Toggle skin concern selection
  const toggleConcern = (concern: string) => {
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter(c => c !== concern));
    } else {
      setConcerns([...concerns, concern]);
    }
  };

  // Handle chat submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setChatLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('skincare-ai', {
        body: {
          action: 'chat',
          message: chatMessage
        }
      });
      
      if (error) throw error;
      setChatResponse(data.result);
    } catch (error: any) {
      console.error('Error calling AI:', error);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  // Handle routine generation
  const handleGenerateRoutine = async () => {
    setRoutineLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('skincare-ai', {
        body: {
          action: 'generate-routine',
          skin_type: skinType,
          concerns,
          include_actives: includeActives
        }
      });
      
      if (error) throw error;
      setRoutineResponse(data.result);
    } catch (error: any) {
      console.error('Error generating routine:', error);
      toast.error('Failed to generate routine. Please try again.');
    } finally {
      setRoutineLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <AnimatedBackground />
      
      <div className="w-full max-w-screen-xl px-6 py-8 flex-1 flex flex-col">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="md" />
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
          
          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Skincare Chat</CardTitle>
                <CardDescription>
                  Ask any skincare-related questions and get expert advice
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chatResponse && (
                  <div className="bg-muted p-4 rounded-lg mb-4 whitespace-pre-wrap">
                    {chatResponse}
                  </div>
                )}
                <form onSubmit={handleChatSubmit}>
                  <Textarea 
                    placeholder="e.g., How can I treat hormonal acne?" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="min-h-[120px]"
                    disabled={chatLoading}
                  />
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleChatSubmit} 
                  disabled={!chatMessage.trim() || chatLoading}
                  className="w-full"
                >
                  {chatLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Routine Generator Tab */}
          <TabsContent value="routine">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Routine Generator</CardTitle>
                <CardDescription>
                  Create a customized skincare routine based on your needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Skin Type */}
                <div className="space-y-2">
                  <Label htmlFor="skin-type">Skin Type</Label>
                  <Select value={skinType} onValueChange={setSkinType}>
                    <SelectTrigger id="skin-type">
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
                
                {/* Skin Concerns */}
                <div className="space-y-2">
                  <Label>Skin Concerns (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {skinConcerns.map(concern => (
                      <div key={concern} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`concern-${concern}`} 
                          checked={concerns.includes(concern)}
                          onCheckedChange={() => toggleConcern(concern)}
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
                
                {/* Include Actives */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-actives" 
                    checked={includeActives}
                    onCheckedChange={(checked) => setIncludeActives(checked === true)}
                  />
                  <label
                    htmlFor="include-actives"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include active ingredients (retinoids, acids, etc.)
                  </label>
                </div>
                
                {/* Generated Routine */}
                {routineResponse && (
                  <div className="bg-muted p-4 rounded-lg mt-4 whitespace-pre-wrap">
                    {routineResponse}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleGenerateRoutine} 
                  disabled={routineLoading}
                  className="w-full"
                >
                  {routineLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
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
