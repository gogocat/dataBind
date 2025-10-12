import {getViewModelPropValue} from './util';
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
const switchBinding = (cache: any, viewModel: any, bindingAttrs: any, forceRender?: any): void => {
    const dataKey = cache.dataKey;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};

    const newExpression = getViewModelPropValue(viewModel, cache);

    if (newExpression === cache.elementData.viewModelPropValue) {
        return;
    }

    cache.elementData.viewModelPropValue = newExpression;

    // build switch cases if not yet defined
    if (!cache.cases) {
        const childrenElements = cache.el.children;
        if (!childrenElements.length) {
            return;
        }
        cache.cases = [];
        for (let i = 0, elementLength = childrenElements.length; i < elementLength; i += 1) {
            let caseData: any = null;
            if (childrenElements[i].hasAttribute(bindingAttrs.case)) {
                caseData = createCaseData(childrenElements[i], bindingAttrs.case);
            } else if (childrenElements[i].hasAttribute(bindingAttrs.default)) {
                caseData = createCaseData(childrenElements[i], bindingAttrs.default);
                caseData.isDefault = true;
            }
            // create fragment by clone node
            // wrap with comment tag
            if (caseData) {
                wrapCommentAround(caseData, caseData.el);
                // remove binding attribute for later dataBind parse
                if (caseData.isDefault) {
                    caseData.el.removeAttribute(bindingAttrs.default);
                } else {
                    caseData.el.removeAttribute(bindingAttrs.case);
                }
                createClonedElementCache(caseData);
                cache.cases.push(caseData);
            }
        }
    }

    if (cache.cases.length) {
        let hasMatch = false;
        // do switch operation - reuse if binding logic
        for (let j = 0, casesLength = cache.cases.length; j < casesLength; j += 1) {
            let newCaseValue: any;
            if (cache.cases[j].dataKey) {
                // set back to dataKey if nothing found in viewModel
                newCaseValue = getViewModelPropValue(viewModel, cache.cases[j]) || cache.cases[j].dataKey;
            }

            if (newCaseValue === cache.elementData.viewModelPropValue || cache.cases[j].isDefault) {
                hasMatch = true;
                // render element
                renderIfBinding({
                    bindingData: cache.cases[j],
                    viewModel: viewModel,
                    bindingAttrs: bindingAttrs,
                });

                // remove other elements
                removeUnmatchCases(cache.cases, j);
                break;
            }
        }
        // no match remove all cases
        if (!hasMatch) {
            removeUnmatchCases(cache.cases);
        }
    }
};

function removeUnmatchCases(cases: any[], matchedIndex?: number): void {
    cases.forEach((caseData: any, index: number) => {
        if (index !== matchedIndex || typeof matchedIndex === 'undefined') {
            removeIfBinding(caseData);
            // remove cache.IterationBindingCache to prevent memory leak
            if (caseData.hasIterationBindingCache) {
                caseData.iterationBindingCache = null;
                caseData.hasIterationBindingCache = false;
            }
        }
    });
}

function createCaseData(node: any, attrName: string): any {
    const caseData = {
        el: node,
        dataKey: node.getAttribute(attrName),
        type: attrName,
    };
    return caseData;
}

export default switchBinding;
