import React, { useState, useEffect } from 'react';
import '../styles/Modal.css';
import './../styles/Orders.css'

const ConfirmationModal = ({ show, onClose, onConfirm, message }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>{message}</p>
                <div style={{ marginTop: '20px' }}>
                    <button onClick={onConfirm} style={{ marginRight: '10px' }}>
                        Confirmar
                    </button>
                    <button onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

const OrderDetailModal = ({
                              order,
                              show,
                              onClose,
                              orderStatus,
                              setOrderStatus,
                              onUpdateStatus,
      batchPreview,
      onBuildPreviewTable,
      onBuildPreviewTableCustomer,
      onConfirmBatchPay,
      onClearBatchPreview,
                              establishmentName,
}) => {

// Confirmações genéricas (cancelar ou pagar)
    const [confirmCfg, setConfirmCfg] = useState({
        show: false,
        nextStatus: null,
        message: '',
    });
    const [showPrintAsk, setShowPrintAsk] = useState(false);

    const [selectedStatus, setSelectedStatus] = useState(orderStatus);

    // ... seus useState aqui ...

    const STATUS_PT = {
        Pending: 'Pendente',
        'In Progress': 'Em andamento',
        Completed: 'Concluído',
        Paid: 'Pago',
        Cancelled: 'Cancelado',
        Canceled: 'Cancelado',
    };

    const translateStatus = (s) => STATUS_PT[String(s || '').trim()] || s;
    const translateStatusText = (txt) => {
        let out = String(txt || '');
        for (const [en, pt] of Object.entries(STATUS_PT)) {
            out = out.replaceAll(new RegExp(`\\b${en}\\b`, 'g'), pt);
        }
        return out;
    };
    const isCancelled = (s) => ['Cancelled', 'Canceled'].includes(String(s || '').trim());

    useEffect(() => {
        console.log("STATUS REAL:", order?.Status || 'Status não disponível');

        if (orderStatus) {
            setSelectedStatus(orderStatus);
        }
    }, [orderStatus]);

    if (!show || !order) return null;
// === Modo preview (lote) ===
    const isBatch = !!batchPreview;
    const batchOrders = batchPreview?.orders || [];
    const idsBatch = batchOrders.map(o => o.OrderID);

// util para remover vazios/duplicados e normalizar
    const uniq = (arr) =>
        [...new Set((arr || []).map(x => (x || '').toString().trim()).filter(Boolean))];

    const namesBatch = uniq(batchOrders.map(o => o.CustomerName));
    const phonesBatch = uniq(batchOrders.map(o => o.CustomerPhone || 'Não informado'));
    const obsBatch = uniq(batchOrders.map(o => o.Observation || 'Nenhuma'));

    const totalBatch = batchOrders.reduce((acc, o) => acc + Number(o.TotalAmount || 0), 0);

// itens com referência do pedido
    const itemsBatch = batchOrders.flatMap(o =>
        (o.items || []).map(it => ({ ...it, _orderId: o.OrderID }))
    );

    const getStatusOptions = (currentStatus) => {
        switch (currentStatus) {
            case 'Pending':
                return [
                    { value: 'In Progress', label: 'Em andamento' },
                    { value: 'Cancelled', label: 'Cancelado' },
                ];
            case 'In Progress':
                return [
                    { value: 'Completed', label: 'Concluído' },
                    { value: 'Cancelled', label: 'Cancelado' },
                ];
            case 'Completed':
                return [{ value: 'Paid', label: 'Pago' }];
            case 'Cancelled':
                return []; // Não há opções após 'Cancelled'
            default:
                return [];
        }
    };

    const statusOptions = getStatusOptions(orderStatus);

    const handleStatusChange = (status) => {
        if (status === 'Cancelled') {
            setConfirmCfg({
                show: true,
                nextStatus: 'Cancelled',
                message: 'Tem certeza que deseja cancelar este pedido?',
            });
        } else if (status === 'Paid') {
            setConfirmCfg({
                show: true,
                nextStatus: 'Paid',
                message: 'Deseja confirmar o pagamento?',
            });
        } else {
            updateStatus(status);
        }
    };


    const updateStatus = (status) => {
        setOrderStatus(status); // Atualiza o estado global
        onUpdateStatus(status); // Passa o status atualizado ao backend
    };

    const handleConfirmStatus = () => {
        setConfirmCfg((prev) => ({ ...prev, show: false }));
        if (confirmCfg.nextStatus) {
            updateStatus(confirmCfg.nextStatus);
        }
    };
    const formatBRL = (v) =>
        Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Abre um HTML em nova aba, sem bloquear a aba principal
    const openReceiptHtml = (html) => {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const w = window.open(
            url,
            '_blank',
            'noopener,width=480,height=700,left=100,top=100'
        );
        if (w) {
            w.opener = null;
            // libera a URL do blob quando carregar
            w.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
        }
    };


    const printSingleReceipt = () => {
        if (!order) return;

        const dateStr = new Date(order.CreatedAt).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        });

        const lines = (order.items || []).map(it => `
    <tr>
      <td style="text-align:left">${it.ProductName}</td>
      <td style="text-align:right">${formatBRL(it.UnitPrice)}</td>
    </tr>
  `).join('') || `<tr><td colspan="2" style="text-align:center">Sem itens</td></tr>`;

        const html = `
<html>
  <head>
    <meta charset="utf-8" />
    <title>Recibo do Pedido</title>
    <style>
      @page { size: 80mm auto; margin: 8mm; }
      body { font-family: Arial, sans-serif; font-size: 12px; }
      .center { text-align: center; }
      .mb8 { margin-bottom: 8px; }
      .mb12 { margin-bottom: 12px; }
      table { width: 100%; border-collapse: collapse; }
      tfoot td { border-top: 1px dashed #999; padding-top: 6px; }
      .toolbar {
        position: sticky; top: 0; background: #fff; padding: 8px 0; margin-bottom: 8px;
        border-bottom: 1px solid #eee; display: flex; gap: 8px; justify-content: center;
      }
      @media print { .toolbar { display: none; } }
      button { padding: 6px 10px; border-radius: 6px; border: 1px solid #ccc; cursor: pointer; }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <button onclick="window.print()">Imprimir</button>
      <button onclick="window.close()">Fechar</button>
    </div>

    <div class="center mb8"><strong>${establishmentName || 'Estabelecimento'}</strong></div>
    <div class="center mb12">RECIBO - Pedido #${order.OrderID}</div>

    <div>Data: ${dateStr}</div>
    <div>Mesa: ${order.TableNumber ?? 'N/A'} | Cliente: ${order.CustomerName ?? '—'}</div>

    <table style="margin-top: 10px">
      <tbody>
        ${lines}
      </tbody>
      <tfoot>
        <tr>
          <td style="text-align:left"><strong>Total</strong></td>
          <td style="text-align:right"><strong>${formatBRL(order.TotalAmount)}</strong></td>
        </tr>
      </tfoot>
    </table>

    <div class="center" style="margin-top:12px">Obrigado pela preferência!</div>
  </body>
</html>
`;

        openReceiptHtml(html);


    };



    const printBatchReceiptGroup = () => {
        const ordersToPrint = batchOrders;
        if (!ordersToPrint.length) return;

        const titleScope = batchPreview?.scope ? `– ${batchPreview.scope}` : '';

        const itemsHTML = ordersToPrint.map(o => {
            const dateStr = new Date(o.CreatedAt).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short'
            });

            const lines = (o.items || []).map(it => `
      <tr>
        <td style="text-align:left">(#${o.OrderID}) ${it.ProductName}</td>
        <td style="text-align:right">${formatBRL(it.UnitPrice)}</td>
      </tr>
    `).join('') || `<tr><td colspan="2" style="text-align:center">Sem itens</td></tr>`;

            return `
      <div style="margin-bottom:10px">
        <div><strong>Pedido #${o.OrderID}</strong> — ${dateStr}</div>
        <div>Mesa: ${o.TableNumber ?? 'N/A'} | Cliente: ${o.CustomerName ?? '—'}</div>
        <table style="width:100%; border-collapse:collapse; margin-top:6px">
          <tbody>${lines}</tbody>
          <tfoot>
            <tr>
              <td style="text-align:left"><strong>Subtotal</strong></td>
              <td style="text-align:right"><strong>${formatBRL(o.TotalAmount)}</strong></td>
            </tr>
          </tfoot>
        </table>
        <div style="border-top:1px dashed #999; margin:8px 0"></div>
      </div>
    `;
        }).join('');

        const total = ordersToPrint.reduce((acc, o) => acc + Number(o.TotalAmount || 0), 0);

        const html = `
<html>
  <head>
    <meta charset="utf-8" />
    <title>Recibo Geral</title>
    <style>
      @page { size: 80mm auto; margin: 8mm; }
      body { font-family: Arial, sans-serif; font-size: 12px; }
      .center { text-align: center; }
      .mb8 { margin-bottom: 8px; }
      .mb12 { margin-bottom: 12px; }
      .toolbar {
        position: sticky; top: 0; background: #fff; padding: 8px 0; margin-bottom: 8px;
        border-bottom: 1px solid #eee; display: flex; gap: 8px; justify-content: center;
      }
      @media print { .toolbar { display: none; } }
      button { padding: 6px 10px; border-radius: 6px; border: 1px solid #ccc; cursor: pointer; }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <button onclick="window.print()">Imprimir</button>
      <button onclick="window.close()">Fechar</button>
    </div>

    <div class="center mb8"><strong>${establishmentName || 'Estabelecimento'}</strong></div>
    <div class="center mb12">RECIBO GERAL ${titleScope}</div>
    ${itemsHTML}
    <div class="center"><strong>Total Geral: ${formatBRL(total)}</strong></div>
    <div class="center" style="margin-top:8px">Obrigado pela preferência!</div>
  </body>
</html>
`;

        openReceiptHtml(html);


    };

    return (
        <div className="modal-overlay">
            <div className="orderdetailmodal-content">
                <button className="orderdetailmodal-close-button" onClick={onClose}>×</button>
                <h2 className="orderdetailmodal-title">
                    {isBatch
                        ? idsBatch.map(id => `Pedido #${id}`).join(', ')
                        : `Pedido #${order.OrderID}`}
                </h2>

                <div className="orderdetailmodal-section">
                    <div className="orderdetailmodal-row">
                        <label>Cliente:</label>
                        <span>
      {isBatch ? namesBatch.join(', ') : (order.CustomerName || '—')}
    </span>
                    </div>

                    <div className="orderdetailmodal-row">
                        <label>Contato:</label>
                        <span>
      {isBatch ? phonesBatch.join(', ') : (order.CustomerPhone || 'Não informado')}
    </span>
                    </div>

                    <div className="orderdetailmodal-row">
                        <label>Mesa:</label>
                        <span>{order.TableNumber ?? 'Sem número'}</span>
                    </div>

                    <div className="orderdetailmodal-row">
                        <label>Observação:</label>
                        <span>
      {isBatch ? obsBatch.join(', ') : (order.Observation || 'Nenhuma')}
    </span>
                    </div>

                    {/* Datas */}
                    {!isBatch ? (
                        <div className="orderdetailmodal-row">
                            <label>Data do Pedido:</label>
                            <span>
        {new Date(order.CreatedAt).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        })}
      </span>
                        </div>
                    ) : (
                        <div className="orderdetailmodal-row" style={{display: 'block'}}>
                            <label>Datas dos Pedidos:</label>
                            <ul style={{margin: '6px 0 0 0', paddingLeft: '18px'}}>
                                {batchOrders.map(o => (
                                    <li key={o.OrderID}>
                                        Data do Pedido #{o.OrderID}:{' '}
                                        {new Date(o.CreatedAt).toLocaleString('pt-BR', {
                                            dateStyle: 'short',
                                            timeStyle: 'short',
                                        })}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="orderdetailmodal-row">
                        <label>Total:</label>
                        <span>
      {isBatch
          ? totalBatch.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
          : Number(order.TotalAmount || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
      }
    </span>
                    </div>
                </div>

                <h3 className="orderdetailmodal-subtitle">Itens do Pedido</h3>
                <ul className="orderdetailmodal-items-list">
                    {!isBatch ? (
                        order.items?.length ? (
                            order.items.map((item) => (
                                <li key={item.OrderItemID}>
                                    <span>{item.ProductName}</span> — {' '}
                                    {Number(item.UnitPrice || 0).toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                    })}
                                </li>
                            ))
                        ) : (
                            <p>Sem itens neste pedido.</p>
                        )
                    ) : (
                        itemsBatch.length ? (
                            itemsBatch.map((item, idx) => (
                                <li key={`${item._orderId}-${item.OrderItemID || idx}`}>
                                    <span>(#{item._orderId}) {item.ProductName}</span> — {' '}
                                    {Number(item.UnitPrice || 0).toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                    })}
                                </li>
                            ))
                        ) : (
                            <p>Sem itens nos pedidos selecionados.</p>
                        )
                    )}
                </ul>


                {/* ALTERAR STATUS (apenas no modo individual) */}
                {!isBatch && (
                    <>
                        <h3 className="orderdetailmodal-subtitle">Alterar Status</h3>
                        <div className="orderdetailmodal-status-buttons">
                            {getStatusOptions(orderStatus).map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleStatusChange(option.value)}
                                    className={`orderdetailmodal-status-button status-${option.value.replace(/\s+/g, '').toLowerCase()}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {/* Fechamento em lote (constroi preview) */}
                        {order.Status !== 'Paid' && order.Status !== 'Cancelled' && (
                            <>
                                <h3 className="orderdetailmodal-subtitle">Fechar Conta (opções)</h3>
                                <div className="orderdetailmodal-status-buttons">
                                    <button
                                        className="orderdetailmodal-status-button status-paid"
                                        onClick={onBuildPreviewTable}
                                        title="Pré-visualiza todos os pedidos elegíveis desta mesa (exceto cancelados e pagos)"
                                    >
                                        Fechar todas as contas da mesa (prévia)
                                    </button>

                                    <button
                                        className="orderdetailmodal-status-button status-paid"
                                        onClick={onBuildPreviewTableCustomer}
                                        title="Pré-visualiza todos os pedidos elegíveis desta mesa deste cliente (exceto cancelados e pagos)"
                                    >
                                        Fechar todas as contas da mesa ({order.TableNumber || '—'}) de
                                        ({order.CustomerName || '—'}) (prévia)
                                    </button>
                                </div>

                            </>
                        )}
                    </>
                )}

                {/* MODO LOTE: CONFIRMAR OU CANCELAR */}
                {isBatch && (
                    <>
                        <h3 className="orderdetailmodal-subtitle">Fechamento em lote</h3>
                        <div className="orderdetailmodal-status-buttons">
                            <button
                                className="orderdetailmodal-status-button status-paid"
                                onClick={async () => {
                                    await onConfirmBatchPay(idsBatch);
                                    setShowPrintAsk(true); // exibe a pergunta de impressão
                                }}
                            >
                                Confirmar fechamento ({idsBatch.length} pedidos)
                            </button>

                            <button
                                className="orderdetailmodal-status-button status-cancelled"
                                onClick={onClearBatchPreview}
                            >
                                Cancelar agrupamento
                            </button>
                            <button
                                className="orderdetailmodal-status-button status-paid"
                                onClick={printBatchReceiptGroup}
                                title="Imprime o recibo com todos os pedidos do agrupamento"
                            >
                                Imprimir recibo do agrupamento
                            </button>

                        </div>
                    </>
                )}

                {!isBatch && !isCancelled(order.Status) && (
                    <>
                        <h3 className="orderdetailmodal-subtitle">Recibo</h3>
                        <div className="orderdetailmodal-status-buttons">
                            <button
                                className="orderdetailmodal-status-button status-paid"
                                onClick={printSingleReceipt}
                                title="Imprime o recibo deste pedido"
                            >
                                Imprimir recibo (pedido #{order.OrderID})
                            </button>
                        </div>
                    </>
                )}

                {showPrintAsk && (
                    <div style={{ marginTop: 12, padding: 10, border: '1px solid #e0e0e0', borderRadius: 8 }}>
                        <p style={{ margin: 0, marginBottom: 8 }}>
                            Fechamento concluído. Deseja imprimir o recibo agora?
                        </p>
                        <div className="orderdetailmodal-status-buttons">
                            <button
                                className="orderdetailmodal-status-button status-paid"
                                onClick={printBatchReceiptGroup}
                            >
                                Imprimir agora
                            </button>
                            <button
                                className="orderdetailmodal-status-button status-cancelled"
                                onClick={() => { setShowPrintAsk(false); onClearBatchPreview(); }}
                            >
                                Não, obrigado
                            </button>
                        </div>
                    </div>
                )}


                <h3 className="orderdetailmodal-subtitle">Histórico de Status</h3>

                {!isBatch ? (
                    <ul className="orderdetailmodal-status-history">
                        {order.statusHistory?.length ? (
                            order.statusHistory.map((history) => (
                                <li key={history.StatusHistoryID}>
                                    <span>{translateStatusText(history.StatusDescription)}</span> —{' '}
                                    {new Date(history.UpdatedAt).toLocaleString('pt-BR', {
                                        dateStyle: 'short',
                                        timeStyle: 'short',
                                    })}
                                </li>
                            ))
                        ) : (
                            <p>Sem histórico de status para este pedido.</p>
                        )}
                    </ul>
                ) : (
                    <>
                        {batchOrders.map(o => (
                            <div key={`hist-${o.OrderID}`} style={{marginBottom: '10px'}}>
                                <strong>Histórico de Status #{o.OrderID}:</strong>
                                <ul className="orderdetailmodal-status-history" style={{marginTop: '6px'}}>
                                    {o.statusHistory?.length ? (
                                        o.statusHistory.map((h) => (
                                            <li key={`${o.OrderID}-${h.StatusHistoryID}`}>
                                                <span>{translateStatusText(h.StatusDescription)}</span> —{' '}
                                                {new Date(h.UpdatedAt).toLocaleString('pt-BR', {
                                                    dateStyle: 'short',
                                                    timeStyle: 'short',
                                                })}
                                            </li>
                                        ))
                                    ) : (
                                        <li>Sem histórico para este pedido.</li>
                                    )}

                                </ul>
                            </div>
                        ))}
                    </>
                )}


                <ConfirmationModal
                    show={confirmCfg.show}
                    onClose={() => setConfirmCfg((prev) => ({ ...prev, show: false }))}
                    onConfirm={handleConfirmStatus}
                    message={confirmCfg.message}
                />

            </div>
        </div>
    );
};

export default OrderDetailModal;
