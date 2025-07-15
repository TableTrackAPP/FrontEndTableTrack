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
            <div className="modal-box">
                <h2 className="modal-title">{product ? 'Editar Produto' : 'Novo Produto'}</h2>

                <label>Nome do Produto</label>
                <input className="modal-input" value={productName} onChange={(e) => setProductName(e.target.value)}/>

                <label>Descrição</label>
                <textarea className="modal-textarea" value={description}
                          onChange={(e) => setDescription(e.target.value)}/>

                <label>Preço</label>
                <input className="modal-input" type="number" value={price} onChange={(e) => setPrice(e.target.value)}/>

                <label>Grupo</label>
                <select className="modal-select" value={groupID} onChange={(e) => setGroupID(e.target.value)}>
                    <option value="">Selecione um grupo</option>
                    {productGroups.map((group) => (
                        <option key={group.GroupID} value={group.GroupID}>{group.GroupName}</option>
                    ))}
                </select>

                {imageURL && (
                    <div className="modal-image-preview">
                        <label>Imagem Atual:</label>
                        <img src={imageURL} alt="Imagem do Produto"/>
                    </div>
                )}

                <label>Atualizar Imagem</label>
                <input type="file" onChange={handleImageChange} className="modal-file-input"/>

                <div className="modal-buttons">
                    <button className="modal-btn save" onClick={handleSave}>Salvar</button>
                    <button className="modal-btn cancel" onClick={onHide}>Cancelar</button>
                </div>
            </div>
        </div>);
};

export default ProductModal;
