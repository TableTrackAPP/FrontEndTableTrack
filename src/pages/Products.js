import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/ToastContext';
import { useLoading } from '../hooks/LoadingContext'; // Importa o contexto de Loading
import {
    getProductsByEstablishmentId,
    createProduct,
    updateProduct,
    deleteProduct
} from '../services/productsService';
import {
    getProductGroupsByEstablishmentId,
    createProductGroup,
    updateProductGroup,
    deleteProductGroup
} from '../services/productGroupsService';
import { getFromLocalStorage } from '../utils/storageUtils';
import { getEstablishmentByOwnerID } from '../services/establishmentService';
import ProductModal from '../components/ProductModal';
import GroupModal from '../components/GroupModal';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [productGroups, setProductGroups] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [establishmentID, setEstablishmentID] = useState(null);
    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading(); // Hooks para mostrar/esconder loading

    useEffect(() => {
        const fetchEstablishmentAndData = async () => {
            try {
                showLoading('Carregando dados...'); // Mostra o loading
                const userData = getFromLocalStorage('userData');
                if (!userData) throw new Error('Usuário não autenticado.');

                const ownerID = userData.userID;
                const establishment = await getEstablishmentByOwnerID(ownerID);
                if (!establishment) throw new Error('Estabelecimento não encontrado.');

                setEstablishmentID(establishment.EstablishmentID);

                // Carrega produtos e grupos relacionados ao establishmentID
                const fetchedProducts = await getProductsByEstablishmentId(establishment.EstablishmentID);
                const fetchedGroups = await getProductGroupsByEstablishmentId(establishment.EstablishmentID);
                setProducts(fetchedProducts);
                setProductGroups(fetchedGroups);
            } catch (error) {
                showToast(error.message || 'Erro ao carregar dados', 'error');
            } finally {
                hideLoading(); // Esconde o loading
            }
        };
        fetchEstablishmentAndData();
    }, []);

    const openProductModal = (product = null) => {
        setSelectedProduct(product);
        setIsEditingProduct(!!product);
        setShowProductModal(true);
    };

    const openGroupModal = (group = null) => {
        setSelectedGroup(group);
        setIsEditingGroup(!!group);
        setShowGroupModal(true);
    };

    const handleSaveProduct = async (productData) => {
        try {
            if (!establishmentID) throw new Error('Establishment ID não encontrado.');
            showLoading('Salvando produto...');
            const productPayload = { ...productData, establishmentID };

            if (isEditingProduct) {
                await updateProduct(selectedProduct.ProductID, productPayload);
                showToast('Produto atualizado com sucesso', 'success');
            } else {
                await createProduct(productPayload);
                showToast('Produto criado com sucesso', 'success');
            }

            const updatedProducts = await getProductsByEstablishmentId(establishmentID);
            setProducts(updatedProducts);
            setShowProductModal(false);
        } catch (error) {
            showToast(error.message || 'Erro ao salvar produto', 'error');
        } finally {
            hideLoading();
        }
    };

    const handleSaveGroup = async (groupData) => {
        try {
            if (!establishmentID) throw new Error('Establishment ID não encontrado.');
            showLoading('Salvando grupo...');
            const groupPayload = { ...groupData, establishmentID };

            if (isEditingGroup) {
                await updateProductGroup(selectedGroup.GroupID, groupPayload);
                showToast('Grupo atualizado com sucesso', 'success');
            } else {
                await createProductGroup(groupPayload);
                showToast('Grupo criado com sucesso', 'success');
            }

            const updatedGroups = await getProductGroupsByEstablishmentId(establishmentID);
            setProductGroups(updatedGroups);
            setShowGroupModal(false);
        } catch (error) {
            showToast(error.message || 'Erro ao salvar grupo', 'error');
        } finally {
            hideLoading();
        }
    };

    const handleDeleteProduct = async (productID) => {
        try {
            showLoading('Excluindo produto...');
            await deleteProduct(productID);
            const updatedProducts = await getProductsByEstablishmentId(establishmentID);
            setProducts(updatedProducts);
            showToast('Produto deletado com sucesso', 'success');
        } catch (error) {
            showToast('Erro ao deletar produto', 'error');
        } finally {
            hideLoading();
        }
    };

    const handleDeleteGroup = async (groupID) => {
        try {
            showLoading('Excluindo grupo...');
            await deleteProductGroup(groupID);
            const updatedGroups = await getProductGroupsByEstablishmentId(establishmentID);
            setProductGroups(updatedGroups);
            showToast('Grupo deletado com sucesso', 'success');
        } catch (error) {
            showToast('Erro ao deletar grupo', 'error');
        } finally {
            hideLoading();
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Gerenciamento de Produtos</h1>
            <button onClick={() => openGroupModal()}>Criar Novo Grupo</button>
            <button onClick={() => openProductModal()}>Criar Novo Produto</button>

            <h2>Grupos</h2>
            <ul>
                {productGroups.map(group => (
                    <li key={group.GroupID}>
                        {group.GroupName}
                        <button onClick={() => openGroupModal(group)}>Editar</button>
                        <button onClick={() => handleDeleteGroup(group.GroupID)}>Excluir</button>
                    </li>
                ))}
            </ul>

            <h2>Produtos</h2>
            <ul>
                {products.map(product => (
                    <li key={product.ProductID}>
                        {product.ProductName} - {product.Price}
                        <button onClick={() => openProductModal(product)}>Editar</button>
                        <button onClick={() => handleDeleteProduct(product.ProductID)}>Excluir</button>
                    </li>
                ))}
            </ul>

            {showProductModal && (
                <ProductModal
                    show={showProductModal}
                    onHide={() => setShowProductModal(false)}
                    product={selectedProduct}
                    onSave={handleSaveProduct}
                    productGroups={productGroups}
                />
            )}
            {showGroupModal && (
                <GroupModal
                    show={showGroupModal}
                    onHide={() => setShowGroupModal(false)}
                    group={selectedGroup}
                    onSave={handleSaveGroup}
                />
            )}
        </div>
    );
};

export default Products;
