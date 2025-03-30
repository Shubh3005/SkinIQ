
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserProfileCard } from '@/components/profile/UserProfileCard';
import { HistoryCard } from '@/components/profile/HistoryCard';
import { HealthcareInfoCard } from '@/components/profile/HealthcareInfoCard';

const Profile = () => {
  const { user } = useAuth();
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

  return (
    <div className="min-h-screen w-full flex flex-col">
      <AnimatedBackground />

      <div className="w-full max-w-screen-xl px-6 py-8 mx-auto flex-1 flex flex-col">
        <ProfileHeader />

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
          <div className="flex flex-col gap-8">
            <UserProfileCard />
            <HealthcareInfoCard />
          </div>
          <div className="flex flex-col">
            <HistoryCard 
              scanHistory={scanHistory}
              chatHistory={chatHistory}
              loadingHistory={loadingHistory}
            />
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
