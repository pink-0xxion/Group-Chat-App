import React from 'react';
import App from '../App.jsx'
import { Routes, Route } from 'react-router';
import ChatPage from '../components/ChatPage.jsx';

const AppRoutes = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/chat" element={< ChatPage/>} />
                <Route path="/about" element={<h1>This is about page</h1>} />
                <Route path="*" element={<h1>404 Page Not Found</h1>} />
            </Routes>
        </div>
        );
}

export default AppRoutes;