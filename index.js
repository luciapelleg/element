const { isArray } = Array;
const { stringify } = JSON;
const { assign } = Object;
const { ownKeys } = Reflect;

/**
 * @typedef {Object} Options
 * @property {Object} [aria] - An optional literal describing `aria` attributes such as `role` or `level` or `labelledby`.
 * @property {string} [class] - The optional class to set to the element. as `className`.
 * @property {string[]} [classList] - The optional class list to add to the element.
 * @property {Object} [data] - An optional literal describing `dataset` properties.
 * @property {string} [html] - The optional html to set to the element. as `innerHTML`.
 * @property {string} [text] - The optional text to set to the element. as `textContent`.
 * @property {string} [style] - The optional style to apply to the element.
 * @property {(string | Element | SVGElement)[]} [childNodes] - An optional list of child nodes to append to the element.
 * @property {(string | Element | SVGElement)[]} [children] - An optional list of child nodes to append to the element.
 */

/**
 * @param {string | Element | SVGElement} tag - The tag name of the element to create or the element to use. If the name starts with `<`, it will be treated as a query selector and the first matching element will be used, if any.
 * @param {Options} options - The options object.
 * @returns
 */
export default (tag, options = {}) => {
  let node;
  // if `tag` is a string, create a new element, or ...
  if (typeof tag === 'string') {
    // if tag starts with `<`, use querySelector instead
    if (tag.startsWith('<')) {
      node = document.querySelector(tag.slice(1));
      // return null if no node is found
      if (!node) return null;
    }
    else {
      // create either an SVG or HTML element
      // for svg it's either `svg` itself or `svg:` followed by the tag name
      const isSVG = tag === 'svg';
      const isNS = isSVG || tag.startsWith('svg:');
      node = isNS ?
        document.createElementNS(
          'http://www.w3.org/2000/svg',
          isSVG ? tag : tag.slice(4),
        ) :
        (options.is ?
          document.createElement(tag, { is: options.is }) :
          document.createElement(tag))
      ;
    }
  }
  // otherwise, use the provided node
  else node = tag;

  // loop through options keys and symbols
  for (let key of ownKeys(options)) {
    let value = options[key];
    // if `key` is `children` or `childNodes`, append the values to the node
    if (key === 'children' || key === 'childNodes') {
      node.append(...value);
      continue;
    }
    // if `key` is not a node known property ...
    if (!(key in node)) {
      // handle with ease intents: `aria`, `data`, `style`, `html`, `text`
      switch (key) {
        case 'aria': {
          for (let k of ownKeys(value)) {
            node.setAttribute(
              k === 'role' ? k : `aria-${k.toLowerCase()}`,
              value[k],
            );
          }
          continue;
        }
        case 'data': {
          assign(node.dataset, value);
          continue;
        }
        case 'style': {
          if (isSVG) node.setAttribute('style', value);
          else node.style.cssText = value;
          continue;
        }
        case 'class': {
          key = 'className';
          break;
        }
        case 'html': {
          key = 'innerHTML';
          break;
        }
        case 'text': {
          key = 'textContent';
          break;
        }
      }
    }
    // if `key` is a node known property ...
    if (key in node) {
      switch (key) {
        case 'classList': {
          node.classList.add(...value);
          break;
        }
        default: {
          // try to set the value directly
          try {
            node[key] = value;
          }
          // otherwise set the value as attribute (svg friendly)
          catch {
            node.setAttribute(key, value);
          }
        }
      }
      continue;
    }

    // uhtml / lit style attributes hints friendly
    switch (true) {
      case key.startsWith('?'):
        value = !!value;
      case key.startsWith('@'): {
        key = key.slice(1);
        // allow passing options within the listener
        if (isArray(value)) {
          node.addEventListener(key, ...value);
          continue;
        }
        break;
      }
    }
  
    // decide what to do by inferring the value type
    switch (typeof value) {
      // toggle boolean attributes
      case 'boolean': {
        node.toggleAttribute(key, value);
        continue;
      }
      // ignore `null` or `undefined`
      case 'undefined':
      case 'object': {
        if (!value) continue;
        // yet consider `handleEvent` as a function
        if (typeof value.handleEvent !== 'function') {
          // otherwise, stringify the value as JSON
          value = stringify(value);
          break;
        }
      }
      // listeners as functions or handleEvent based references
      case 'function': {
        node.addEventListener(key, value);
        continue;
      }
    }
    // last resort: set the value as attribute
    node.setAttribute(key, value);
  }

  return node;
};
