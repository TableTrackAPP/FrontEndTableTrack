import React from 'react';
import { descriptionHtml } from '../utils/productDescription';
import '../styles/ProductDescription.css';

export default function ProductDescription({ value, className = '' }) {
    return <div className={`formatted-description ${className}`} dangerouslySetInnerHTML={{ __html: descriptionHtml(value) }} />;
}
