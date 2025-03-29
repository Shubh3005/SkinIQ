
import { motion } from 'framer-motion';
import { Scan, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';

export const ProfileHeader = () => {
  const navigate = useNavigate();

  return (
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
  );
};
