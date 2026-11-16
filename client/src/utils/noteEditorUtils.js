const allowedNoteTags = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'DIV', 'EM', 'H1', 'H2',
  'FONT', 'H3', 'H4', 'HR', 'I', 'IMG', 'LI', 'MATH', 'MFRAC', 'MI', 'MN',
  'MO', 'MROW', 'MSQRT', 'MSUB', 'MSUBSUP', 'MSUP', 'MTEXT', 'OL', 'P',
  'PRE', 'S', 'SPAN', 'STRONG', 'TABLE', 'TBODY', 'TD', 'TH', 'THEAD',
  'TR', 'U', 'UL'
]);

const blockedNoteTags = new Set([
  'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH'
]);

const legacyFontSizes = {
  1: '10px',
  2: '13px',
  3: '16px',
  4: '18px',
  5: '24px',
  6: '32px',
  7: '48px'
};

const mathSymbols = {
  alpha: ['mi', 'α'],
  beta: ['mi', 'β'],
  gamma: ['mi', 'γ'],
  delta: ['mi', 'δ'],
  theta: ['mi', 'θ'],
  lambda: ['mi', 'λ'],
  mu: ['mi', 'μ'],
  pi: ['mi', 'π'],
  sigma: ['mi', 'σ'],
  phi: ['mi', 'φ'],
  omega: ['mi', 'ω'],
  infty: ['mi', '∞'],
  sum: ['mo', '∑'],
  prod: ['mo', '∏'],
  int: ['mo', '∫'],
  times: ['mo', '×'],
  cdot: ['mo', '·'],
  pm: ['mo', '±'],
  leq: ['mo', '≤'],
  geq: ['mo', '≥'],
  neq: ['mo', '≠'],
  approx: ['mo', '≈'],
  rightarrow: ['mo', '→'],
  leftarrow: ['mo', '←']
};

export function escapeHtml(value) {
  const escapedCharacters = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return value.replace(/[&<>"']/g, (character) => escapedCharacters[character]);
}

export function safeWebUrl(value) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  try {
    const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmedValue)
      || trimmedValue.startsWith('//');
    const isRelativeUrl = trimmedValue.startsWith('/')
      || trimmedValue.startsWith('#');
    const urlValue = hasScheme || isRelativeUrl
      ? trimmedValue
      : `https://${trimmedValue}`;
    const parsedUrl = new URL(urlValue, window.location.origin);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }

    return parsedUrl.href;
  } catch {
    return null;
  }
}

export function renderLatexMath(expression) {
  let position = 0;

  function parseSequence(stopAtClosingBrace = false) {
    const nodes = [];

    while (position < expression.length) {
      const character = expression[position];

      if (character === '}' && stopAtClosingBrace) {
        position += 1;
        break;
      }

      if (/\s/.test(character)) {
        position += 1;
        continue;
      }

      if ((character === '^' || character === '_') && nodes.length > 0) {
        position += 1;
        const previousNode = nodes.pop();
        const argument = parseArgument();
        const scriptedNode = previousNode.base
          ? previousNode
          : { base: previousNode, sub: null, sup: null };

        if (character === '^') {
          scriptedNode.sup = argument;
        } else {
          scriptedNode.sub = argument;
        }

        nodes.push(scriptedNode);
        continue;
      }

      nodes.push(parseAtom());
    }

    return nodes;
  }

  function parseArgument() {
    if (expression[position] === '{') {
      position += 1;
      return {
        tag: 'mrow',
        children: parseSequence(true)
      };
    }

    return parseAtom();
  }

  function parseAtom() {
    const character = expression[position];

    if (character === '{') {
      return parseArgument();
    }

    if (character === '\\') {
      return parseCommand();
    }

    if (/[0-9]/.test(character)) {
      return parseNumber();
    }

    if (/[a-zA-Z]/.test(character)) {
      return parseIdentifier();
    }

    position += 1;
    const tag = '=+-*/<>()[\\],|'.includes(character) ? 'mo' : 'mtext';
    return { tag, text: character };
  }

  function parseCommand() {
    position += 1;
    const command = expression.slice(position).match(/^[a-zA-Z]+/)?.[0];

    if (!command) {
      position += 1;
      return { tag: 'mo', text: expression[position - 1] };
    }

    position += command.length;

    if (command === 'frac') {
      return {
        tag: 'mfrac',
        children: [parseArgument(), parseArgument()]
      };
    }

    if (command === 'sqrt') {
      return { tag: 'msqrt', children: [parseArgument()] };
    }

    if (command === 'text') {
      return { tag: 'mtext', children: [parseArgument()] };
    }

    const symbol = Object.prototype.hasOwnProperty.call(mathSymbols, command)
      ? mathSymbols[command]
      : null;
    if (symbol) {
      return { tag: symbol[0], text: symbol[1] };
    }

    return { tag: 'mtext', text: command };
  }

  function parseNumber() {
    const number = expression.slice(position).match(/^\d+(?:\.\d+)?/)[0];
    position += number.length;
    return { tag: 'mn', text: number };
  }

  function parseIdentifier() {
    const identifier = expression.slice(position).match(/^[a-zA-Z]+/)[0];
    position += identifier.length;
    return { tag: 'mi', text: identifier };
  }

  function serializeNode(node) {
    if (node.base) {
      const base = serializeNode(node.base);

      if (node.sub && node.sup) {
        return `<msubsup>${base}${serializeNode(node.sub)}${serializeNode(node.sup)}</msubsup>`;
      }

      if (node.sub) {
        return `<msub>${base}${serializeNode(node.sub)}</msub>`;
      }

      return `<msup>${base}${serializeNode(node.sup)}</msup>`;
    }

    const contents = node.children
      ? node.children.map(serializeNode).join('')
      : escapeHtml(node.text || '');

    return `<${node.tag}>${contents}</${node.tag}>`;
  }

  const mathNodes = parseSequence();
  return `<math>${mathNodes.map(serializeNode).join('')}</math>`;
}

export function sanitizeNoteHtml(content) {
  if (!content) return '';

  const contentIsHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  const htmlToParse = contentIsHtml
    ? content
    : `<p>${escapeHtml(content).replace(/\r?\n/g, '<br>')}</p>`;
  const parsedDocument = new DOMParser().parseFromString(htmlToParse, 'text/html');

  function cleanNode(parentNode) {
    [...parentNode.childNodes].forEach((childNode) => {
      if (childNode.nodeType !== Node.ELEMENT_NODE) return;

      const tagName = childNode.tagName.toUpperCase();

      if (!allowedNoteTags.has(tagName)) {
        if (blockedNoteTags.has(tagName)) {
          childNode.remove();
          return;
        }

        cleanNode(childNode);
        childNode.replaceWith(...childNode.childNodes);
        return;
      }

      cleanAllowedElement(childNode, tagName);
    });
  }

  function cleanAllowedElement(element, tagName) {
    const href = tagName === 'A' ? element.getAttribute('href') : null;
    const src = tagName === 'IMG' ? element.getAttribute('src') : null;
    const inlineStyle = element.getAttribute('style');
    const fontColor = tagName === 'FONT' ? element.getAttribute('color') : null;
    const fontSize = tagName === 'FONT' ? element.getAttribute('size') : null;
    const fontSizeInPixels = legacyFontSizes[fontSize];
    const textAlignment = element.getAttribute('align');

    [...element.attributes].forEach((attribute) => element.removeAttribute(attribute.name));

    if (tagName === 'A') {
      const safeHref = safeWebUrl(href || '');
      if (safeHref) {
        element.setAttribute('href', safeHref);
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      }
    }

    if (tagName === 'IMG') {
      const safeSrc = safeWebUrl(src || '');
      if (!safeSrc) {
        element.remove();
        return;
      }

      element.setAttribute('src', safeSrc);
      element.setAttribute('alt', '');
    }

    const stylesToKeep = [inlineStyle];
    if (fontColor) stylesToKeep.push(`color:${fontColor}`);
    if (fontSizeInPixels) stylesToKeep.push(`font-size:${fontSizeInPixels}`);
    if (textAlignment) stylesToKeep.push(`text-align:${textAlignment}`);
    cleanElementStyles(element, stylesToKeep.filter(Boolean).join(';'));
    cleanNode(element);
  }

  function cleanElementStyles(element, style) {
    if (!style) return;

    const safeStyles = style.split(';').filter((declaration) => {
      const [property, value] = declaration.split(':');
      const propertyName = property?.trim().toLowerCase();
      const propertyValue = value?.trim() || '';
      const isTableStructure = ['TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD']
        .includes(element.tagName);
      const isColorProperty = propertyName === 'color'
        || (propertyName === 'background-color' && !isTableStructure);
      const isSafeColor = /^(#[\da-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i
        .test(propertyValue);
      const isSafeFontSize = propertyName === 'font-size'
        && /^(10|13|16|18|24|32|48)px$/i.test(propertyValue);
      const isSafeTextAlignment = propertyName === 'text-align'
        && ['left', 'center', 'right', 'justify'].includes(propertyValue.toLowerCase());

      return (isColorProperty && isSafeColor)
        || isSafeFontSize
        || isSafeTextAlignment;
    });

    if (safeStyles.length > 0) {
      element.setAttribute('style', safeStyles.join(';'));
    }
  }

  cleanNode(parsedDocument.body);
  return parsedDocument.body.innerHTML;
}
