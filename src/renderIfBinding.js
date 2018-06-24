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

const renderIfBinding = ({bindingData, viewModel, bindingAttrs}) => {
    if (!bindingData.fragment) {
        return;
    }
    // check dom next to start comment has been removed
    const isDomRemoved = bindingData.previousNonTemplateElement.nextElementSibling === null;
    const rootElement = isDomRemoved ? bindingData.fragment.firstChild.cloneNode(true) : bindingData.el;

    // walk clonedElement to create iterationBindingCache
    if (!bindingData.iterationBindingCache) {
        bindingData.iterationBindingCache = createBindingCache({
            rootNode: rootElement,
            bindingAttrs: bindingAttrs,
        });
    }

    // only render if has iterationBindingCache
    // means has other dataBindings to be render
    if (!isEmptyObject(bindingData.iterationBindingCache)) {
        bindingData.hasIterationBindingCache = true;
        renderIteration({
            elementCache: bindingData.iterationBindingCache,
            iterationVm: viewModel,
            bindingAttrs: bindingAttrs,
            isRegenerate: true,
        });
    }

    // remove orginal DOM.
    if (!isDomRemoved) {
        removeIfBinding(bindingData);
    }
    // insert to DOM
    insertRenderedElements(bindingData, rootElement);
};

const removeIfBinding = (bindingData) => {
    removeElemnetsByCommentWrap(bindingData);
};

export {renderIfBinding, removeIfBinding};
