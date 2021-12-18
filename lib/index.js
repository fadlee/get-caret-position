(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.getCaretPosition = {}));
})(this, (function (exports) { 'use strict';

    // Invisible character
    var POSITIONER_CHARACTER = "\ufeff";
    var CLONE_PROPERTIES = [
        'direction',
        'boxSizing',
        'width',
        'height',
        'overflowX',
        'overflowY',
        'borderTopWidth',
        'borderRightWidth',
        'borderBottomWidth',
        'borderLeftWidth',
        'borderStyle',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        // https://developer.mozilla.org/en-US/docs/Web/CSS/font
        'fontStyle',
        'fontVariant',
        'fontWeight',
        'fontStretch',
        'fontSize',
        'fontSizeAdjust',
        'lineHeight',
        'fontFamily',
        'textAlign',
        'textTransform',
        'textIndent',
        'textDecoration',
        'letterSpacing',
        'wordSpacing',
        'tabSize',
        'MozTabSize',
        'whiteSpace',
        'wordWrap',
        'wordBreak'
    ];

    var getSelectedTextNodes = function () {
        var selection = window.getSelection();
        var range = selection.getRangeAt(0);
        var startContainer = range.startContainer, startOffset = range.startOffset, endContainer = range.endContainer, endOffset = range.endOffset;
        var direction = selection.anchorNode === startContainer &&
            selection.anchorOffset === startOffset;
        if (startContainer.nodeType !== startContainer.TEXT_NODE) {
            startContainer = startContainer.childNodes[startOffset - 1];
            if (startContainer) {
                startContainer = getLastChildNode(startContainer);
                startOffset = startContainer.nodeValue
                    ? startContainer.nodeValue.length
                    : 0;
            }
        }
        if (endContainer.nodeType !== endContainer.TEXT_NODE) {
            endContainer = endContainer.childNodes[endOffset];
            if (endContainer) {
                endContainer = getFirstChildNode(endContainer);
                endOffset = 0;
            }
        }
        return { startContainer: startContainer, startOffset: startOffset, endContainer: endContainer, endOffset: endOffset, direction: direction };
    };
    var getFirstChildNode = function (node) {
        var nextNode = node;
        while (nextNode.firstChild)
            nextNode = nextNode.firstChild;
        return nextNode;
    };
    var getLastChildNode = function (node) {
        var nextNode = node;
        while (nextNode.lastChild)
            nextNode = nextNode.lastChild;
        return nextNode;
    };
    var splitValue = function (originalValue, cursorPosition, trigger) {
        var value = originalValue.slice(0, cursorPosition);
        var textAfterTrigger = value.split(trigger || /\W/).pop();
        var textUptoTrigger = textAfterTrigger.length
            ? value.slice(0, 0 - textAfterTrigger.length)
            : value;
        textAfterTrigger += originalValue.slice(cursorPosition);
        return { textAfterTrigger: textAfterTrigger, textUptoTrigger: textUptoTrigger };
    };
    var getCharHeight = function () {
        var elements = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            elements[_i] = arguments[_i];
        }
        return Math.max.apply(Math, elements.map(function (element) {
            return parseFloat(getComputedStyle(element, "line-height"));
        }));
    };
    var getComputedStyle = function (element, style) {
        return window.getComputedStyle(element).getPropertyValue(style);
    };
    var getGlobalOffset = function ($0) {
        var node = $0, top = 0, left = 0;
        do {
            left += node.offsetLeft;
            top += node.offsetTop;
        } while ((node = node.offsetParent));
        return { left: left, top: top };
    };
    var getCursorPosition = function getCursorPosition(input) {
        return [input.selectionStart, input.selectionEnd].sort(function (a, b) {
            return a - b;
        });
    };
    var getScrollLeftForInput = function getScrollLeftForInput(input) {
        if (input.createTextRange) {
            var range = input.createTextRange();
            var inputStyle = window.getComputedStyle(input);
            var paddingLeft = parseFloat(inputStyle.paddingLeft);
            var rangeRect = range.getBoundingClientRect();
            return (input.getBoundingClientRect().left +
                input.clientLeft +
                paddingLeft -
                rangeRect.left);
        }
        else {
            return input.scrollLeft;
        }
    };

    var getCaretPosition = function (element, useClone, trigger) {
        if (useClone === void 0) { useClone = true; }
        if (useClone) {
            var cursorPosition = getCursorPosition(element)[0];
            var _a = splitValue(element.value, cursorPosition, trigger), textAfterTrigger = _a.textAfterTrigger, textUptoTrigger = _a.textUptoTrigger;
            // pre to retain special characters
            var clone_1 = document.createElement("pre");
            clone_1.id = "getcaretposition-positionclone";
            var positioner = document.createElement("span");
            positioner.appendChild(document.createTextNode(POSITIONER_CHARACTER));
            var computed_1 = window.getComputedStyle(element);
            CLONE_PROPERTIES.forEach(function (prop) {
                clone_1.style[prop] = computed_1[prop];
            });
            var elementPosition = getGlobalOffset(element);
            clone_1.style.opacity = '0';
            clone_1.style.position = "absolute";
            clone_1.style.top = "".concat(elementPosition.top, "px");
            clone_1.style.left = "".concat(elementPosition.left, "px");
            document.body.appendChild(clone_1);
            if (element.scrollHeight > parseInt(computed_1.height)) {
                clone_1.style.overflowY = "scroll";
            }
            else {
                clone_1.style.overflow = "hidden";
            }
            // Extra styles for the clone depending on type of input
            var charHeight = void 0;
            if (element.tagName === "INPUT") {
                clone_1.appendChild(document.createTextNode(textUptoTrigger.replace(/ /g, "\u00A0")));
                clone_1.appendChild(positioner);
                clone_1.appendChild(document.createTextNode(textAfterTrigger.replace(/ /g, "\u00A0")));
                clone_1.style.overflowX = "auto";
                clone_1.style.whiteSpace = "nowrap";
                if (cursorPosition === element.value.length) {
                    clone_1.scrollLeft = clone_1.scrollWidth - clone_1.clientWidth;
                }
                else {
                    clone_1.scrollLeft = Math.min(getScrollLeftForInput(element), clone_1.scrollWidth - clone_1.clientWidth);
                }
                charHeight =
                    clone_1.offsetHeight -
                        parseFloat(computed_1.paddingTop) -
                        parseFloat(computed_1.paddingBottom);
            }
            else {
                clone_1.appendChild(document.createTextNode(textUptoTrigger));
                clone_1.appendChild(positioner);
                clone_1.appendChild(document.createTextNode(textAfterTrigger));
                clone_1.style.maxWidth = "100%";
                clone_1.scrollTop = element.scrollTop;
                clone_1.scrollLeft = element.scrollLeft;
                charHeight = getCharHeight(clone_1, positioner);
            }
            var caretPosition = getGlobalOffset(positioner);
            var inputPosition = getGlobalOffset(element);
            caretPosition.top += charHeight - clone_1.scrollTop;
            caretPosition.left -= clone_1.scrollLeft;
            var diff = caretPosition.left - inputPosition.left;
            if (diff < 0 || diff > element.clientWidth)
                caretPosition.left = inputPosition.left;
            document.body.removeChild(clone_1);
            return caretPosition;
        }
        else {
            var _b = window
                .getSelection()
                .getRangeAt(0), startContainer = _b.startContainer, startOffset = _b.startOffset, endContainer = _b.endContainer, endOffset = _b.endOffset;
            var _c = getSelectedTextNodes(), containerTextNode = _c.startContainer, cursorPosition = _c.startOffset, direction = _c.direction;
            var _d = splitValue(containerTextNode.nodeValue, cursorPosition, trigger), textAfterTrigger = _d.textAfterTrigger, textUptoTrigger = _d.textUptoTrigger;
            var parentNode = containerTextNode.parentNode;
            var referenceNode = containerTextNode.nextSibling;
            var positioner = document.createElement("span");
            positioner.appendChild(document.createTextNode(POSITIONER_CHARACTER));
            parentNode.insertBefore(positioner, referenceNode);
            if (textAfterTrigger) {
                containerTextNode.nodeValue = textUptoTrigger;
                var remainingTextNode = document.createTextNode(textAfterTrigger);
                parentNode.insertBefore(remainingTextNode, referenceNode);
            }
            var caretPosition = getGlobalOffset(positioner);
            var charHeight = getCharHeight(positioner);
            caretPosition.top += charHeight;
            // Reset DOM to the state before changes
            parentNode.removeChild(positioner);
            if (textAfterTrigger) {
                parentNode.removeChild(containerTextNode.nextSibling);
                containerTextNode.nodeValue = textUptoTrigger + textAfterTrigger;
            }
            var selection = window.getSelection();
            if (selection.setBaseAndExtent) {
                if (direction) {
                    selection.setBaseAndExtent(startContainer, startOffset, endContainer, endOffset);
                }
                else {
                    selection.setBaseAndExtent(endContainer, endOffset, startContainer, startOffset);
                }
            }
            else {
                var range = document.createRange();
                range.setStart(startContainer, startOffset);
                range.setEnd(endContainer, endOffset);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            return caretPosition;
        }
    };

    exports.getCaretPosition = getCaretPosition;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
