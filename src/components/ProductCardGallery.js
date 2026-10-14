import React, { useRef, useState } from 'react';
import ProductCover from './ProductCover';
import { productImageUrls } from '../utils/productImages';
import '../styles/ProductCardGallery.css';

function CardGallery({ product, urls, className = '', onOpen, renderImage, children }) {
    const track = useRef(null);
    const pointer = useRef(null);
    const suppressClickUntil = useRef(0);
    const [index, setIndex] = useState(0);
    const multiple = urls.length > 1;
    const move = delta => {
        const next = (index + delta + urls.length) % urls.length;
        setIndex(next);
        track.current.scrollTo({ left: next * track.current.clientWidth,
            behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };
    return <div className={`card-gallery ${className}`} role="group" aria-label={`Fotos de ${product.ProductName}`}>
        <div className="card-gallery-track" ref={track}
            onScroll={() => {
                if (track.current.clientWidth) setIndex(Math.max(0, Math.min(urls.length - 1, Math.round(track.current.scrollLeft / track.current.clientWidth))));
            }}
            onKeyDown={event => {
                if (multiple && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                    event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
                }
            }}
            onPointerDownCapture={event => { suppressClickUntil.current = 0; pointer.current = { x: event.clientX, y: event.clientY }; }}
            onPointerUpCapture={event => {
                if (pointer.current && (Math.abs(event.clientX - pointer.current.x) > 10 || Math.abs(event.clientY - pointer.current.y) > 10)) suppressClickUntil.current = Date.now() + 400;
                pointer.current = null;
            }}
            onPointerCancel={() => { pointer.current = null; suppressClickUntil.current = Date.now() + 400; }}>
            {(urls.length ? urls : ['']).map((url, position) => {
                const photo = url ? { ...product, Images: [{ ImageURL: url, SortOrder: 0 }], ImageURL: position === 0 ? product.ImageURL : url } : product;
                return <button type="button" className="card-gallery-slide" key={url || 'placeholder'}
                    tabIndex={index === position ? 0 : -1} aria-hidden={index !== position}
                    aria-label={`Ver detalhes de ${product.ProductName}`}
                    onClick={() => { if (Date.now() >= suppressClickUntil.current) onOpen?.(); }}>
                    {renderImage ? renderImage(photo) : <ProductCover product={photo} draggable={false} loading="lazy" decoding="async"
                        alt={multiple ? `${product.ProductName} — foto ${position + 1} de ${urls.length}` : product.ProductName} />}
                </button>;
            })}
        </div>
        {multiple && <>
            <button type="button" className="card-gallery-arrow card-gallery-previous" aria-label={`Foto anterior de ${product.ProductName}`} onClick={() => move(-1)}><span aria-hidden="true">‹</span></button>
            <button type="button" className="card-gallery-arrow card-gallery-next" aria-label={`Próxima foto de ${product.ProductName}`} onClick={() => move(1)}><span aria-hidden="true">›</span></button>
            <span className="card-gallery-count" aria-live="polite" aria-atomic="true">{index + 1}/{urls.length}</span>
        </>}
        {children}
    </div>;
}

export default function ProductCardGallery(props) {
    const urls = productImageUrls(props.product);
    return <CardGallery key={JSON.stringify(urls)} {...props} urls={urls} />;
}
