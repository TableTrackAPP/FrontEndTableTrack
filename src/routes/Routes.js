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
import ServicesTerms from '../pages/ServicesTerms';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import Subscribe from '../pages/Subscribe';

import ProtectedRoute from '../components/ProtectedRoute';

import { OrderNotificationsProvider } from "../hooks/OrderNotificationsContext";
import NotificationListener from "../components/NotificationListener";

function AppRoutes() {
    return (
        <Router>
            <OrderNotificationsProvider>
                <NotificationListener /> {/* fica fixo, não desmonta ao trocar de rota */}

                <SwitchRoutes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/validate-reset-code" element={<ValidateResetCode />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    <Route path="/terms" element={<ServicesTerms />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />

                    {/* (se quiser, pode proteger também Establishments/Products/Orders/Catalog) */}
                    <Route path="/Establishments" element={<Establishments />} />
                    <Route path="/Products" element={<Products />} />
                    <Route path="/Orders" element={<Orders />} />
                    <Route path="/Catalog/:establishmentID" element={<Catalog />} />

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
            </OrderNotificationsProvider>
        </Router>
    );
}

export default AppRoutes;
