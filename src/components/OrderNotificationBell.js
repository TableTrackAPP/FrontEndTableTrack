import React from "react";
import { useNavigate } from "react-router-dom";
import { useOrderNotifications } from "../hooks/OrderNotificationsContext";

const OrderNotificationBell = () => {
    const navigate = useNavigate();
    const { unreadCount, clearUnread } = useOrderNotifications();

    const goOrders = () => {
        clearUnread();
        navigate("/orders");
    };

    return (
        <button
            type="button"
            onClick={goOrders}
            style={{
                position: "relative",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "18px",
                padding: "6px 10px",
            }}
            aria-label="Notificações de pedidos"
            title="Pedidos"
        >
            🔔
            {unreadCount > 0 && (
                <span
                    style={{
                        position: "absolute",
                        top: "-2px",
                        right: "-2px",
                        minWidth: "18px",
                        height: "18px",
                        borderRadius: "999px",
                        padding: "0 6px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: "#ef4444",
                        color: "#fff",
                    }}
                >
          {unreadCount}
        </span>
            )}
        </button>
    );
};

export default OrderNotificationBell;
