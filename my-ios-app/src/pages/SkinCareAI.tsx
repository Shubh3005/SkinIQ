
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MessageSquare, Send, Loader2, Bot, X, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SkinCareAI: React.FC = () => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
    const { user } = useAuth();
    const navigate = useNavigate();
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Scroll to bottom when chat history changes
    React.useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!message.trim()) return;
        
        // Add user message to chat
        const userMessage = message.trim();
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setMessage('');
        setIsLoading(true);
        
        try {
            // Call the Supabase Edge Function for AI response
            const { data, error } = await supabase.functions.invoke('skincare-ai', {
                body: { 
                    message: userMessage,
                    userSkinType: user?.skin_type || null,
                    userSkinTone: user?.skin_tone || null,
                    history: chatHistory
                }
            });
            
            if (error) throw error;
            
            // Add AI response to chat
            setChatHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
            
            // Save the conversation if user is logged in
            if (user) {
                try {
                    await supabase.functions.invoke('skincare-history', {
                        body: {
                            action: 'save-chat',
                            data: {
                                message: userMessage,
                                response: data.message,
                                // Add any extracted product recommendations if needed
                                products: []
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error saving chat history:', error);
                }
            }
        } catch (error) {
            console.error('Error getting AI response:', error);
            toast.error('Failed to get a response. Please try again.');
            // Remove the pending message
            setChatHistory(prev => prev.slice(0, prev.length - 1));
        } finally {
            setIsLoading(false);
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
                            <Scan className="h-4 w-4" />
                            Skin Analyzer
                        </Button>
                    </div>
                </motion.div>

                <Card className="flex-1 overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/10">
                    <CardContent className="p-0 flex flex-col h-full">
                        {/* Chat history */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {chatHistory.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                    <Bot className="h-16 w-16 text-primary mb-4" />
                                    <h2 className="text-2xl font-semibold mb-2">Skin Care AI Assistant</h2>
                                    <p className="text-muted-foreground max-w-md">
                                        Ask me anything about skincare routines, product recommendations, or specific skin concerns.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-6 w-full max-w-lg">
                                        {[
                                            "What's a good routine for dry skin?",
                                            "How do I treat acne?",
                                            "What ingredients should I look for in a moisturizer?",
                                            "How often should I exfoliate?"
                                        ].map((suggestion, i) => (
                                            <Button 
                                                key={i} 
                                                variant="outline" 
                                                className="justify-start"
                                                onClick={() => {
                                                    setMessage(suggestion);
                                                }}
                                            >
                                                {suggestion}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {chatHistory.map((msg, index) => (
                                        <div 
                                            key={index} 
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div 
                                                className={`max-w-[80%] p-4 rounded-lg ${
                                                    msg.role === 'user' 
                                                    ? 'bg-primary text-primary-foreground' 
                                                    : 'bg-muted'
                                                }`}
                                            >
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                            )}
                        </div>
                        
                        {/* Input area */}
                        <div className="border-t p-4">
                            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                                <div className="flex-1">
                                    <Textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your skincare question here..."
                                        className="min-h-[80px] resize-none"
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    size="icon" 
                                    className="h-10 w-10"
                                    disabled={isLoading || !message.trim()}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SkinCareAI;
