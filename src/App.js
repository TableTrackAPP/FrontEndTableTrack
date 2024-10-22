import React from 'react';
import AppRoutes from './routes/Routes';
import { useLoading } from './hooks/LoadingContext'; // Importa o contexto de Loading
import Loading from './components/Loading'; // Importa o componente Loading

function App() {
    const { isLoading, loadingMessage } = useLoading(); // Acessa o estado de isLoading e a mensagem

    return (
        <div className="App">
            {isLoading && <Loading message={loadingMessage} />} {/* Renderiza o Loading se isLoading for true */}
            <AppRoutes /> {/* Renderiza as rotas */}
        </div>
    );
}

export default App;
