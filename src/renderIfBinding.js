import {isEmptyObject} from './util';
import {renderIteration} from './binder';
import createBindingCache from './domWalker';
import {
    // wrapCommentAround,
    removeElemnetsByCommentWrap,
    // removeDomTemplateElement,
    // setDocRangeEndAfter,
    insertRenderedElements,
} from './commentWrapper';

const createClonedElementCache = (bindingData, bindingAttrs) => {
    bindingData.el.removeAttribute(bindingAttrs.if);
    const clonedElement = bindingData.el.cloneNode(true);
    bindingData.fragment = document.createDocumentFragment();
    bindingData.fragment.appendChild(clonedElement);
    return bindingData;
};

const renderIfBinding = ({bindingData, viewModel, bindingAttrs}) => {
    if (!bindingData.fragment) {
        return;
    }
    // check dom has been removed
    const isDomRemoved = bindingData.nextNonTemplateElement.nextElementSibling === null;
    const rootElement = isDomRemoved ? bindingData.fragment.firstChild.cloneNode(true) : bindingData.el;

    // walk clonedElement to create iterationBindingCache
    bindingData.iterationBindingCache = createBindingCache({
        rootNode: rootElement,
        bindingAttrs: bindingAttrs,
    });

    // only render if has iterationBindingCache
    if (!isEmptyObject(bindingData.iterationBindingCache)) {
        renderIteration({
            elementCache: bindingData.iterationBindingCache,
            iterationVm: viewModel,
            bindingAttrs: bindingAttrs,
            isRegenerate: true,
        });
    }

    if (!isDomRemoved) {
        // remove orginal DOM
        removeIfBinding(bindingData);
        // insert to DOM
        insertRenderedElements(bindingData, rootElement);
    }
};

const removeIfBinding = (bindingData) => {
    removeElemnetsByCommentWrap(bindingData);
};

export {createClonedElementCache, renderIfBinding, removeIfBinding};
