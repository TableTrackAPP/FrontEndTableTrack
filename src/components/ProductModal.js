import React, { useState, useEffect } from 'react';
import '../styles/Modal.css';
import { uploadImage } from '../services/firebaseService'; // Importa o serviço de upload

const ProductModal = ({ show, onHide, product, onSave, productGroups }) => {
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [imageFile, setImageFile] = useState(null); // Estado para o arquivo de imagem
    const [groupID, setGroupID] = useState('');

    useEffect(() => {
        if (product) {
            setProductName(product.ProductName || '');
            setDescription(product.Description || '');
            setPrice(product.Price || '');
            setImageURL(product.ImageURL || '');
            setGroupID(product.GroupID || '');
        }
    }, [product]);

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSave = async () => {
        try {
            let uploadedImageURL = imageURL;

            // Faz o upload da imagem se houver um novo arquivo
            if (imageFile) {
                const uploadData = await uploadImage(imageFile, imageURL); // Envia a URL antiga para substituir no Firebase
                uploadedImageURL = uploadData.url; // Obtém a nova URL
            }

            // Chama a função de salvar com os dados atualizados
            onSave({
                productName,
                description,
                price,
                imageURL: uploadedImageURL,
                groupID,
            });
        } catch (error) {
            console.error('Erro ao fazer o upload da imagem:', error.message);
        }
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

                {/* Mostra a imagem atual se disponível */}
                {imageURL && (
                    <div>
                        <label>Imagem Atual:</label>
                        <img
                            src={imageURL}
                            alt="Imagem do Produto"
                            style={{ width: '150px', height: '150px', objectFit: 'cover', margin: '10px 0' }}
                        />
                    </div>
                )}

                <div>
                    <label>Atualizar Imagem:</label>
                    <input type="file" onChange={handleImageChange} />
                </div>
                <div>
                    <label>Grupo:</label>
                    <select value={groupID} onChange={(e) => setGroupID(e.target.value)}>
                        <option value="">Selecione um grupo</option>
                        {productGroups.map((group) => (
                            <option key={group.GroupID} value={group.GroupID}>
                                {group.GroupName}
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={handleSave}>Salvar</button>
                <button onClick={onHide}>Cancelar</button>
            </div>
        </div>
    );
};

export default ProductModal;
