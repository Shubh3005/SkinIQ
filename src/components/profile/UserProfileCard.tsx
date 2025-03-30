
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Sliders } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from '@/components/ProfileForm';
import { SkinProfileTab } from './SkinProfileTab';

export const UserProfileCard = () => {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10 h-full">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            User Profile
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="personal" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Personal</span>
              </TabsTrigger>
              <TabsTrigger value="skin" className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                <span>Skin Profile</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <ProfileForm />
            </TabsContent>
            
            <TabsContent value="skin">
              <SkinProfileTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};
