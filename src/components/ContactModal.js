// src/components/ContactModal.js

import React from "react";

const ContactModal = ({ onClose }) => {
    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2>Entre em Contato</h2>
                <p>Para dúvidas ou suporte, entre em contato pelo e-mail:</p>
                <p style={styles.email}>tabletrackproject@gmail.com</p>
                <button style={styles.button} onClick={onClose}>Fechar</button>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
    },
    modal: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        textAlign: "center",
        maxWidth: "400px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
    },
    email: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#129666"
    },
    button: {
        marginTop: "15px",
        padding: "10px",
        border: "none",
        backgroundColor: "#129666",
        color: "#fff",
        cursor: "pointer",
        borderRadius: "5px"
    }
};

export default ContactModal;
