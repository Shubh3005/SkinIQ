
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './pages/Auth';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import SkinCareAI from './pages/SkinCareAI';
import SkinAnalyzer from './pages/SkinAnalyzer';
import Profile from './pages/Profile';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/skincare-ai" element={<SkinCareAI />} />
                <Route path="/skin-analyzer" element={<SkinAnalyzer />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default App;
