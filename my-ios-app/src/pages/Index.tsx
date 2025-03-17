import React from 'react';

const Index: React.FC = () => {
    return (
        <div>
            <h1>Welcome to My iOS App</h1>
            <p>This is the main landing page of the application.</p>
            <nav>
                <ul>
                    <li><a href="/auth">Login</a></li>
                    <li><a href="/skincare-ai">Skin Care AI</a></li>
                </ul>
            </nav>
        </div>
    );
};

export default Index;