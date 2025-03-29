import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Auth from './pages/Auth';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import SkinCareAI from './pages/SkinCareAI';

const App = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Index} />
                <Route path="/auth" component={Auth} />
                <Route path="/skincare-ai" component={SkinCareAI} />
                <Route component={NotFound} />
            </Switch>
        </Router>
    );
};

export default App;