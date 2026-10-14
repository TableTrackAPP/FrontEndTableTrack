import DescriptionEditor from './DescriptionEditor';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/Modal.css';
import '../styles/ProductGallery.css';
import { uploadImage } from '../services/firebaseService';
import { MAX_PRODUCT_IMAGES, productImageUrls, validProductImageUrl, productSaveError } from '../utils/productImages';

let nextPhotoId = 0;
const ProductModal = ({ show, onHide, product, onSave, productGroups = [] }) => {
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [groupID, setGroupID] = useState('');
    const [photos, setPhotos] = useState([]);
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState('');
    const photoRef = useRef([]);
    const locked = useRef(false);
    const session = useRef(0);
    const previewUrls = useRef(new Set());
    const updatePhotos = value => { photoRef.current = value; setPhotos(value); };

    useEffect(() => {
        const previews = previewUrls.current;
        session.current += 1;
        locked.current = false;
        setBusy(false); setError(''); setProgress('');
        setProductName(product?.ProductName || '');
        setDescription(product?.Description || '');
        setPrice(product?.Price ?? '');
        setGroupID(product?.GroupID ?? '');
        const initial = productImageUrls(product).map(url => ({ id: ++nextPhotoId, url, preview: url }));
        photoRef.current = initial; setPhotos(initial);
        return () => {
            session.current += 1;
            previews.forEach(url => URL.revokeObjectURL(url));
            previews.clear();
        };
    }, [product, show]);

    const addPhotos = event => {
        const files = Array.from(event.target.files || []);
        event.target.value = '';
        if (locked.current) return;
        if (photoRef.current.length + files.length > MAX_PRODUCT_IMAGES) {
            setError('Você pode adicionar até 20 fotos, contando as fotos já existentes.'); return;
        }
        if (files.some(file => !file.type.startsWith('image/'))) {
            setError('Selecione apenas arquivos de imagem.'); return;
        }
        const added = files.map(file => {
            const preview = URL.createObjectURL(file);
            previewUrls.current.add(preview);
            return { id: ++nextPhotoId, file, preview, url: null };
        });
        updatePhotos([...photoRef.current, ...added]); setError('');
    };
    const removePhoto = id => {
        const removed = photoRef.current.find(photo => photo.id === id);
        if (previewUrls.current.delete(removed.preview)) URL.revokeObjectURL(removed.preview);
        updatePhotos(photoRef.current.filter(photo => photo.id !== id));
    };
    const movePhoto = (position, destination) => {
        const reordered = [...photoRef.current];
        reordered.splice(destination, 0, reordered.splice(position, 1)[0]);
        updatePhotos(reordered);
    };
    const handleSave = async event => {
        event.preventDefault();
        if (locked.current) return;
        locked.current = true; setBusy(true); setError('');
        const currentSession = session.current;
        try {
            if (photoRef.current.length > MAX_PRODUCT_IMAGES) throw new Error('O limite é de 20 fotos.');
            const pending = photoRef.current.filter(photo => !photo.url);
            for (let index = 0; index < pending.length; index += 1) {
                const photo = pending[index];
                setProgress(`Enviando foto ${index + 1} de ${pending.length}…`);
                const result = await uploadImage(photo.file);
                if (session.current !== currentSession) return;
                if (!validProductImageUrl(result.url)) throw new Error('O upload retornou uma URL inválida. Tente novamente.');
                updatePhotos(photoRef.current.map(item => item.id === photo.id ? { ...item, url: result.url } : item));
            }
            const images = photoRef.current.map(photo => photo.url);
            if (images.some(url => !validProductImageUrl(url))) throw new Error('As fotos precisam ter URLs HTTP/HTTPS de até 2048 caracteres. Remova a foto inválida e envie o arquivo novamente.');
            if (new Set(images).size !== images.length) throw new Error('Há fotos repetidas. Remova a duplicata antes de salvar.');
            setProgress('Salvando produto…');
            await onSave({ productName, description, price, groupID, images });
        } catch (failure) {
            if (session.current === currentSession) setError(productSaveError(failure));
        } finally {
            if (session.current === currentSession) {
                locked.current = false; setBusy(false); setProgress('');
            }
        }
    };

    if (!show) return null;
    return createPortal(
        <div className="modal-overlay product-editor-backdrop">
            <form className="modal-box product-modal-box" onSubmit={handleSave} role="dialog" aria-modal="true" aria-labelledby="product-editor-title" aria-busy={busy}>
                <h2 id="product-editor-title" className="modal-title">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
                <fieldset className="product-editor-fields" disabled={busy}>
                    <label htmlFor="product-name">Nome do Produto</label>
                    <input id="product-name" className="modal-input" value={productName} required onChange={event => setProductName(event.target.value)} />
                    <label id="product-description-label">Descrição</label>
                    <DescriptionEditor value={description} onChange={setDescription} disabled={busy} />
                    <label htmlFor="product-price">Preço</label>
                    <input id="product-price" className="modal-input" type="number" step="any" value={price} required onChange={event => setPrice(event.target.value)} />
                    <label htmlFor="product-group">Grupo</label>
                    <select id="product-group" className="modal-select" value={groupID} onChange={event => setGroupID(event.target.value)}>
                        <option value="">Selecione um grupo</option>
                        {productGroups.map(group => <option key={group.GroupID} value={group.GroupID}>{group.GroupName}</option>)}
                    </select>
                    <label htmlFor="product-photos">Fotos do produto ({photos.length}/20)</label>
                    <input id="product-photos" type="file" accept="image/*" multiple onChange={addPhotos} disabled={busy || photos.length >= MAX_PRODUCT_IMAGES} />
                    <p className="product-photo-help">A primeira foto é a capa. As alterações nas fotos só serão aplicadas ao salvar.</p>
                    <ol className="product-photo-list" aria-label="Fotos na ordem da galeria">
                        {photos.map((photo, index) => <li key={photo.id}>
                            <img src={photo.preview} alt={`Foto ${index + 1}${index === 0 ? ' — capa' : ''}`} />
                            <p>{index === 0 ? 'Capa' : `Foto ${index + 1}`} · {photo.url ? (photo.file ? 'Upload concluído' : 'Salva') : 'A enviar'}</p>
                            <div className="product-photo-actions">
                                <button type="button" disabled={index === 0} aria-label={`Mover foto ${index + 1} para antes`} onClick={() => movePhoto(index, index - 1)}>←</button>
                                <button type="button" disabled={index === photos.length - 1} aria-label={`Mover foto ${index + 1} para depois`} onClick={() => movePhoto(index, index + 1)}>→</button>
                                <button type="button" disabled={index === 0} aria-label={`Definir foto ${index + 1} como capa`} onClick={() => movePhoto(index, 0)}>Definir como capa</button>
                                <button type="button" aria-label={`Remover foto ${index + 1}`} onClick={() => removePhoto(photo.id)}>Remover</button>
                            </div>
                        </li>)}
                    </ol>
                </fieldset>
                {progress && <p role="status">{progress}</p>}
                {error && <p role="alert" className="product-save-error">{error}</p>}
                <div className="modal-buttons">
                    <button type="submit" className="modal-btn save" disabled={busy}>{busy ? 'Aguarde…' : 'Salvar'}</button>
                    <button type="button" className="modal-btn cancel" disabled={busy} onClick={onHide}>Cancelar</button>
                </div>
            </form>
        </div>, document.body);
};
export default ProductModal;
