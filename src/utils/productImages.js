export const MAX_PRODUCT_IMAGES = 20;
export const PRODUCT_IMAGE_PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#eef1ef"/><text x="200" y="155" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#637068">Sem imagem</text></svg>');

export function productImageUrls(product) {
    const gallery = (Array.isArray(product?.Images) ? product.Images : [])
        .filter(image => typeof image?.ImageURL === 'string' && image.ImageURL.trim())
        .slice().sort((a, b) => (a.SortOrder ?? 0) - (b.SortOrder ?? 0))
        .map(image => image.ImageURL.trim());
    const urls = gallery.length ? gallery : (product?.ImageURL ? [product.ImageURL.trim()] : []);
    return [...new Set(urls)];
}
export const productCoverUrl = product => productImageUrls(product)[0] || '';

export function validProductImageUrl(value) {
    if (typeof value !== 'string' || !value || value.length > 2048) return false;
    try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}

export function productSaveError(error) {
    if (error?.response?.status === 404) return 'Este produto não existe mais. Seus dados continuam no formulário.';
    const data = error?.response?.data;
    return [data?.message, typeof data?.error === 'string' ? data.error : ''].filter(Boolean).join(' — ')
        || error?.message || 'Não foi possível salvar. Tente novamente.';
}
