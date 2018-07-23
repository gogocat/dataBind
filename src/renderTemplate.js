import {dataIndexAttr} from './config';
import {parseStringToJson, getViewModelValue} from './util';

let $domFragment = null;
let $templateRoot = null;
let nestTemplatesCount = 0;
let templateCache = {};

/**
 * compileTemplate
 * @description compile underscore template and store in templateCache
 * @param {string} id
 * @param {object} templateData
 * @return {string} rendered html string
 */
const compileTemplate = (id, templateData = null) => {
    let templateString;
    let templateElement;

    if (!templateCache[id]) {
        templateElement = document.getElementById(id);
        templateString = templateElement ? templateElement.innerHTML : '';
        templateCache[id] = _.template(templateString, {
            variable: 'data',
        });
    }

    return templateCache[id](templateData);
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
    let settings = typeof cache.dataKey === 'string' ? parseStringToJson(cache.dataKey) : cache.dataKey;
    let viewData = settings.data;
    let isAppend = settings.append;
    let isPrepend = settings.prepend;
    let html;
    let $element;
    let $index;
    let $currentElement;
    let $nestedTemplates;

    cache.dataKey = settings;

    if (typeof viewData === 'undefined' || viewData === '$root') {
        viewData = viewModel;
    } else {
        viewData = getViewModelValue(viewModel, settings.data);
    }

    if (typeof viewData === 'function') {
        viewData = viewData();
    }

    if (!viewData) {
        return;
    }

    $element = $(cache.el);
    $index = typeof viewModel.$index !== 'undefined' ? viewModel.$index : $element.attr(dataIndexAttr);
    if (typeof $index !== 'undefined') {
        viewData.$index = $index;
    }
    $domFragment = $domFragment ? $domFragment : $('<div/>');
    $templateRoot = $templateRoot ? $templateRoot : $element;
    html = compileTemplate(settings.id, viewData);

    // domFragment should be empty in first run
    // append rendered html
    if (!$domFragment.children().length) {
        $currentElement = $domFragment;
        $domFragment.append(html);
    } else {
        $currentElement = $element;
        $currentElement.append(html);
    }

    // check if there are nested template then recurisive render them
    $nestedTemplates = $currentElement.find('[' + bindingAttrs.tmp + ']');

    if ($nestedTemplates.length) {
        nestTemplatesCount += $nestedTemplates.length;
        $nestedTemplates.each(function(index, element) {
            let thisTemplateCache = {
                el: element,
                dataKey: element.getAttribute(bindingAttrs.tmp),
            };
            elementCache[bindingAttrs.tmp].push(thisTemplateCache);
            // recursive template render
            renderTemplate(thisTemplateCache, viewModel, bindingAttrs, elementCache);
            nestTemplatesCount -= 1;
        });
    }

    // no more nested tempalted to render, start to append $domFragment into $templateRoot
    if (nestTemplatesCount === 0) {
        // append to DOM once
        if (!isAppend && !isPrepend) {
            $templateRoot.empty();
        }
        if (isPrepend) {
            $templateRoot.prepend($domFragment.html());
        } else {
            $templateRoot.append($domFragment.html());
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
