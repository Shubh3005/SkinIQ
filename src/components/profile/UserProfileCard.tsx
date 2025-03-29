
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const UserProfileCard = () => {
  const { user, signOut } = useAuth();

  return (
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
  );
};
