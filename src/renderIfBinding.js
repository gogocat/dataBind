// import * as config from './config';
// import * as util from './util';
import {
    // wrapCommentAround,
    removeElemnetsByCommentWrap,
    // removeDomTemplateElement,
    // setDocRangeEndAfter,
    // insertRenderedElements,
} from './commentWrapper';

const createClonedElementCache = (bindingData) => {
    const clonedElement = bindingData.el.cloneNode(true);
    bindingData.fragment = document.createDocumentFragment();
    bindingData.fragment.appendChild(clonedElement);
    return bindingData;
};

const renderIfBinding = ({bindingData, viewModel, bindingAttrs}) => {
    // TODO: parse child and apply bindings
};

const removeIfBinding = ({bindingData, viewModel, bindingAttrs}) => {
    // TODO: should keep comment tag
    removeElemnetsByCommentWrap(bindingData);
};

export {createClonedElementCache, renderIfBinding, removeIfBinding};
