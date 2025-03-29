
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from "@/components/ui/calendar"
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import { 
  ArrowLeft, 
  ArrowRight, 
  CalendarDays, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  ClipboardList, 
  Copy, 
  CopyCheck, 
  CreditCard, 
  Download, 
  Edit, 
  ExternalLink, 
  File, 
  FileText, 
  Folder, 
  Key, 
  LayoutDashboard, 
  ListChecks, 
  Loader2, 
  Lock, 
  LogOut, 
  Mail, 
  MessageSquare, 
  Plus, 
  PlusCircle, 
  RotateCw, 
  Scan, 
  Settings, 
  Share2, 
  Shield, 
  ShoppingBag, 
  Trash, 
  User, 
  UserPlus, 
  X 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import ProfileForm from '@/components/ProfileForm';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scanHistory, setScanHistory] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setLoadingHistory(true);
      try {
        const { data: scans, error: scanError } = await supabase
          .from('skin_scan_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (scanError) {
          console.error("Error fetching scan history:", scanError);
          toast({
            title: "Error",
            description: "Failed to load scan history.",
            variant: "destructive",
          });
        } else {
          setScanHistory(scans || []);
        }

        const { data: chats, error: chatError } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (chatError) {
          console.error("Error fetching chat history:", chatError);
          toast({
            title: "Error",
            description: "Failed to load chat history.",
            variant: "destructive",
          });
        } else {
          setChatHistory(chats || []);
        }
      } catch (error) {
        console.error("Unexpected error fetching history:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading history.",
          variant: "destructive",
        });
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [user, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const hasEventsForDate = (date: Date) => {
    if (!scanHistory) return false;
    return scanHistory.some(scan => {
      const scanDate = new Date(scan.created_at);
      return scanDate.toDateString() === date.toDateString();
    });
  };

  const getScansForDate = (date: Date) => {
    return scanHistory.filter(scan => {
      const scanDate = new Date(scan.created_at);
      return scanDate.toDateString() === date.toDateString();
    });
  };

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, 'PPP') : 'No date selected';
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
              onClick={() => navigate('/skin-analyzer')}
            >
              <Scan className="h-4 w-4" />
              Skin Analyzer
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate('/skincare-ai')}
            >
              <MessageSquare className="h-4 w-4" />
              SkinCare AI
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
            Your <span className="text-primary">Profile</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and view your skin history
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
          {/* Left column - User Profile */}
          <div className="flex flex-col">
            <Card className="w-full h-full flex flex-col border-2 border-primary/20 shadow-lg shadow-primary/10 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  User Profile
                </CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-12 flex flex-col items-center justify-center relative">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={`https://avatars.dicebear.com/api/open-peeps/${user?.email}.svg`} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{user?.email}</h2>
                  <p className="text-muted-foreground text-sm">
                    {user?.id}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30">
                <Button
                  onClick={() => signOut()}
                  className="w-full relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
                  <LogOut className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right column - Skin History */}
          <div className="flex flex-col">
            <Card className="w-full h-full border-2 border-primary/20 shadow-lg shadow-primary/10">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      Skin History
                    </CardTitle>
                    <CardDescription>
                      View your scan and chat history
                    </CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {formatDate(selectedDate)}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Select a date to view your skin history
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    classNames={{
                      day: cn(
                        "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                        {
                          "bg-primary/20 text-primary-foreground font-bold": (day) => 
                            hasEventsForDate(day)
                        }
                      )
                    }}
                  />
                </div>

                {loadingHistory ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading history...
                  </div>
                ) : (
                  <>
                    {getScansForDate(selectedDate || new Date()).length > 0 ? (
                      <>
                        <h3 className="text-xl font-semibold mb-2">Scans for {formatDate(selectedDate)}</h3>
                        <div className="space-y-4">
                          {getScansForDate(selectedDate || new Date()).map((scan, index) => (
                            <div key={scan.id} className="bg-muted/70 backdrop-blur-sm p-4 rounded-lg border border-primary/10 shadow-md">
                              <h4 className="font-medium">Scan #{index + 1}</h4>
                              <p className="text-sm text-muted-foreground">Skin Type: {scan.skin_type}</p>
                              <p className="text-sm text-muted-foreground">Skin Issues: {scan.skin_issues}</p>
                              <p className="text-sm text-muted-foreground">Sun Damage: {scan.sun_damage}</p>
                              <p className="text-sm text-muted-foreground">Unique Feature: {scan.unique_feature}</p>
                              <p className="text-sm text-muted-foreground">Skin Tone: {scan.skin_tone}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        No scans found for this date.
                      </div>
                    )}

                    <Separator className="my-4" />

                    <h3 className="text-xl font-semibold mb-2">Recent Chats</h3>
                    {chatHistory.length > 0 ? (
                      <div className="space-y-4">
                        {chatHistory.slice(0, 3).map((chat, index) => (
                          <div key={chat.id} className="bg-muted/70 backdrop-blur-sm p-4 rounded-lg border border-primary/10 shadow-md">
                            <h4 className="font-medium">Chat #{index + 1}</h4>
                            <p className="text-sm text-muted-foreground">Message: {chat.message}</p>
                            <p className="text-sm text-muted-foreground">Response: {chat.response}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        No chat history found.
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-8">
          <div>
            AI-Powered Skin Analysis
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
