
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
    const { session } = useAuth();

    return (
        <div className="min-h-screen p-8 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-6">Welcome to SkinIQ App</h1>
            <p className="text-lg mb-8 text-center max-w-lg">
                Advanced skincare analysis and personalized recommendations powered by AI
            </p>
            
            <div className="flex flex-col md:flex-row gap-4">
                {!session ? (
                    <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link to="/auth">Login / Register</Link>
                    </Button>
                ) : (
                    <>
                        <Button asChild className="bg-primary hover:bg-primary/90">
                            <Link to="/skincare-ai">Skincare AI Assistant</Link>
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                            <Link to="/skin-analysis">Analyze My Skin</Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Index;
