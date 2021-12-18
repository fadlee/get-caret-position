export declare const getSelectedTextNodes: () => {
    startContainer: Node;
    startOffset: number;
    endContainer: Node;
    endOffset: number;
    direction: boolean;
};
export declare const getFirstChildNode: (node: any) => any;
export declare const getLastChildNode: (node: any) => any;
export declare const splitValue: (originalValue: any, cursorPosition: any, trigger: any) => {
    textAfterTrigger: any;
    textUptoTrigger: any;
};
export declare const getCharHeight: (...elements: any[]) => number;
export declare const getComputedStyle: (element: any, style: any) => string;
export declare const getGlobalOffset: ($0: any) => {
    left: number;
    top: number;
};
export declare const getCursorPosition: (input: any) => any[];
export declare const getScrollLeftForInput: (input: any) => any;
