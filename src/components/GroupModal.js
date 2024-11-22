// src/components/GroupModal.js
import React, { useState, useEffect } from 'react';
import '../styles/Modal.css'; // Importe o arquivo CSS com os estilos para o modal

const GroupModal = ({ show, onHide, group, onSave }) => {
    const [groupName, setGroupName] = useState('');

    useEffect(() => {
        if (group) {
            setGroupName(group.groupName || '');
        } else {
            setGroupName('');
        }
    }, [group]);

    const handleSave = () => {
        onSave({ groupName });
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{group ? 'Editar Grupo' : 'Novo Grupo'}</h2>
                <div>
                    <label>Nome do Grupo:</label>
                    <input
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleSave} style={{ marginRight: '10px' }}>Salvar</button>
                    <button onClick={onHide}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default GroupModal;
