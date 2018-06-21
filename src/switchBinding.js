import {getViewModelValue, resolveViewModelContext, resolveParamList} from './util';
import {createClonedElementCache, wrapCommentAround} from './commentWrapper';
import {renderIfBinding, removeIfBinding} from './renderIfBinding';
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

    let newExpression = getViewModelValue(viewModel, dataKey);
    if (typeof newExpression === 'function') {
        let viewModelContext = resolveViewModelContext(viewModel, newExpression);
        let paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        let args = paramList.slice(0);
        newExpression = newExpression.apply(viewModelContext, args);
    }

    if (newExpression === cache.elementData.expression) {
        return;
    }

    cache.elementData.expression = newExpression;

    // build switch cases if not yet defined
    if (!cache.cases) {
        let childrenElements = cache.el.children;
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
    }

    if (cache.cases.length) {
        // do switch operation - reuse if binding logic
        for (let j = 0, casesLength = cache.cases.length; j < casesLength; j += 1) {
            let newCaseValue;
            if (cache.cases[j].dataKey) {
                newCaseValue = getViewModelValue(viewModel, cache.cases[j].dataKey);
                if (typeof newCaseValue === 'function') {
                    let viewModelContext = resolveViewModelContext(viewModel, newCaseValue);
                    let paramList = paramList ? resolveParamList(viewModel, paramList) : [];
                    let args = paramList.slice(0);
                    newCaseValue = newCaseValue.apply(viewModelContext, args);
                }
                // set back to dataKey if nothing found in viewModel
                newCaseValue = newCaseValue || cache.cases[j].dataKey;
            }

            if (newCaseValue === cache.elementData.expression || cache.cases[j].isDefault) {
                // render cache.cases[j].fragment
                // render element
                renderIfBinding({
                    bindingData: cache.cases[j],
                    viewModel: viewModel,
                    bindingAttrs: bindingAttrs,
                });

                // remove other elements
                cache.cases.forEach((caseData, index) => {
                    if (index !== j) {
                        removeIfBinding(caseData);
                        // remove cache.IterationBindingCache
                        if (caseData.hasIterationBindingCache) {
                            caseData.iterationBindingCache = {};
                            caseData.hasIterationBindingCache = false;
                        }
                    }
                });

                break;
            }
        }
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
