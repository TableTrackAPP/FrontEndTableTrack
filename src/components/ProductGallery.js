import React, { useRef, useState } from 'react';
import { productImageUrls, PRODUCT_IMAGE_PLACEHOLDER } from '../utils/productImages';
import '../styles/ProductGallery.css';

export default function ProductGallery({ product }) {
    const urls = productImageUrls(product);
    const [index, setIndex] = useState(0);
    const [failed, setFailed] = useState([]);
    const touch = useRef(null);
    const active = Math.min(index, Math.max(0, urls.length - 1));
    const move = delta => setIndex((active + delta + urls.length) % urls.length);
    const source = url => failed.includes(url) ? PRODUCT_IMAGE_PLACEHOLDER : url;
    return <section className="product-gallery" aria-label={`Fotos de ${product.ProductName}`}
        onKeyDown={event => {
            if (urls.length < 2) return;
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault(); event.stopPropagation(); move(event.key === 'ArrowRight' ? 1 : -1);
            }
        }}>
        <div className="product-gallery-stage" tabIndex={0} aria-label="Foto ampliada. Use as setas para navegar."
            onTouchStart={event => { touch.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }}
            onTouchCancel={() => { touch.current = null; }}
            onTouchEnd={event => {
                if (touch.current && event.changedTouches.length && urls.length > 1) {
                    const dx = event.changedTouches[0].clientX - touch.current.x;
                    const dy = event.changedTouches[0].clientY - touch.current.y;
                    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
                }
                touch.current = null;
            }}>
            <img src={source(urls[active] || PRODUCT_IMAGE_PLACEHOLDER)}
                alt={urls.length ? `${product.ProductName} — foto ${active + 1} de ${urls.length}` : `${product.ProductName} — sem imagem`}
                onError={() => setFailed(previous => [...previous, urls[active]])} />
            {urls.length > 1 && <>
                <button type="button" className="gallery-previous" aria-label="Foto anterior" onClick={() => move(-1)}>‹</button>
                <button type="button" className="gallery-next" aria-label="Próxima foto" onClick={() => move(1)}>›</button>
            </>}
        </div>
        {urls.length > 1 && <>
            <p className="gallery-count" role="status">Foto {active + 1} de {urls.length}</p>
            <div className="product-gallery-thumbnails" aria-label="Miniaturas">
                {urls.map((url, position) => <button type="button" key={url} aria-label={`Ver foto ${position + 1} de ${product.ProductName}`}
                    aria-pressed={active === position} onClick={() => setIndex(position)}>
                    <img src={source(url)} alt={`Miniatura ${position + 1} de ${product.ProductName}`} onError={() => setFailed(previous => [...previous, url])} />
                </button>)}
            </div>
        </>}
    </section>;
}
