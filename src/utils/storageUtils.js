// src/utils/storageUtils.js

// Função para salvar dados no localStorage
export const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Função para obter dados do localStorage
export const getFromLocalStorage = (key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
};

// Função para remover dados do localStorage
export const removeFromLocalStorage = (key) => {
    localStorage.removeItem(key);
};
