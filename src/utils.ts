export const getSelectedTextNodes = () => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  let { startContainer, startOffset, endContainer, endOffset } = range;
  const direction =
    selection.anchorNode === startContainer &&
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

  return { startContainer, startOffset, endContainer, endOffset, direction };
};

export const getFirstChildNode = (node) => {
  let nextNode = node;
  while (nextNode.firstChild) nextNode = nextNode.firstChild;
  return nextNode;
};

export const getLastChildNode = (node) => {
  let nextNode = node;
  while (nextNode.lastChild) nextNode = nextNode.lastChild;
  return nextNode;
};

export const splitValue = (originalValue, cursorPosition, trigger) => {
  const value = originalValue.slice(0, cursorPosition);
  let textAfterTrigger = value.split(trigger || /\W/).pop();
  const textUptoTrigger = textAfterTrigger.length
    ? value.slice(0, 0 - textAfterTrigger.length)
    : value;
  textAfterTrigger += originalValue.slice(cursorPosition);
  return { textAfterTrigger, textUptoTrigger };
};

export const getCharHeight = (...elements) => {
  return Math.max(
    ...elements.map((element) =>
      parseFloat(getComputedStyle(element, "line-height"))
    )
  );
};

export const getComputedStyle = (element, style) => {
  return window.getComputedStyle(element).getPropertyValue(style);
};

export const getGlobalOffset = ($0) => {
  let node = $0,
    top = 0,
    left = 0;

  do {
    left += node.offsetLeft;
    top += node.offsetTop;
  } while ((node = node.offsetParent));

  return { left, top };
};

export const getCursorPosition = function getCursorPosition(input) {
  return [input.selectionStart, input.selectionEnd].sort(function (a, b) {
    return a - b;
  });
};

export const getScrollLeftForInput = function getScrollLeftForInput(input) {
  if (input.createTextRange) {
    var range = input.createTextRange();
    var inputStyle = window.getComputedStyle(input);
    var paddingLeft = parseFloat(inputStyle.paddingLeft);
    var rangeRect = range.getBoundingClientRect();
    return (
      input.getBoundingClientRect().left +
      input.clientLeft +
      paddingLeft -
      rangeRect.left
    );
  } else {
    return input.scrollLeft;
  }
};
