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

    let clonedElement = bindingData.fragment.firstChild.cloneNode(true);

    // TODO: Make parser stop parse chidren
    // walk clonedElement to create iterationBindingCache
    bindingData.iterationBindingCache = createBindingCache({
        rootNode: clonedElement,
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
    // insert to DOM
    insertRenderedElements(bindingData, clonedElement);
};

const removeIfBinding = ({bindingData, viewModel, bindingAttrs}) => {
    removeElemnetsByCommentWrap(bindingData);
};

export {createClonedElementCache, renderIfBinding, removeIfBinding};
