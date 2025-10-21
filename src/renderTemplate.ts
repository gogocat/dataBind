import {dataIndexAttr} from './config';
import {
    createHtmlFragment,
    emptyElement,
    getViewModelPropValue,
    parseStringToJson,
    updateDomWithMinimalChanges,
} from './util';
import type {BindingCache, ViewModel, BindingAttrs, ElementCache, PlainObject} from './types';

let $domFragment: DocumentFragment | null = null;
let $templateRoot: HTMLElement | null = null;
let $templateRootPrepend = false;
let $templateRootAppend = false;
let nestTemplatesCount = 0;

/**
 * getTemplateString
 * @description get Template tag innerHTML string
 * @param {string} id
 * @return {string} rendered html string
 */
const getTemplateString = (id: string): string => {
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
const renderTemplate = (cache: BindingCache, viewModel: ViewModel, bindingAttrs: BindingAttrs, elementCache: ElementCache): void => {
    const settings = typeof cache.dataKey === 'string' ? parseStringToJson(cache.dataKey) : cache.dataKey as PlainObject;
    let viewData: unknown = (settings as PlainObject).data;
    const isAppend = (settings as PlainObject).append;
    const isPrepend = (settings as PlainObject).prepend;
    let $currentElement: DocumentFragment | HTMLElement;

    cache.dataKey = settings as unknown as string;

    viewData = (typeof viewData === 'undefined' || viewData === '$root') ?
        viewModel :
        getViewModelPropValue(viewModel, {
            dataKey: (settings as PlainObject).data,
            parameters: cache.parameters,
        } as BindingCache);

    if (!viewData) {
        return;
    }

    const $element = cache.el;
    const $indexAttr = $element.getAttribute(dataIndexAttr);
    const $index = typeof viewModel.$index !== 'undefined' ? viewModel.$index : ($indexAttr ? parseInt($indexAttr, 10) : undefined);

    if (typeof $index !== 'undefined' && viewData && typeof viewData === 'object') {
        (viewData as ViewModel).$index = $index;
    }

    $domFragment = $domFragment || document.createDocumentFragment();

    if (!$templateRoot) {
        $templateRoot = $element;
        // Store the prepend/append flags from the root template only
        $templateRootPrepend = Boolean(isPrepend);
        $templateRootAppend = Boolean(isAppend);
    }

    const htmlString = getTemplateString((settings as PlainObject).id as string);

    const htmlFragment = createHtmlFragment(htmlString);

    // Return early if htmlFragment is null (invalid template)
    if (!htmlFragment) {
        return;
    }

    // append rendered html
    if (!$domFragment.childNodes.length) {
        // domFragment should be empty in first run
        $currentElement = $domFragment; // copy of $domFragment for later find nested template check
        $domFragment.appendChild(htmlFragment);
    } else {
        // during recursive run keep append to current fragment
        // For nested templates, use the original behavior (clear and append)
        // because they may contain forOf bindings or other dynamic content
        // that manages its own DOM structure
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
    const $nestedTemplates = $currentElement.querySelectorAll(`[${  bindingAttrs.tmp  }]`);

    const nestedTemplatesLength = $nestedTemplates.length;

    if (nestedTemplatesLength) {
        nestTemplatesCount += nestedTemplatesLength;

        for (let i=0; i < nestedTemplatesLength; i+=1) {
            const thisTemplateCache = {
                el: $nestedTemplates[i] as HTMLElement,
                dataKey: $nestedTemplates[i].getAttribute(bindingAttrs.tmp),
            } as BindingCache;
            elementCache[bindingAttrs.tmp].push(thisTemplateCache);
            // recursive template render
            renderTemplate(thisTemplateCache, viewModel, bindingAttrs, elementCache);
            nestTemplatesCount -= 1;
        }
    }

    // no more nested tempalted to render, start to append $domFragment into $templateRoot
    if (nestTemplatesCount === 0) {
        // append to DOM once
        // Use the prepend/append flags from the root template, not the current nested template
        if (!$templateRootAppend && !$templateRootPrepend) {
            // Check if this is a re-render by looking for a marker attribute
            // This is more reliable than checking childNodes.length because templates
            // may have placeholder content
            const isRerender = $templateRoot.hasAttribute('data-template-rendered');

            if (isRerender) {
                // Re-render: Use minimal DOM updates to preserve unchanged elements
                // This is faster and preserves DOM state (focus, scroll, animations)
                updateDomWithMinimalChanges($templateRoot, $domFragment);
            } else {
                // Initial render: Clear any placeholder content and render fresh
                $templateRoot = emptyElement($templateRoot);
                $templateRoot.appendChild($domFragment);
                // Mark this template as rendered for future re-renders
                $templateRoot.setAttribute('data-template-rendered', 'true');
            }
        } else {
            // For prepend/append modes, use the original behavior
            if ($templateRootPrepend) {
                $templateRoot.insertBefore($domFragment, $templateRoot.firstChild);
            } else {
                $templateRoot.appendChild($domFragment);
            }
        }
        // clear cached fragment and flags
        $domFragment = $templateRoot = null;
        $templateRootPrepend = $templateRootAppend = false;
        // trigger callback if provided
        if (viewModel.afterTemplateRender && typeof viewModel.afterTemplateRender === 'function') {
            (viewModel.afterTemplateRender as Function)(viewData);
        }
    }
};

export default renderTemplate;
