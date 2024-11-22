// src/components/ProductModal.js
import React, { useState, useEffect } from 'react';
import '../styles/Modal.css'; // Importe o arquivo CSS

const ProductModal = ({ show, onHide, product, onSave }) => {
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        if (product) {
            setProductName(product.productName || '');
            setDescription(product.description || '');
            setPrice(product.price || '');
            setImageURL(product.imageURL || '');
            setCategory(product.category || '');
        }
    }, [product]);

    const handleSave = () => {
        onSave({
            productName,
            description,
            price,
            imageURL,
            category,
        });
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{product ? 'Editar Produto' : 'Novo Produto'}</h2>
                <div>
                    <label>Nome do Produto:</label>
                    <input value={productName} onChange={(e) => setProductName(e.target.value)} />
                </div>
                <div>
                    <label>Descrição:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                    <label>Preço:</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div>
                    <label>URL da Imagem:</label>
                    <input value={imageURL} onChange={(e) => setImageURL(e.target.value)} />
                </div>
                <div>
                    <label>Categoria:</label>
                    <input value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
                <button onClick={handleSave}>Salvar</button>
                <button onClick={onHide}>Cancelar</button>
            </div>
        </div>
    );
};

export default ProductModal;
