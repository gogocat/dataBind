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
    // use fragment for binding, otherwise apply binding on existing element
    const rootElement = isDomRemoved ? bindingData.fragment.firstChild.cloneNode(true) : bindingData.el;

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

    // TODO: check logic here, it seems removed rendered DOM
    // remove current old DOM.
    if (!isDomRemoved) {
        removeIfBinding(bindingData);
    }
    // insert to new rendered DOM
    insertRenderedElements(bindingData, rootElement);
};

const removeIfBinding = (bindingData) => {
    removeElemnetsByCommentWrap(bindingData);
};

export {renderIfBinding, removeIfBinding};
