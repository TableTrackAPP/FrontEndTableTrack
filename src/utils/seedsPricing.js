const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Compare the original value before the shared catalog normalizes numeric prices.
export const isSeedsPriceNegotiable = (product) => {
    const raw = product.RawPrice ?? product.Price;
    return Number(String(raw).trim().replace(',', '.')) === 21.23;
};

export const formatSeedsPrice = (product, quantity = 1) => (
    isSeedsPriceNegotiable(product) ? 'preço a combinar' : currency.format(product.Price * quantity)
);

export const formatSeedsCartPrice = (product, quantity = 1) => (
    isSeedsPriceNegotiable(product) ? 'preço a combinar' : `R$ ${(product.Price * quantity).toFixed(2)}`
);

export const formatSeedsOrderTotal = (cart, formatFixed = (amount) => currency.format(amount)) => {
    const hasNegotiable = cart.some(isSeedsPriceNegotiable);
    const fixedItems = cart.filter((product) => !isSeedsPriceNegotiable(product));
    const fixedTotal = fixedItems.reduce((sum, product) => sum + product.Price, 0);
    if (!hasNegotiable) return formatFixed(fixedTotal);
    return fixedItems.length ? `${formatFixed(fixedTotal)} + preço a combinar` : 'preço a combinar';
};
