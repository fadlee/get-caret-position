import { CLONE_PROPERTIES, POSITIONER_CHARACTER } from "./constants";
import { getCharHeight, getCursorPosition, getGlobalOffset, getScrollLeftForInput, getSelectedTextNodes, splitValue } from "./utils";


const getCaretPosition = (element, useClone: boolean = true, trigger?: string) => {
  if (useClone) {
    const [cursorPosition] = getCursorPosition(element);
    const { textAfterTrigger, textUptoTrigger } = splitValue(
      element.value,
      cursorPosition,
      trigger
    );

    // pre to retain special characters
    const clone = document.createElement("pre");
    clone.id = "getcaretposition-positionclone";

    const positioner = document.createElement("span");
    positioner.appendChild(document.createTextNode(POSITIONER_CHARACTER));

    const computed = window.getComputedStyle(element);
    CLONE_PROPERTIES.forEach((prop) => {
      clone.style[prop] = computed[prop];
    });

    const elementPosition = getGlobalOffset(element);
    clone.style.opacity = '0';
    clone.style.position = "absolute";
    clone.style.top = `${elementPosition.top}px`;
    clone.style.left = `${elementPosition.left}px`;
    document.body.appendChild(clone);

    if (element.scrollHeight > parseInt(computed.height)) {
      clone.style.overflowY = "scroll";
    } else {
      clone.style.overflow = "hidden";
    }

    // Extra styles for the clone depending on type of input
    let charHeight;
    if (element.tagName === "INPUT") {
      clone.appendChild(
        document.createTextNode(textUptoTrigger.replace(/ /g, "\u00A0"))
      );
      clone.appendChild(positioner);
      clone.appendChild(
        document.createTextNode(textAfterTrigger.replace(/ /g, "\u00A0"))
      );

      clone.style.overflowX = "auto";
      clone.style.whiteSpace = "nowrap";
      if (cursorPosition === element.value.length) {
        clone.scrollLeft = clone.scrollWidth - clone.clientWidth;
      } else {
        clone.scrollLeft = Math.min(
          getScrollLeftForInput(element),
          clone.scrollWidth - clone.clientWidth
        );
      }
      charHeight =
        clone.offsetHeight -
        parseFloat(computed.paddingTop) -
        parseFloat(computed.paddingBottom);
    } else {
      clone.appendChild(document.createTextNode(textUptoTrigger));
      clone.appendChild(positioner);
      clone.appendChild(document.createTextNode(textAfterTrigger));

      clone.style.maxWidth = "100%";
      clone.scrollTop = element.scrollTop;
      clone.scrollLeft = element.scrollLeft;
      charHeight = getCharHeight(clone, positioner);
    }

    const caretPosition = getGlobalOffset(positioner);
    const inputPosition = getGlobalOffset(element);

    caretPosition.top += charHeight - clone.scrollTop;
    caretPosition.left -= clone.scrollLeft;

    const diff = caretPosition.left - inputPosition.left;
    if (diff < 0 || diff > element.clientWidth)
      caretPosition.left = inputPosition.left;

    document.body.removeChild(clone);
    return caretPosition;
  } else {
    const { startContainer, startOffset, endContainer, endOffset } = window
      .getSelection()
      .getRangeAt(0);
    const {
      startContainer: containerTextNode,
      startOffset: cursorPosition,
      direction,
    } = getSelectedTextNodes();
    const { textAfterTrigger, textUptoTrigger } = splitValue(
      containerTextNode.nodeValue,
      cursorPosition,
      trigger
    );

    const parentNode = containerTextNode.parentNode;
    const referenceNode = containerTextNode.nextSibling;

    const positioner = document.createElement("span");
    positioner.appendChild(document.createTextNode(POSITIONER_CHARACTER));
    parentNode.insertBefore(positioner, referenceNode);

    if (textAfterTrigger) {
      containerTextNode.nodeValue = textUptoTrigger;
      const remainingTextNode = document.createTextNode(textAfterTrigger);
      parentNode.insertBefore(remainingTextNode, referenceNode);
    }

    const caretPosition = getGlobalOffset(positioner);
    const charHeight = getCharHeight(positioner);
    caretPosition.top += charHeight;

    // Reset DOM to the state before changes
    parentNode.removeChild(positioner);
    if (textAfterTrigger) {
      parentNode.removeChild(containerTextNode.nextSibling);
      containerTextNode.nodeValue = textUptoTrigger + textAfterTrigger;
    }

    const selection = window.getSelection();
    if (selection.setBaseAndExtent) {
      if (direction) {
        selection.setBaseAndExtent(
          startContainer,
          startOffset,
          endContainer,
          endOffset
        );
      } else {
        selection.setBaseAndExtent(
          endContainer,
          endOffset,
          startContainer,
          startOffset
        );
      }
    } else {
      const range = document.createRange();
      range.setStart(startContainer, startOffset);
      range.setEnd(endContainer, endOffset);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    return caretPosition;
  }
};

export {
  getCaretPosition
};
