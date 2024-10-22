import { BrowserRouter as Router, Routes as SwitchRoutes, Route } from 'react-router-dom'; // Renomeando Routes para SwitchRoutes
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ValidateResetCode from '../pages/ValidateResetCode'; // Importando a página de validação do código
import ResetPassword from '../pages/ResetPassword'; // Importando a página de redefinição de senha

function AppRoutes() {
    return (
        <Router>
            <SwitchRoutes> {/* Usando SwitchRoutes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/validate-reset-code" element={<ValidateResetCode />} /> {/* Nova rota para validação do código */}
                <Route path="/reset-password" element={<ResetPassword />} /> {/* Nova rota para redefinir senha */}
            </SwitchRoutes>
        </Router>
    );
}

export default AppRoutes;
