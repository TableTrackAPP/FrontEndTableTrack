import { BrowserRouter as Router, Routes as SwitchRoutes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ValidateResetCode from '../pages/ValidateResetCode';
import ResetPassword from '../pages/ResetPassword';
import Establishments from '../pages/Establishments';
import Products from '../pages/Products';
import Orders from '../pages/Orders';
import Catalog from '../pages/Catalog';
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
                <Route path="/Products" element={<Products />} />
                <Route path="/Orders" element={<Orders />} />
                <Route path="/Catalog/:establishmentID" element={<Catalog />} /> {/* Ajuste para receber establishmentID como parâmetro */}

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute requireSubscription={false}>
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
