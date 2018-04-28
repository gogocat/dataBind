// import * as config from './config';
// import * as util from './util';
import {
    wrapCommentAround,
    /*
    removeElemnetsByCommentWrap,
    removeDomTemplateElement,
    setDocRangeEndAfter,
    insertRenderedElements,
    */
} from './commentWrapper';

const createClonedElementCache = (bindingData) => {
    const clonedElement = bindingData.el.cloneNode(true);
    bindingData.fragment = document.createDocumentFragment();
    bindingData.fragment.appendChild(clonedElement);
    return bindingData;
};

const renderIfBinding = ({bindingData, viewModel, bindingAttrs}) => {
    if (!bindingData.fragment) {
        createClonedElementCache(bindingData);
        wrapCommentAround(bindingData, bindingData.el);
    }
    // TODO:
    // generate new element from cloned html in bindingData.fragment
    // update binding cache and render element
};

const removeIfBinding = ({bindingData, viewModel, bindingAttrs}) => {
    if (!bindingData.fragment) {
        createClonedElementCache(bindingData);
        wrapCommentAround(bindingData, bindingData.el);
    }
    bindingData.el.remove();
};

export {renderIfBinding, removeIfBinding};
