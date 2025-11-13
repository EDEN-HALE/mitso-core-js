/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
}

Rectangle.prototype.getArea = function () {
  return this.width * this.height;
};

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj).replace(/\s/g, '');
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const data = JSON.parse(json);
  const obj = Object.create(proto);
  Object.assign(obj, data);
  return obj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const cssSelectorBuilder = (() => {
  class CssSelectorBuilder {
    constructor() {
      this.reset();
    }

    reset() {
      this.parts = {
        element: null,
        id: null,
        class: [],
        attr: [],
        pseudoClass: [],
        pseudoElement: null,
      };
      return this;
    }

    checkUniqueness(type) {
      const unique = ['element', 'id', 'pseudoElement'];
      if (unique.includes(type) && this.parts[type] !== null) {
        throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
      }
    }

    checkOrder(currentType) {
      const order = ['element', 'id', 'class', 'attr', 'pseudoClass', 'pseudoElement'];
      const currentIndex = order.indexOf(currentType);

      Object.entries(this.parts).forEach(([type, value]) => {
        if (value === null || (Array.isArray(value) && value.length === 0)) return;
        const typeIndex = order.indexOf(type);
        if (typeIndex === -1) return;
        if (typeIndex > currentIndex) {
          throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
        }
      });
    }

    element(name) {
      this.checkUniqueness('element');
      this.checkOrder('element');
      this.parts.element = name;
      return this;
    }

    id(name) {
      this.checkUniqueness('id');
      this.checkOrder('id');
      this.parts.id = name;
      return this;
    }

    class(name) {
      this.checkOrder('class');
      this.parts.class.push(name);
      return this;
    }

    attr(name) {
      this.checkOrder('attr');
      this.parts.attr.push(name);
      return this;
    }

    pseudoClass(name) {
      this.checkOrder('pseudoClass');
      this.parts.pseudoClass.push(name);
      return this;
    }

    pseudoElement(name) {
      this.checkUniqueness('pseudoElement');
      this.checkOrder('pseudoElement');
      this.parts.pseudoElement = name;
      return this;
    }

    stringify() {
      let result = '';
      if (this.parts.element) result += this.parts.element;
      if (this.parts.id) result += `#${this.parts.id}`;
      this.parts.class.forEach((c) => { result += `.${c}`; });
      this.parts.attr.forEach((a) => { result += `[${a}]`; });
      this.parts.pseudoClass.forEach((pc) => { result += `:${pc}`; });
      if (this.parts.pseudoElement) result += `::${this.parts.pseudoElement}`;
      return result;
    }

    static combine(selector1, combinator, selector2) {
      const left = selector1.stringify();
      const right = selector2.stringify();
      let combined;
      if (combinator === ' ') {
        combined = `${left}   ${right}`;
      } else {
        combined = `${left} ${combinator} ${right}`;
      }
      const builder = new CssSelectorBuilder();
      builder.stringify = () => combined;
      return builder;
    }
  }

  return {
    element: (name) => new CssSelectorBuilder().element(name),
    id: (name) => new CssSelectorBuilder().id(name),
    class: (name) => new CssSelectorBuilder().class(name),
    attr: (name) => new CssSelectorBuilder().attr(name),
    pseudoClass: (name) => new CssSelectorBuilder().pseudoClass(name),
    pseudoElement: (name) => new CssSelectorBuilder().pseudoElement(name),
    combine: CssSelectorBuilder.combine,
  };
})();

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
