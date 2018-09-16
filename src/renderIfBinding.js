import {isEmptyObject} from './util';
import {renderIteration} from './binder';
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
        let commentStartTextContent = bindingData.previousNonTemplateElement.textContent;
        let endCommentTag = bindingData.previousNonTemplateElement.nextSibling;

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
    // use fragment for create iterationBindingCache
    const rootElement = bindingData.fragment.firstChild.cloneNode(true);

    // remove current old DOM.
    if (!isDomRemoved) {
        removeIfBinding(bindingData);
    }

    // walk clonedElement to create iterationBindingCache
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
    insertRenderedElements(bindingData, rootElement);
};

const removeIfBinding = (bindingData) => {
    removeElemnetsByCommentWrap(bindingData);
    // remove cache.IterationBindingCache to prevent memory leak
    if (bindingData.hasIterationBindingCache) {
        bindingData.iterationBindingCache = {};
        bindingData.hasIterationBindingCache = false;
    }
};

export {renderIfBinding, removeIfBinding};
