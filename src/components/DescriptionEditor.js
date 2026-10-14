import React, { useEffect, useRef } from 'react';
import { descriptionHtml, sanitizeDescription } from '../utils/productDescription';
import '../styles/ProductDescription.css';

const commands = [
    ['bold', 'Negrito', 'B'], ['italic', 'Itálico', 'I'], ['underline', 'Sublinhado', 'U'],
    ['insertUnorderedList', 'Lista com marcadores', '• Lista'],
    ['insertOrderedList', 'Lista numerada', '1. Lista'],
    ['outdent', 'Diminuir recuo', '← Recuo'], ['indent', 'Aumentar recuo', 'Recuo →'],
    ['removeFormat', 'Limpar formatação', 'Limpar'],
];

export default function DescriptionEditor({ value, onChange, disabled = false, id = "product-description-editor", labelledBy = "product-description-label" }) {
    const editor = useRef(null);
    const selection = useRef(null);
    useEffect(() => {
        const html = descriptionHtml(value);
        if (sanitizeDescription(editor.current.innerHTML) !== html) editor.current.innerHTML = html;
    }, [value]);

    const rememberSelection = () => {
        const current = window.getSelection();
        if (current.rangeCount && editor.current.contains(current.anchorNode) && editor.current.contains(current.focusNode)) {
            selection.current = current.getRangeAt(0).cloneRange();
        }
    };
    const update = () => {
        onChange(sanitizeDescription(editor.current.innerHTML));
        rememberSelection();
    };
    const command = (name, argument = null) => {
        editor.current.focus();
        if (selection.current) {
            const current = window.getSelection();
            current.removeAllRanges();
            current.addRange(selection.current);
        }
        document.execCommand(name, false, argument);
        update();
    };

    return <div className="description-editor">
        <div className="description-toolbar" role="group" aria-label="Formatação da descrição">
            {commands.map(([name, label, text]) => <button key={name} disabled={disabled} type="button" title={label} aria-label={label}
                onMouseDown={event => event.preventDefault()} onClick={() => command(name)}>{text}</button>)}
        </div>
        <div ref={editor} id={id} className="description-editor-content formatted-description"
            contentEditable={!disabled} aria-disabled={disabled} suppressContentEditableWarning role="textbox" aria-multiline="true" aria-labelledby={labelledBy}
            onInput={update} onKeyUp={rememberSelection} onMouseUp={rememberSelection} onBlur={rememberSelection}
            onPaste={event => {
                event.preventDefault();
                const clipboard = event.clipboardData;
                command('insertHTML', clipboard.getData('text/html')
                    ? sanitizeDescription(clipboard.getData('text/html'))
                    : descriptionHtml(clipboard.getData('text/plain')));
            }}
            onDrop={event => event.preventDefault()}
        />
    </div>;
}
