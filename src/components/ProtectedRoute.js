// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireSubscription }) => {
    // Retrieve user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));

    // Check if user is not logged in
    if (!userData) {
        // Redirect to login if user data is not present
        return <Navigate to="/login" />;
    }

    // If subscription is required and the user is not a subscriber, redirect to subscribe page
    if (requireSubscription && userData.subscriptionStatus !== 'Active') {
        return <Navigate to="/subscribe" />;
    }


    // If everything is okay, render the children components
    return children;
};

export default ProtectedRoute;