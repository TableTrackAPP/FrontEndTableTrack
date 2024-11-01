import { BrowserRouter as Router, Routes as SwitchRoutes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ValidateResetCode from '../pages/ValidateResetCode';
import ResetPassword from '../pages/ResetPassword';
import Establishments from '../pages/Establishments';
import Orders from '../pages/Orders';

import Dashboard from '../pages/Dashboard';
import Subscribe from '../pages/Subscribe'; // Importing the Subscribe page
import ProtectedRoute from '../components/ProtectedRoute'; // Importing the updated ProtectedRoute

function AppRoutes() {
    return (
        <Router>
            <SwitchRoutes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/validate-reset-code" element={<ValidateResetCode />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/Establishments" element={<Establishments />} />
                <Route path="/Orders" element={<Orders />} />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute requireSubscription={true}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/subscribe"
                    element={
                        <ProtectedRoute requireSubscription={false}>
                            <Subscribe />
                        </ProtectedRoute>
                    }
                />
            </SwitchRoutes>
        </Router>
    );
}

export default AppRoutes;