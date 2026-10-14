import React, { useState } from 'react';
import { productCoverUrl, PRODUCT_IMAGE_PLACEHOLDER } from '../utils/productImages';

export default function ProductCover({ product, ...props }) {
    const [failed, setFailed] = useState([]);
    const candidates = [productCoverUrl(product), product?.ImageURL, PRODUCT_IMAGE_PLACEHOLDER].filter(Boolean);
    const src = candidates.find(url => !failed.includes(url)) || PRODUCT_IMAGE_PLACEHOLDER;
    return <img {...props} src={src} alt={props.alt ?? product?.ProductName ?? 'Produto'} onError={event => {
        setFailed(previous => [...previous, src]);
        if (!candidates.some(url => url !== PRODUCT_IMAGE_PLACEHOLDER && url !== src && !failed.includes(url))) {
            props.onError?.(event);
        }
    }} />;
}
