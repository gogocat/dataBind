import {dataIndexAttr} from './config';
import {
    createHtmlFragment,
    emptyElement,
    getViewModelPropValue,
    parseStringToJson,
} from './util';

let $domFragment = null;
let $templateRoot = null;
let nestTemplatesCount = 0;

/**
 * getTemplateString
 * @description get Template tag innerHTML string
 * @param {string} id
 * @return {string} rendered html string
 */
const getTemplateString = (id) => {
    const templateElement = document.getElementById(id);

    return templateElement ? templateElement.innerHTML : '';
};

/**
 * renderTemplate
 * @description
 * get template setting from DOM attribute then call compileTemplate
 * to render and append to target DOM
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {object} elementCache
 */
const renderTemplate = (cache, viewModel, bindingAttrs, elementCache) => {
    const settings = typeof cache.dataKey === 'string' ? parseStringToJson(cache.dataKey) : cache.dataKey;
    let viewData = settings.data;
    const isAppend = settings.append;
    const isPrepend = settings.prepend;
    let $currentElement;

    cache.dataKey = settings;

    viewData = (typeof viewData === 'undefined' || viewData === '$root') ?
        viewModel :
        getViewModelPropValue(viewModel, {
            dataKey: settings.data,
            parameters: cache.parameters,
        });

    if (!viewData) {
        return;
    }

    const $element = cache.el;
    const $index = typeof viewModel.$index !== 'undefined' ? viewModel.$index : $element.getAttribute(dataIndexAttr);

    if (typeof $index !== 'undefined') {
        viewData.$index = $index;
    }

    $domFragment = $domFragment || document.createDocumentFragment();

    $templateRoot = $templateRoot || $element;

    const htmlString = getTemplateString(settings.id);

    const htmlFragment = createHtmlFragment(htmlString);

    // append rendered html
    if (!$domFragment.childNodes.length) {
        // domFragment should be empty in first run
        $currentElement = $domFragment; // copy of $domFragment for later find nested template check
        $domFragment.appendChild(htmlFragment);
    } else {
        // during recursive run keep append to current fragment
        $currentElement = $element; // reset to current nested template element
        if (!isAppend && !isPrepend) {
            $currentElement = emptyElement($currentElement);
        }
        if (isPrepend) {
            $currentElement.insertBefore(htmlFragment, $currentElement.firstChild);
        } else {
            $currentElement.appendChild(htmlFragment);
        }
    }

    // check if there are nested template then recurisive render them
    const $nestedTemplates = $currentElement.querySelectorAll('[' + bindingAttrs.tmp + ']');

    const nestedTemplatesLength = $nestedTemplates.length;

    if (nestedTemplatesLength) {
        nestTemplatesCount += nestedTemplatesLength;

        for (let i=0; i < nestedTemplatesLength; i+=1) {
            const thisTemplateCache = {
                el: $nestedTemplates[i],
                dataKey: $nestedTemplates[i].getAttribute(bindingAttrs.tmp),
            };
            elementCache[bindingAttrs.tmp].push(thisTemplateCache);
            // recursive template render
            renderTemplate(thisTemplateCache, viewModel, bindingAttrs, elementCache);
            nestTemplatesCount -= 1;
        }
    }

    // no more nested tempalted to render, start to append $domFragment into $templateRoot
    if (nestTemplatesCount === 0) {
        // append to DOM once
        if (!isAppend && !isPrepend) {
            $templateRoot = emptyElement($templateRoot);
        }
        if (isPrepend) {
            $templateRoot.insertBefore($domFragment, $templateRoot.firstChild);
        } else {
            $templateRoot.appendChild($domFragment);
        }
        // clear cached fragment
        $domFragment = $templateRoot = null;
        // trigger callback if provided
        if (typeof viewModel.afterTemplateRender === 'function') {
            viewModel.afterTemplateRender(viewData);
        }
    }
};

export default renderTemplate;
