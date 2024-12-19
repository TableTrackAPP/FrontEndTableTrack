import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext';
import { getEstablishment } from '../services/establishmentService';
import { getProductsByEstablishmentId } from '../services/productsService';
import { getProductGroupsByEstablishmentId } from '../services/productGroupsService';
import ProductCartModal from '../components/ProductCartModal';
import CartModal from '../components/CartModal';

const Catalog = () => {
    const { establishmentID } = useParams(); // Recebe establishmentID da rota
    const [searchParams] = useSearchParams(); // Permite obter query params
    const tableID = searchParams.get('tableID'); // Obtém tableID dos query params, se existir

    const [establishment, setEstablishment] = useState(null);
    const [productGroups, setProductGroups] = useState([]);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductCartModal, setShowProductCartModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchCatalogData = async () => {
            try {
                const establishmentData = await getEstablishment(establishmentID);
                setEstablishment(establishmentData);

                const productGroupsData = await getProductGroupsByEstablishmentId(establishmentID);
                setProductGroups(productGroupsData);

                const productsData = await getProductsByEstablishmentId(establishmentID);
                setProducts(
                    productsData.map((product) => ({
                        ...product,
                        Price: parseFloat(product.Price), // Converte o preço para número
                    }))
                );
            } catch (error) {
                showToast('Erro ao carregar dados do catálogo.', 'error');
            }
        };

        if (establishmentID) {
            fetchCatalogData();
        }
    }, [establishmentID, showToast]);

    const addToCart = (product) => {
        setCart([...cart, product]); // Adiciona o produto ao carrinho como um novo item
        showToast('Produto adicionado ao carrinho.', 'success');
    };


    const removeFromCart = (index) => {
        setCart(cart.filter((_, i) => i !== index)); // Remove o produto com base no índice
        showToast('Produto removido do carrinho.', 'info');
    };


    return (
        <div style={{ padding: '20px' }}>
            <h1>{establishment?.EstablishmentName}</h1>
            <p>{establishment?.Description}</p>

            <button onClick={() => setShowCartModal(true)}>Ver Carrinho</button>

            {productGroups.map((group) => (
                <div key={group.GroupID}>
                    <h2>{group.GroupName}</h2>
                    <ul>
                        {products
                            .filter((product) => product.GroupID === group.GroupID)
                            .map((product) => (
                                <li key={product.ProductID}>
                                    {product.ProductName} - {product.Price.toFixed(2)}
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setShowProductCartModal(true);
                                        }}
                                    >
                                        Ver
                                    </button>
                                    <button onClick={() => addToCart(product)}>Adicionar</button>
                                </li>
                            ))}
                    </ul>
                </div>
            ))}

            {showProductCartModal && selectedProduct && (
                <ProductCartModal
                    product={selectedProduct}
                    show={showProductCartModal}
                    onHide={() => setShowProductCartModal(false)}
                    onAddToCart={addToCart}
                />
            )}

            {showCartModal && (
                <CartModal
                    cart={cart}
                    onHide={() => setShowCartModal(false)}
                    onRemove={removeFromCart}
                    tableID={tableID}
                    establishmentID={establishmentID}
                    setCart={setCart} // Passando o setCart como prop
                />
            )}
        </div>
    );
};

export default Catalog;
