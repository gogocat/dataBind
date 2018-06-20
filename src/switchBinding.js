import {getViewModelValue, resolveViewModelContext, resolveParamList} from './util';
import {createClonedElementCache, wrapCommentAround} from './commentWrapper';
/**
 * switch-Binding
 * @description
 * DOM decleartive switch binding.
 * switch parent element wrap direct child with case bindings
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const switchBinding = (cache, viewModel, bindingAttrs) => {
    let dataKey = cache.dataKey;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};

    let newValue = getViewModelValue(viewModel, dataKey);
    if (typeof newValue === 'function') {
        let viewModelContext = resolveViewModelContext(viewModel, newValue);
        let paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        let args = paramList.slice(0);
        newValue = newValue.apply(viewModelContext, args);
    }

    if (newValue === cache.elementData.expression) {
        return;
    }

    cache.elementData.expression = newValue;

    // build switch cases if not yet defined
    if (!cache.cases) {
        childrenElements = cache.el.children;
        if (!childrenElements.length) {
            return;
        }
        cache.cases = [];
        for (let i = 0, elementLength = childrenElements.length; i < elementLength; i += 1) {
            let caseData = null;
            if (childrenElements[i].hasAttribute(bindingAttrs.case)) {
                caseData = createCaseData(childrenElements[i], bindingAttrs.case);
            } else if (childrenElements[i].hasAttribute(bindingAttrs.default)) {
                caseData = createCaseData(childrenElements[i], bindingAttrs.default);
                caseData.isDefault = true;
            }
            if (caseData) {
                createClonedElementCache(caseData);
                wrapCommentAround(caseData, caseData.el);
                cache.cases.push(caseData);
            }
        }
    } else if (cache.cases.length) {
        // do switch operation - reuse if binding logic
        // TODO: use for loop so can break
        cache.cases.array.forEach((caseData) => {
            let newValue = getViewModelValue(viewModel, caseData.dataKey);
            if (typeof newValue === 'function') {
                let viewModelContext = resolveViewModelContext(viewModel, newValue);
                let paramList = paramList ? resolveParamList(viewModel, paramList) : [];
                let args = paramList.slice(0);
                newValue = newValue.apply(viewModelContext, args);
            }
        });
    }
};

function createCaseData(node, attrName) {
    let caseData = {
        el: node,
        dataKey: node.getAttribute(attrName),
        type: attrName,
    };
    return caseData;
}

export default switchBinding;
