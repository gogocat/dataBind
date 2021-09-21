import {isEmptyObject} from './util';
import renderIteration from './renderIteration';
import createBindingCache from './domWalker';
import {commentSuffix} from './config';
import {removeElemnetsByCommentWrap, insertRenderedElements} from './commentWrapper';

/**
 * isTargetDomRemoved
 * @description check if DOM between 'start' and 'end' comment tag has been removed
 * @param {object} bindingData
 * @return {boolean}
 */
const isTargetDomRemoved = (bindingData) => {
    let ret = false;
    if (bindingData && bindingData.previousNonTemplateElement) {
        const commentStartTextContent = bindingData.previousNonTemplateElement.textContent;
        const endCommentTag = bindingData.previousNonTemplateElement.nextSibling;

        if (endCommentTag.nodeType === 8) {
            if (endCommentTag.textContent === commentStartTextContent + commentSuffix) {
                ret = true;
            }
        }
    }
    return ret;
};

const renderIfBinding = ({bindingData, viewModel, bindingAttrs}) => {
    if (!bindingData.fragment) {
        return;
    }

    const isDomRemoved = isTargetDomRemoved(bindingData);
    let rootElement = bindingData.el;

    // remove current old DOM.
    // TODO: try preserve DOM
    if (!isDomRemoved && !bindingData.isOnce) {
        removeIfBinding(bindingData);
        // use fragment for create iterationBindingCache
        rootElement = bindingData.fragment.firstChild.cloneNode(true);
    }

    // walk clonedElement to create iterationBindingCache once
    if (!bindingData.iterationBindingCache || !bindingData.hasIterationBindingCache) {
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

    // insert to new rendered DOM
    // TODO: check unnecessary insertion when DOM is preserved
    insertRenderedElements(bindingData, rootElement);
};

const removeIfBinding = (bindingData) => {
    removeElemnetsByCommentWrap(bindingData);
    // remove cache.IterationBindingCache to prevent memory leak
    if (bindingData.hasIterationBindingCache) {
        delete bindingData.iterationBindingCache;
        delete bindingData.hasIterationBindingCache;
    }
};

export {
    renderIfBinding,
    removeIfBinding,
};
