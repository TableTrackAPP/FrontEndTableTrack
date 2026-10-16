import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SeedsCatalog from './SeedsCatalog';
import CatalogWhatsapp from './CatalogWhatsapp';
import { LoadingProvider } from '../hooks/LoadingContext';
import { ToastProvider } from '../hooks/ToastContext';
import { getEstablishment, getEstablishmentByCatalogSlug } from '../services/establishmentService';
import { getProductsByEstablishmentId } from '../services/productsService';
import { getProductGroupsByEstablishmentId } from '../services/productGroupsService';

jest.mock('../services/orderService', () => ({ createOrder: jest.fn().mockResolvedValue({ OrderID: 123 }) }));

jest.mock('../services/establishmentService', () => ({ getEstablishment: jest.fn(), getEstablishmentByCatalogSlug: jest.fn() }));
jest.mock('../services/productsService', () => ({ getProductsByEstablishmentId: jest.fn() }));
jest.mock('../services/productGroupsService', () => ({ getProductGroupsByEstablishmentId: jest.fn() }));

const products = [
    { ProductID: 1, GroupID: 10, ProductName: 'Produto de teste A', Description: 'Descrição com acentuação', Price: '12.50', ImageURL: '/test-product.png' },
    { ProductID: 2, GroupID: 20, ProductName: 'Produto de teste B', Description: 'Outra descrição', Price: '20' },
];
function mount(legacy = false, identifier = 'test-establishment') {
    const basePath = legacy ? '/catalog-whatsapp' : '/catalog-sementes';
    return render(<HelmetProvider><LoadingProvider><ToastProvider><MemoryRouter initialEntries={[`${basePath}/${identifier}`]}>
        <Routes><Route path={`${basePath}/:${legacy ? 'establishmentID' : 'establishmentSlug'}`} element={legacy ? <CatalogWhatsapp /> : <SeedsCatalog />} /></Routes>
    </MemoryRouter></ToastProvider></LoadingProvider></HelmetProvider>);
}
beforeEach(() => {
    jest.clearAllMocks();
    getEstablishmentByCatalogSlug.mockReset().mockRejectedValue({ response: { status: 404 } });
    getEstablishment.mockResolvedValue({ EstablishmentID: 'test-establishment', EstablishmentName: 'Estabelecimento de teste', Description: 'Descrição cadastrada', WhatsAppNumber: '+55 (11) 99999-9999' });
    getProductsByEstablishmentId.mockResolvedValue(products);
    getProductGroupsByEstablishmentId.mockResolvedValue([{ GroupID: 10, GroupName: 'Grupo A' }, { GroupID: 20, GroupName: 'Grupo B' }]);
    window.matchMedia = jest.fn(() => ({ matches: true }));
    window.open = jest.fn();
    Element.prototype.scrollIntoView = jest.fn();
});

test('combina pesquisa sem acentos com grupos e limpa filtros sem novas requisições', async () => {
    mount();
    await screen.findByRole('heading', { name: 'Produto de teste A' });
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'acentuacao' } });
    expect(screen.getByRole('heading', { name: 'Produto de teste A' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Produto de teste B' })).not.toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Grupo B' }));
    expect(screen.getByText('Nenhum produto encontrado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(getProductsByEstablishmentId).toHaveBeenCalledTimes(1);
    expect(getProductGroupsByEstablishmentId).toHaveBeenCalledTimes(1);
});

test('preserva detalhes, quantidades, remoção, validação e mensagem do WhatsApp', async () => {
    mount();
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Produto de teste A ao pedido' }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar uma unidade de Produto de teste A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover uma unidade de Produto de teste A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes de Produto de teste A' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Descrição com acentuação')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Adicionar ao Carrinho' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir pedido com 2 itens' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar no WhatsApp' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Informe seu nome');
    fireEvent.change(screen.getByRole('textbox', { name: 'Nome do cliente' }), { target: { value: 'Cliente de teste' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar no WhatsApp' }));
    await waitFor(() => expect(window.open).toHaveBeenCalled());
    const [url, target, features] = window.open.mock.calls[0];
    expect(url).toContain('https://wa.me/5511999999999?text=');
    expect(decodeURIComponent(url)).toContain('2x Produto de teste A — R$ 25.00');
    expect(decodeURIComponent(url)).toContain('*Total:* R$ 25.00');
    expect(target).toBe('_self');
    expect(features).toBe('noopener,noreferrer');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Abrir pedido com 0 itens' })).toBeInTheDocument();
    expect(getEstablishment).toHaveBeenCalledTimes(1);
});

test('mostra erro sem repetir requisições por causa do toast e permite tentar novamente', async () => {
    getEstablishment.mockRejectedValueOnce({ response: { status: 404 } });
    mount();
    await screen.findByRole('heading', { name: 'Estabelecimento não encontrado' });
    expect(getEstablishment).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await screen.findByRole('heading', { name: 'Produto de teste A' });
    expect(getEstablishment).toHaveBeenCalledTimes(2);
});

test('diferencia falha de produtos de estabelecimento inexistente', async () => {
    getProductsByEstablishmentId.mockRejectedValue({ response: { status: 404 } });
    mount();
    await screen.findByRole('heading', { name: 'Não foi possível carregar o catálogo' });
    expect(screen.queryByText('Estabelecimento não encontrado')).not.toBeInTheDocument();
});

test('diferencia carregamento de catálogo vazio', async () => {
    let resolve;
    getProductsByEstablishmentId.mockReturnValue(new Promise((done) => { resolve = done; }));
    mount();
    expect(screen.getByText('Carregando catálogo…')).toBeInTheDocument();
    await waitFor(() => expect(getProductsByEstablishmentId).toHaveBeenCalledTimes(1));
    await act(async () => resolve([]));
    expect(screen.getByText('O catálogo ainda não possui produtos')).toBeInTheDocument();
});

test('usa fallback para imagens inválidas e restaura foco ao fechar detalhes', async () => {
    mount();
    const trigger = await screen.findByRole('button', { name: 'Ver detalhes de Produto de teste A' });
    fireEvent.error(within(trigger).getByRole('img'));
    expect(within(trigger).getByText('Imagem não disponível')).toBeInTheDocument();
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('button', { name: 'Fechar detalhes' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveFocus();
});

test('catálogo WhatsApp anterior continua carregando, selecionando e exibindo o pedido', async () => {
    mount(true);
    await screen.findByText('Produto de teste A');
    fireEvent.click(screen.getAllByRole('button', { name: 'Adicionar' })[0]);
    fireEvent.click(screen.getByRole('button', { name: /WhatsApp \(Carrinho\)/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Produto de teste A');
    expect(screen.getByRole('dialog')).toHaveTextContent('Total: R$ 12.50');
});

test.each([21.23, '21,23'])('preço %s aparece a combinar nos detalhes e no pedido, sem entrar no total', async (price) => {
    getProductsByEstablishmentId.mockResolvedValue([{ ...products[0], Price: price }, products[1]]);
    mount();
    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalhes de Produto de teste A' }));
    expect(within(screen.getByRole('dialog')).getByText('preço a combinar', { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao Carrinho' }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Produto de teste B ao pedido' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir pedido com 2 itens' }));
    expect(screen.getByRole('dialog')).toHaveTextContent(/Total: R\$\s*20.00 \+ preço a combinar/);
    fireEvent.change(screen.getByRole('textbox', { name: 'Nome do cliente' }), { target: { value: 'Cliente' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar no WhatsApp' }));
    await waitFor(() => expect(window.open).toHaveBeenCalled());
    const message = new URL(window.open.mock.calls[0][0]).searchParams.get('text');
    expect(message).toContain('1x Produto de teste A — preço a combinar');
    expect(message).not.toMatch(/21[.,]23/);
});


test('carrega o catálogo sementes pelo slug e usa o ID resolvido para buscar produtos', async () => {
    getEstablishmentByCatalogSlug.mockResolvedValue({ EstablishmentID: 'resolved-id', EstablishmentName: 'Raízes de Ouro' });
    mount(false, 'raizes-de-ouro');
    await screen.findByRole('heading', { name: 'Produto de teste A' });
    expect(getEstablishmentByCatalogSlug).toHaveBeenCalledWith('raizes-de-ouro');
    expect(getEstablishment).not.toHaveBeenCalled();
    expect(getProductsByEstablishmentId).toHaveBeenCalledWith('resolved-id');
    expect(getProductGroupsByEstablishmentId).toHaveBeenCalledWith('resolved-id');
});

test('preserva links antigos por ID quando o slug não existe', async () => {
    mount();
    await screen.findByRole('heading', { name: 'Produto de teste A' });
    expect(getEstablishmentByCatalogSlug).toHaveBeenCalledWith('test-establishment');
    expect(getEstablishment).toHaveBeenCalledWith('test-establishment');
});

test('falha na busca por slug não é tratada como estabelecimento inexistente', async () => {
    getEstablishmentByCatalogSlug.mockRejectedValue({ response: { status: 500 } });
    mount(false, 'raizes-de-ouro');
    await screen.findByRole('heading', { name: 'Não foi possível carregar o catálogo' });
    expect(getEstablishment).not.toHaveBeenCalled();
    expect(getProductsByEstablishmentId).not.toHaveBeenCalled();
});
