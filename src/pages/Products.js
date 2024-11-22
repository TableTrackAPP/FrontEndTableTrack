// src/pages/Products.js
import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/ToastContext';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByUserID, getProductsByEstablishmentId
} from '../services/productsService';
import {
    getProductGroups,
    createProductGroup,
    updateProductGroup,
    deleteProductGroup,
    getProductGroupsByUserID, getProductGroupsByEstablishmentId
} from '../services/productGroupsService';
import { getFromLocalStorage } from '../utils/storageUtils'; // Importa storageUtils
import { getEstablishmentByOwnerID } from '../services/establishmentService'; // Importa serviço para buscar estabelecimento
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
    const [establishmentID, setEstablishmentID] = useState(null); // Estado para armazenar establishmentID
    const { showToast } = useToast();

    useEffect(() => {
        const fetchEstablishmentAndData = async () => {
            try {
                const userData = getFromLocalStorage('userData');
                if (!userData) throw new Error('Usuário não autenticado.');

                const ownerID = userData.userID;
                const establishment = await getEstablishmentByOwnerID(ownerID);
                if (!establishment) throw new Error('Estabelecimento não encontrado.');

                setEstablishmentID(establishment.EstablishmentID); // Define establishmentID no estado


                // Carrega produtos e grupos relacionados ao establishmentID
                const fetchedProducts = await getProductsByEstablishmentId(establishment.EstablishmentID);
                const fetchedGroups = await getProductGroupsByEstablishmentId(establishment.EstablishmentID);
                setProducts(fetchedProducts);
                setProductGroups(fetchedGroups);
            } catch (error) {
                showToast(error.message || 'Erro ao carregar dados', 'error');
            }
        };
        fetchEstablishmentAndData();
    }, []); // Array de dependências vazio

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

            const productPayload = { ...productData, establishmentID };
            if (isEditingProduct) {
                await updateProduct(selectedProduct.productID, productPayload);
                setProducts(products.map(p => (p.productID === selectedProduct.productID ? productPayload : p)));
                showToast('Produto atualizado com sucesso', 'success');
            } else {
                const newProduct = await createProduct(productPayload);
                setProducts([...products, newProduct]);
                showToast('Produto criado com sucesso', 'success');
            }
            setShowProductModal(false);
        } catch (error) {
            showToast(error.message || 'Erro ao salvar produto', 'error');
        }
    };

    const handleSaveGroup = async (groupData) => {
        try {

            if (!establishmentID) throw new Error('Establishment ID não encontrado.');

            const groupPayload = { ...groupData, establishmentID };
            console.log(establishmentID);

            if (isEditingGroup) {
                await updateProductGroup(selectedGroup.groupID, groupPayload);
                setProductGroups(productGroups.map(g => (g.groupID === selectedGroup.groupID ? groupPayload : g)));
                showToast('Grupo atualizado com sucesso', 'success');
            } else {
                const newGroup = await createProductGroup(groupPayload);
                setProductGroups([...productGroups, newGroup]);
                showToast('Grupo criado com sucesso', 'success');
            }
            setShowGroupModal(false);
        } catch (error) {
            showToast(error.message || 'Erro ao salvar grupo', 'error');
        }
    };

    const handleDeleteProduct = async (productID) => {
        try {
            await deleteProduct(productID);
            setProducts(products.filter(p => p.productID !== productID));
            showToast('Produto deletado com sucesso', 'success');
        } catch (error) {
            showToast('Erro ao deletar produto', 'error');
        }
    };

    const handleDeleteGroup = async (groupID) => {
        try {
            await deleteProductGroup(groupID);
            setProductGroups(productGroups.filter(g => g.groupID !== groupID));
            showToast('Grupo deletado com sucesso', 'success');
        } catch (error) {
            showToast('Erro ao deletar grupo', 'error');
        }
    };

    return (
        <div style={{padding: '20px'}}>
            <h1>Gerenciamento de Produtos</h1>
            <button onClick={() => openGroupModal()}>Criar Novo Grupo</button>
            <button onClick={() => openProductModal()}>Criar Novo Produto</button>

            <h2>Grupos</h2>
            <ul>
                {productGroups.map(group => (
                    <li key={group.GroupID}> {/* GroupID usado como key */}
                        {group.GroupName}
                        <button onClick={() => openGroupModal(group)}>Editar</button>
                        <button onClick={() => handleDeleteGroup(group.GroupID)}>Excluir</button>
                    </li>
                ))}
            </ul>

            <h2>Produtos</h2>
            <ul>
                {products.map(product => (
                    <li key={product.ProductID}> {/* ProductID usado como key */}
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
