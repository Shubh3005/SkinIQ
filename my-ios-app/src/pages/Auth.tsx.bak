import React, { useState } from 'react';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement login logic here
        if (email === '' || password === '') {
            setError('Email and password are required');
            return;
        }
        // Call authentication API
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement registration logic here
        if (email === '' || password === '') {
            setError('Email and password are required');
            return;
        }
        // Call registration API
    };

    return (
        <div>
            <h2>Authentication</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <button onClick={handleRegister}>Register</button>
        </div>
    );
};

export default Auth;