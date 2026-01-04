import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getFromLocalStorage } from "../utils/storageUtils";
import { getEstablishmentByOwnerID } from "../services/establishmentService";
import { orderNotificationBus } from "../services/orderNotificationBus";

const Ctx = createContext(null);

export function OrderNotificationsProvider({ children }) {
    const [establishmentID, setEstablishmentID] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastMessage, setLastMessage] = useState(null);

    useEffect(() => {
        let mounted = true;

        async function init() {
            const userData = getFromLocalStorage("userData");
            if (!userData?.userID) return;

            try {
                const est = await getEstablishmentByOwnerID(userData.userID);
                if (mounted && est?.EstablishmentID) {
                    setEstablishmentID(est.EstablishmentID);
                }
            } catch (e) {
                console.error("Erro ao buscar estabelecimento (notificações):", e);
            }
        }

        init();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!establishmentID) return;

        orderNotificationBus.connect(establishmentID);

        const unsub = orderNotificationBus.subscribe((message) => {
            setLastMessage(message);
            setUnreadCount((c) => c + 1);
        });

        return () => unsub();
    }, [establishmentID]);

    const api = useMemo(() => ({
        unreadCount,
        lastMessage,
        clearUnread: () => setUnreadCount(0),
    }), [unreadCount, lastMessage]);

    return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useOrderNotifications() {
    const ctx = useContext(Ctx);
    if (!ctx) {
        throw new Error("useOrderNotifications deve ser usado dentro de OrderNotificationsProvider");
    }
    return ctx;
}
