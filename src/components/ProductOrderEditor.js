import React, { useRef, useState } from 'react';
import ProductCover from './ProductCover';
import { updateProductOrder } from '../services/productsService';

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });

export default function ProductOrderEditor({ products, establishmentID, onReload, onClose }) {
    const [draft, setDraft] = useState(() => [...products]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const locked = useRef(false);
    const dragged = useRef(null);
    const move = (from, to) => {
        if (locked.current || from === null || from < 0 || to < 0 || to >= draft.length) return;
        setDraft(previous => {
            const next = [...previous];
            next.splice(to, 0, next.splice(from, 1)[0]);
            return next;
        });
    };
    const sort = direction => {
        if (!locked.current) setDraft(previous => [...previous].sort((a, b) => direction * collator.compare(a.ProductName || '', b.ProductName || '')));
    };
    const save = async () => {
        if (locked.current) return;
        locked.current = true;
        setSaving(true);
        setMessage('Salvando ordem...');
        try {
            await updateProductOrder(establishmentID, draft.map(product => product.ProductID));
        } catch (error) {
            const status = error.response?.status;
            const responseData = error.response?.data;
            // Express retorna HTML quando a rota ainda não foi publicada.
            const missingRoute = status === 404 && typeof responseData === 'string'
                && /Cannot\s+PUT\s/i.test(responseData);
            if (missingRoute) {
                setMessage('O serviço de organização está indisponível no servidor. Tente novamente após a atualização do sistema. Suas alterações não foram salvas.');
                locked.current = false;
                setSaving(false);
                return;
            }
            if (status === 409) {
                await onReload('O catálogo mudou. Os produtos foram recarregados; refaça a ordenação.', 'warning');
                onClose();
                return;
            }
            setMessage(({ 400: 'Ordem inválida ou IDs repetidos. Verifique a lista e tente novamente.',
                401: 'Sua sessão expirou. Entre novamente para salvar a ordem.',
                403: 'Você não tem permissão para organizar estes produtos.',
                404: 'Estabelecimento não encontrado.' })[status] || 'Não foi possível salvar a ordem. Tente novamente.');
            locked.current = false;
            setSaving(false);
            return;
        }
        await onReload('Ordem salva com sucesso.', 'success');
        onClose();
    };
    return <section className="product-order-editor" aria-label="Organizar produtos" aria-busy={saving}>
        <button className="product-order-back" type="button" disabled={saving} onClick={onClose}>
            <span aria-hidden="true">←</span> Voltar para editar produtos
        </button>
        <header className="product-order-header">
            <div><p className="product-order-eyebrow">SEU CATÁLOGO, DO SEU JEITO</p>
                <h2>Organizar produtos</h2>
                <p>Escolha a sequência em que seus produtos aparecem no catálogo.</p>
            </div>
            <span className="product-order-count">{draft.length} produtos</span>
        </header>
        <div className="product-order-toolbar">
        <div className="product-order-sort"><span>Ordenar por nome</span>
            <div className="product-order-actions">
            <button type="button" disabled={saving} onClick={() => sort(1)}>A–Z</button>
            <button type="button" disabled={saving} onClick={() => sort(-1)}>Z–A</button>
            </div>
        </div>
        <div className="product-order-actions">
            <button className="product-order-save" type="button" disabled={saving} onClick={save}>{saving ? 'Salvando...' : 'Salvar ordem'}</button>
            <button type="button" disabled={saving} onClick={onClose}>Cancelar</button>
        </div>
        </div>
        <p className="product-order-hint"><span aria-hidden="true">↕</span> Arraste para reorganizar ou use as setas. A sequência vale para todos os grupos.</p>
        <p className="product-order-feedback" role="status" aria-live="polite">{message}</p>
        <ol className="product-order-list">
            {draft.map((product, index) => <li key={product.ProductID}
                draggable={!saving}
                onDragStart={event => { if (locked.current) { event.preventDefault(); return; } dragged.current = index; event.dataTransfer.setData('text/plain', String(product.ProductID)); }}
                onDragEnd={() => { dragged.current = null; }}
                onDragOver={event => { if (!locked.current) event.preventDefault(); }}
                onDrop={event => { event.preventDefault(); move(dragged.current, index); dragged.current = null; }}>
                <i className="product-order-grip" aria-hidden="true">⠿</i>
                <b className="product-order-position" aria-hidden="true">{index + 1}</b>
                <ProductCover product={product} className="product-order-cover" alt="" />
                <span className="product-order-name">{product.ProductName}</span>
                <div className="product-order-move">
                    <button type="button" aria-label={`Mover ${product.ProductName} para cima`} disabled={saving || index === 0} onClick={() => move(index, index - 1)}>↑</button>
                    <button type="button" aria-label={`Mover ${product.ProductName} para baixo`} disabled={saving || index === draft.length - 1} onClick={() => move(index, index + 1)}>↓</button>
                </div>
            </li>)}
        </ol>
        <p className="product-order-note">As alterações só aparecem no catálogo depois de salvar. Voltar ou cancelar descarta as mudanças desta organização.</p>
    </section>;
}
