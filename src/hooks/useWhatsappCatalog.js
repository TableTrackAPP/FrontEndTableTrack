import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from './ToastContext';
import { useLoading } from './LoadingContext';
import {
    getEstablishment,
    getEstablishmentByCatalogSlug,
} from '../services/establishmentService';
import { getProductsByEstablishmentId } from '../services/productsService';
import { getProductGroupsByEstablishmentId } from '../services/productGroupsService';

const ALL_PRODUCTS_GROUP = { GroupID: 'all', GroupName: 'Todos' };

const normalizeProduct = (product) => {
    const parsedPrice = Number.parseFloat(product.Price);

    return {
        ...product,
        Price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    };
};

const getCatalogEstablishment = async (establishmentIdentifier, lookupMode) => {
    if (lookupMode !== 'slug') {
        return getEstablishment(establishmentIdentifier);
    }

    try {
        return await getEstablishmentByCatalogSlug(establishmentIdentifier);
    } catch (error) {
        if (error?.response?.status === 404) {
            return getEstablishment(establishmentIdentifier);
        }

        throw error;
    }
};

const useWhatsappCatalog = (establishmentIdentifier, lookupMode = 'id') => {
    const [establishment, setEstablishment] = useState(null);
    const [productGroups, setProductGroups] = useState([ALL_PRODUCTS_GROUP]);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedGroupID, setSelectedGroupID] = useState('all');
    const [justAddedId, setJustAddedId] = useState(null);
    const [cartPing, setCartPing] = useState(false);
    const [catalogError, setCatalogError] = useState('');
    const feedbackTimers = useRef([]);

    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {
        const timers = feedbackTimers.current;

        return () => {
            timers.forEach(window.clearTimeout);
        };
    }, []);

    useEffect(() => {
        let isCurrentRequest = true;

        const fetchCatalogData = async () => {
            try {
                setCatalogError('');
                showLoading('Carregando produtos...');

                const establishmentData = await getCatalogEstablishment(
                    establishmentIdentifier,
                    lookupMode,
                );
                const resolvedEstablishmentID = establishmentData?.EstablishmentID;

                if (!resolvedEstablishmentID) {
                    throw new Error('Estabelecimento sem identificador válido.');
                }

                const [productGroupsData, productsData] = await Promise.all([
                    getProductGroupsByEstablishmentId(resolvedEstablishmentID),
                    getProductsByEstablishmentId(resolvedEstablishmentID),
                ]);

                if (!isCurrentRequest) return;

                setEstablishment(establishmentData);
                setProductGroups([ALL_PRODUCTS_GROUP, ...(productGroupsData || [])]);
                setProducts((productsData || []).map(normalizeProduct));
            } catch (error) {
                if (!isCurrentRequest) return;

                setCatalogError('Não foi possível carregar este catálogo agora.');
                showToast('Erro ao carregar dados do catálogo.', 'error');
            } finally {
                hideLoading();
            }
        };

        if (establishmentIdentifier) fetchCatalogData();

        return () => {
            isCurrentRequest = false;
        };
    }, [establishmentIdentifier, hideLoading, lookupMode, showLoading, showToast]);

    const addToCart = useCallback((product) => {
        setCart((currentCart) => [...currentCart, product]);
        setJustAddedId(product.ProductID);
        setCartPing(true);

        feedbackTimers.current.push(
            window.setTimeout(() => setJustAddedId(null), 900),
            window.setTimeout(() => setCartPing(false), 700),
        );
    }, []);

    const removeFromCart = useCallback((index) => {
        setCart((currentCart) => currentCart.filter((_, itemIndex) => itemIndex !== index));
        showToast('Produto removido do carrinho.', 'info');
    }, [showToast]);

    return {
        establishment,
        productGroups,
        products,
        cart,
        setCart,
        selectedGroupID,
        setSelectedGroupID,
        justAddedId,
        cartPing,
        catalogError,
        addToCart,
        removeFromCart,
    };
};

export default useWhatsappCatalog;
