// Only these formatting elements may be stored or displayed. No attributes survive.
const allowedTags = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'P', 'DIV', 'BR', 'UL', 'OL', 'LI', 'BLOCKQUOTE']);
const discardedTags = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'MATH', 'TEMPLATE']);

export function sanitizeDescription(html) {
    const source = document.createElement('template');
    source.innerHTML = String(html || '');
    const output = document.createElement('div');
    function copy(node, parent) {
        if (node.nodeType === 3) {
            parent.appendChild(document.createTextNode(node.textContent));
        } else if (node.nodeType === 1 && !discardedTags.has(node.tagName)) {
            const target = allowedTags.has(node.tagName)
                ? document.createElement(node.tagName.toLowerCase()) : parent;
            if (target !== parent) parent.appendChild(target);
            Array.from(node.childNodes).forEach(child => copy(child, target));
        }
    }
    Array.from(source.content.childNodes).forEach(node => copy(node, output));
    return output.innerHTML;
}

export function descriptionHtml(value) {
    const text = String(value || '');
    if (/<\/?(?:b|strong|i|em|u|s|strike|p|div|br|ul|ol|li|blockquote)\b[^>]*>/i.test(text)) {
        return sanitizeDescription(text);
    }
    const container = document.createElement('div');
    container.textContent = text;
    return container.innerHTML.replace(/\r?\n/g, '<br>');
}

export function descriptionText(value) {
    const container = document.createElement('div');
    container.innerHTML = descriptionHtml(value);
    container.querySelectorAll('br').forEach(node => node.replaceWith('\n'));
    container.querySelectorAll('p, div, li, blockquote').forEach(node => node.append('\n'));
    return container.textContent.trim();
}
