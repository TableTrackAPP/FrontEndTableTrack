import React from 'react';
import '../styles/Modal.css'; // Certifique-se de ter um estilo básico para modais

const ProductCartModal = ({ product, show, onHide, onAddToCart }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onHide}>×</button>
                <h2>{product.ProductName}</h2>
                <img
                    src={product.ImageURL}
                    alt={product.ProductName}
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginBottom: '15px' }}
                />
                <p><strong>Descrição:</strong> {product.Description}</p>
                <p><strong>Preço:</strong> R$ {product.Price.toFixed(2)}</p>
                <button
                    onClick={() => {
                        onAddToCart(product);
                        onHide(); // Fecha o modal após adicionar ao carrinho
                    }}
                    className="add-to-cart-button"
                >
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    );
};

export default ProductCartModal;
