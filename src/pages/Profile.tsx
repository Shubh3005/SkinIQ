
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Calendar, Shield, MessageCircle, Scan, Link2, ShoppingBag, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load profile data');
        } else if (data) {
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    const fetchHistory = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch chat history
        const { data: chatData, error: chatError } = await supabase.functions.invoke('skincare-history', {
          body: {
            action: 'get-history',
            data: { type: 'chat' }
          }
        });
        
        if (chatError) throw chatError;
        if (chatData.success) {
          setChatHistory(chatData.chats || []);
        }
        
        // Fetch scan history
        const { data: scanData, error: scanError } = await supabase.functions.invoke('skincare-history', {
          body: {
            action: 'get-history',
            data: { type: 'scan' }
          }
        });
        
        if (scanError) throw scanError;
        if (scanData.success) {
          setScanHistory(scanData.scans || []);
        }
        
        // Generate calendar events from both chat and scan history
        const allEvents = [
          ...(chatData.chats || []).map(chat => ({
            date: parseISO(chat.created_at),
            type: 'chat',
            id: chat.id
          })),
          ...(scanData.scans || []).map(scan => ({
            date: parseISO(scan.created_at),
            type: 'scan',
            id: scan.id
          }))
        ];
        
        setCalendarEvents(allEvents);
        
      } catch (error) {
        console.error('Error fetching history:', error);
        toast.error('Failed to load history data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
    fetchHistory();
  }, [user]);

  const getEventsForDate = (date) => {
    return calendarEvents.filter(event => 
      date.getDate() === event.date.getDate() &&
      date.getMonth() === event.date.getMonth() &&
      date.getFullYear() === event.date.getFullYear()
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
          
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Back
          </Button>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal SkinIQ information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {user?.email ? getInitials(user.email.split('@')[0]) : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl font-semibold">
                  {profileData?.full_name || user?.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Skin Type</h3>
                  <p className="font-medium">{profileData?.skin_type || 'Not specified'}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Activity</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {chatHistory.length} Chats
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Scan className="h-3 w-3" />
                      {scanHistory.length} Scans
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Middle Column - Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Activity Calendar</CardTitle>
              <CardDescription>Your SkinIQ usage history</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiersStyles={{
                  selected: { backgroundColor: 'hsl(var(--primary))' }
                }}
                modifiers={{
                  hasEvents: (date) => getEventsForDate(date).length > 0,
                  hasChatEvents: (date) => getEventsForDate(date).some(e => e.type === 'chat'),
                  hasScanEvents: (date) => getEventsForDate(date).some(e => e.type === 'scan')
                }}
                styles={{
                  hasEvents: { 
                    textDecoration: 'underline', 
                    textDecorationColor: 'hsl(var(--primary))',
                    fontWeight: 'bold'
                  }
                }}
              />
              
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-medium">
                  Events on {format(selectedDate, 'MMM dd, yyyy')}
                </h3>
                
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity on this day</p>
                ) : (
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map((event, index) => (
                      <div key={event.id} className="flex items-center gap-2 text-sm">
                        {event.type === 'chat' ? (
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Scan className="h-4 w-4 text-green-500" />
                        )}
                        <span>
                          {event.type === 'chat' ? 'AI Chat' : 'Skin Analysis'} at {format(event.date, 'h:mm a')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Right Column - History Tabs */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>Your SkinIQ chats and analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chats">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="chats" className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    Chats
                  </TabsTrigger>
                  <TabsTrigger value="scans" className="flex items-center gap-1">
                    <Scan className="h-4 w-4" />
                    Scans
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chats">
                  <ScrollArea className="h-[300px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        Loading chat history...
                      </div>
                    ) : chatHistory.length === 0 ? (
                      <div className="text-center text-muted-foreground p-4">
                        No chat history found
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {chatHistory.map((chat) => (
                          <div key={chat.id} className="border rounded-lg p-3 hover:bg-accent/50 cursor-pointer" onClick={() => navigate('/skincare-ai')}>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(parseISO(chat.created_at), 'MMM dd, yyyy h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm font-medium line-clamp-1">{chat.message}</p>
                            {chat.recommended_products && chat.recommended_products.length > 0 && (
                              <Badge variant="outline" className="mt-2 text-xs flex items-center gap-1">
                                <ShoppingBag className="h-3 w-3" />
                                {chat.recommended_products.length} product{chat.recommended_products.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="scans">
                  <ScrollArea className="h-[300px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        Loading scan history...
                      </div>
                    ) : scanHistory.length === 0 ? (
                      <div className="text-center text-muted-foreground p-4">
                        No scan history found
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {scanHistory.map((scan) => (
                          <div key={scan.id} className="border rounded-lg p-3 hover:bg-accent/50 cursor-pointer" onClick={() => navigate('/skin-analyzer')}>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(parseISO(scan.created_at), 'MMM dd, yyyy h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm font-medium">Skin Type: {scan.skin_type || 'Unknown'}</p>
                            {scan.skin_issues && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{scan.skin_issues}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
