import React from 'react';
import { descriptionHtml, truncateDescriptionHtml } from '../utils/productDescription';
import '../styles/ProductDescription.css';

export default function ProductDescription({ value, className = '', maxLength }) {
    return <div className={`formatted-description ${className}`} dangerouslySetInnerHTML={{ __html: truncateDescriptionHtml(descriptionHtml(value), maxLength) }} />;
}
