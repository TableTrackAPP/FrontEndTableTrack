// src/services/orderNotificationBus.js

let socket = null;
let currentEstablishmentId = null;
let listeners = new Set();
let isConnecting = false;
let reconnectTimer = null;

// HARDCORE: backend base (HTTP)
// A partir disso, montamos WS (wss/ws) automaticamente.
const API_BASE_URL = "https://backendtabletrack.onrender.com";

function getWsBaseUrl() {
    const url = new URL(API_BASE_URL);
    const protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${url.host}`; // -> wss://backendtabletrack.onrender.com
}

function emit(message) {
    for (const cb of listeners) {
        try { cb(message); } catch (e) { console.error(e); }
    }
}

function safeClose() {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    if (socket) {
        try { socket.close(); } catch (_) {}
    }
    socket = null;
}

function connect(establishmentId) {
    if (!establishmentId) return;

    const estId = String(establishmentId);

    // Se já está conectado nesse establishment, não faz nada
    if (
        socket &&
        currentEstablishmentId === estId &&
        (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
    ) {
        return;
    }

    if (isConnecting) return;

    const wsBase = getWsBaseUrl();
    if (!wsBase) {
        console.warn("❌ Não foi possível montar WS base url.");
        return;
    }

    isConnecting = true;
    currentEstablishmentId = estId;

    // PADRÃO CONSISTENTE COM SEU useWebSocket antigo:
    // /ws/notifications?id=<establishmentId>
    const wsUrl = `${wsBase}/ws/notifications?id=${encodeURIComponent(estId)}`;

    safeClose();

    try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            isConnecting = false;
            // Debug:
            // console.log("✅ WS conectado:", wsUrl);
        };

        socket.onmessage = (evt) => {
            let data = evt.data;

            // Se backend manda JSON, tenta parsear
            try { data = JSON.parse(evt.data); } catch (_) {}

            const msg =
                typeof data === "string"
                    ? data
                    : (data?.message || data?.text || "Novo pedido recebido!");

            emit(msg);
        };

        socket.onerror = (err) => {
            isConnecting = false;
            console.warn("❌ WS error:", err);
        };

        socket.onclose = () => {
            isConnecting = false;

            // Reconnect simples
            reconnectTimer = setTimeout(() => {
                if (currentEstablishmentId) connect(currentEstablishmentId);
            }, 2000);
        };
    } catch (e) {
        isConnecting = false;
        console.error("Erro criando WebSocket:", e);
    }
}

function disconnect() {
    currentEstablishmentId = null;
    safeClose();
}

function subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

function clearAll() {
    listeners.clear();
}

export const orderNotificationBus = {
    connect,
    disconnect,
    subscribe,
    clearAll,
};
