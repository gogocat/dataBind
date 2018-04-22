/* eslint-disable no-invalid-this */
import * as config from './config';
import * as util from './util';
import renderForOfBinding from './forOfBinding';

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
    let settings = util.parseStringToJson(cache.dataKey);
    let viewData = settings.data === '$root' ? viewModel : util.getViewModelValue(viewModel, settings.data);
    let isAppend = settings.append;
    let isPrepend = settings.prepend;
    let html;
    let $element;
    let $index;
    let $currentElement;
    let $nestedTemplates;

    if (!viewData) {
        return;
    }

    $element = $(cache.el);
    $index = typeof viewModel.$index !== 'undefined' ? viewModel.$index : $element.attr(config.dataIndexAttr);
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

/**
 * clickBinding
 * @description
 * DOM decleartive click event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const clickBinding = (cache, viewModel, bindingAttrs) => {
    let handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let handlerFn;
    let viewModelContext;

    if (!handlerName) {
        return;
    }

    handlerFn = util.getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = util.resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? util.resolveParamList(viewModel, paramList) : [];
        $(cache.el)
            .off('click.databind')
            .on('click.databind', function(e) {
                let args = [e, $(this)].concat(paramList);
                handlerFn.apply(viewModelContext, args);
            });
    }
};

/**
 * dblclickBinding
 * DOM decleartive double click event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const dblclickBinding = (cache, viewModel, bindingAttrs) => {
    let handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let handlerFn;
    let viewModelContext;

    if (!handlerName) {
        return;
    }

    handlerFn = util.getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = util.resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? util.resolveParamList(viewModel, paramList) : [];
        $(cache.el)
            .off('dblclick.databind')
            .on('dblclick.databind', function(e) {
                let args = [e, $(this)].concat(paramList);
                handlerFn.apply(viewModelContext, args);
            });
    }
};

/**
 * blurBinding
 * DOM decleartive on blur event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const blurBinding = (cache, viewModel, bindingAttrs) => {
    let handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let handlerFn;
    let viewModelContext;

    if (!handlerName) {
        return;
    }

    handlerFn = util.getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = util.resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? util.resolveParamList(viewModel, paramList) : [];

        $(cache.el)
            .off('blur.databind')
            .on('blur.databind', function(e) {
                let args = [e, $(this)].concat(paramList);
                handlerFn.apply(viewModelContext, args);
            });
    }
};

/**
 * focusBinding
 * DOM decleartive on focus event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const focusBinding = (cache, viewModel, bindingAttrs) => {
    let handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let handlerFn;
    let viewModelContext;

    if (!handlerName) {
        return;
    }

    handlerFn = util.getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = util.resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? util.resolveParamList(viewModel, paramList) : [];
        $(cache.el)
            .off('focus.databind')
            .on('focus.databind', function(e) {
                let args = [e, $(this)].concat(paramList);
                handlerFn.apply(viewModelContext, args);
            });
    }
};

/**
 * changeBinding
 * @description input element on change event binding. DOM -> viewModel update
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const changeBinding = (cache, viewModel, bindingAttrs) => {
    let handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let modelDataKey = cache.el.getAttribute(bindingAttrs.model);
    let handlerFn;
    let newValue;
    let oldValue;
    let viewModelContext;

    if (!handlerName) {
        return;
    }

    handlerFn = util.getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = util.resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? util.resolveParamList(viewModel, paramList) : [];

        // assing on change event
        $(cache.el)
            .off('change.databind')
            .on('change.databind', function(e) {
                let $this = $(this);
                let isCheckbox = $this.is(':checkbox');
                newValue = isCheckbox ? $this.prop('checked') : _.escape($this.val());
                // set data to viewModel
                if (modelDataKey) {
                    oldValue = util.getViewModelValue(viewModel, modelDataKey);
                    util.setViewModelValue(viewModel, modelDataKey, newValue);
                }
                let args = [e, $this, newValue, oldValue].concat(paramList);
                handlerFn.apply(viewModelContext, args);
                oldValue = newValue;
            });
    }
};

/**
 * modelBinding
 * @description input element data binding. viewModel -> DOM update
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const modelBinding = (cache, viewModel, bindingAttrs) => {
    let dataKey = cache.dataKey;
    let newValue;

    if (!dataKey) {
        return;
    }

    newValue = util.getViewModelValue(viewModel, dataKey);

    if (typeof newValue !== 'undefined' && newValue !== null) {
        let $element = $(cache.el);
        let isCheckbox = $element.is(':checkbox');
        let isRadio = $element.is(':radio');
        let inputName = $element[0].name;
        let $radioGroup = isRadio ? $('input[name="' + inputName + '"]') : null;
        let oldValue = isCheckbox ? $element.prop('checked') : $element.val();

        // update element value
        if (newValue !== oldValue) {
            if (isCheckbox) {
                $element.prop('checked', Boolean(newValue));
            } else if (isRadio) {
                $radioGroup.val([newValue]);
            } else {
                $element.val(newValue);
            }
        }
    }
};

/**
 * submitBinding
 * @description on form submit binding. pass current form data as json object to handler
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const submitBinding = (cache, viewModel, bindingAttrs) => {
    let handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let handlerFn;
    let $element;
    let viewModelContext;

    if (!handlerName) {
        return;
    }

    handlerFn = util.getViewModelValue(viewModel, handlerName);
    $element = $(cache.el);

    if (typeof handlerFn === 'function') {
        viewModelContext = util.resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? util.resolveParamList(viewModel, paramList) : [];
        // assing on change event
        $element.off('submit.databind').on('submit.databind', function(e) {
            let args = [e, $element, util.getFormData($element)].concat(paramList);
            handlerFn.apply(viewModelContext, args);
        });
    }
};

/**
 * textBinding
 * * @description
 * DOM decleartive text binding update dom textnode with viewModel data
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const textBinding = (cache, viewModel, bindingAttrs) => {
    let dataKey = cache.dataKey;
    let paramList = cache.parameters;
    let viewModelContext;

    if (!dataKey) {
        return;
    }

    let newValue = util.getViewModelValue(viewModel, dataKey);
    if (typeof newValue === 'function') {
        viewModelContext = util.resolveViewModelContext(viewModel, newValue);
        paramList = paramList ? util.resolveParamList(viewModel, paramList) : [];
        let args = paramList.slice(0);
        newValue = newValue.apply(viewModelContext, args);
    }
    let oldValue = cache.el.textContent;

    if (typeof newValue !== 'undefined' && typeof newValue !== 'object' && newValue !== null) {
        if (newValue !== oldValue) {
            cache.el.textContent = newValue;
        }
    }
};

/**
 * showBinding
 * @description
 * DOM decleartive show binding. Make binding show/hide according to viewModel data (boolean)
 * viewModel data can function but must return boolean
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const showBinding = (cache, viewModel, bindingAttrs) => {
    let dataKey = cache.dataKey;
    let paramList = cache.parameters;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};

    let $element = $(cache.el);
    let oldShowStatus = cache.elementData.showStatus;
    let isInvertBoolean = dataKey.charAt(0) === '!';
    let shouldShow;
    let viewModelContext;

    dataKey = isInvertBoolean ? dataKey.substring(1) : dataKey;
    shouldShow = util.getViewModelValue(viewModel, dataKey);

    // do nothing if data in viewModel is undefined
    if (typeof shouldShow !== 'undefined' && shouldShow !== null) {
        if (typeof shouldShow === 'function') {
            viewModelContext = util.resolveViewModelContext(viewModel, dataKey);
            paramList = paramList ? util.resolveParamList(viewModel, paramList) : [];
            let args = [oldShowStatus, $element].concat(paramList);
            shouldShow = shouldShow.apply(viewModelContext, args);
        }

        shouldShow = Boolean(shouldShow);

        // reject if nothing changed
        if (oldShowStatus === shouldShow) {
            return;
        }

        // store new show status
        cache.elementData.showStatus = shouldShow;

        // reverse if has '!' expression from DOM deceleration
        if (isInvertBoolean) {
            shouldShow = !shouldShow;
        }
        if (!shouldShow) {
            $element.hide();
        } else {
            $element.show();
        }
    }
};

/**
 * cssBinding
 * @description
 * DOM decleartive css binding. update classlist.
 * viewModel data can function but must return JSOL.
 * added css class if value is true
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const cssBinding = (cache, viewModel, bindingAttrs) => {
    let dataKey = cache.dataKey;
    let paramList = cache.parameters;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};
    cache.elementData.cssList = cache.elementData.cssList || '';

    let $element = $(cache.el);
    let oldCssList = cache.elementData.cssList;
    let newCssList = '';
    let vmCssListObj = util.getViewModelValue(viewModel, dataKey);
    let vmCssListArray;
    let isViewDataObject = false;
    let isViewDataString = false;
    let domCssList;
    let cssList = [];
    let viewModelContext;

    if (typeof vmCssListObj === 'function') {
        viewModelContext = util.resolveViewModelContext(viewModel, dataKey);
        paramList = paramList ? util.resolveParamList(viewModel, paramList) : [];
        let args = [oldCssList, $element].concat(paramList);
        vmCssListObj = vmCssListObj.apply(viewModelContext, args);
    }

    if (typeof vmCssListObj === 'string') {
        isViewDataString = true;
    } else if (util.isPlainObject(vmCssListObj)) {
        isViewDataObject = true;
    } else {
        // reject if vmCssListObj is not an object or string
        return;
    }

    if (isViewDataObject) {
        newCssList = JSON.stringify(vmCssListObj);
    } else {
        newCssList = vmCssListObj.replace(/\s\s+/g, ' ').trim();
        vmCssListArray = newCssList.split(' ');
    }
    // reject if nothing changed
    if (oldCssList === newCssList) {
        return;
    }

    // get current css classes from element
    domCssList = cache.el.classList;
    // clone domCssList as new array
    let domCssListLength = domCssList.length;
    for (let i = 0; i < domCssListLength; i += 1) {
        cssList.push(domCssList[i]);
    }

    if (isViewDataObject) {
        // TODO: optimise this use pure js loop
        $.each(vmCssListObj, function(k, v) {
            let i = cssList.indexOf(k);
            if (v === true) {
                cssList.push(k);
            } else if (i !== -1) {
                cssList.splice(i, 1);
            }
        });
    } else if (isViewDataString) {
        // remove oldCssList items from cssList
        cssList = util.arrayRemoveMatch(cssList, oldCssList);
        cssList = cssList.concat(vmCssListArray);
    }

    // unique cssList array
    cssList = _.uniq(cssList).join(' ');
    // replace all css classes
    // TODO: this is the slowness part. Try only update changed css in the classList
    // rather than replace the whole class attribute
    cache.el.setAttribute('class', cssList);
    // update element data
    cache.elementData.cssList = newCssList;
};

/**
 * attrBinding
 * @description
 * DOM decleartive attr binding. update elenment attributes
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const attrBinding = (cache, viewModel, bindingAttrs) => {
    let dataKey = cache.dataKey;
    let paramList = cache.parameters;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};
    cache.elementData.attrObj = cache.elementData.attrObj || {};

    let $element = $(cache.el);
    let oldAttrObj = cache.elementData.attrObj;
    let vmAttrObj = util.getViewModelValue(viewModel, dataKey);
    let viewModelContext;

    if (typeof vmAttrObj === 'function') {
        viewModelContext = util.resolveViewModelContext(viewModel, dataKey);
        paramList = paramList ? util.resolveParamList(viewModel, paramList) : [];
        let args = [oldAttrObj, $element].concat(paramList);
        vmAttrObj = vmAttrObj.apply(viewModelContext, args);
    }

    if (!util.isPlainObject(vmAttrObj) || util.isEmptyObject(vmAttrObj)) {
        // reject if vmAttrListObj is not an object or empty
        return;
    }

    // reject if nothing changed
    if (JSON.stringify(oldAttrObj) === JSON.stringify(vmAttrObj)) {
        return;
    }

    // get current DOM element attributes object
    // let domAttrObj = util.getNodeAttrObj(cache.el, [bindingAttrs.attr]);

    if (util.isEmptyObject(oldAttrObj)) {
        for (let key in vmAttrObj) {
            if (vmAttrObj.hasOwnProperty(key)) {
                cache.el.setAttribute(key, vmAttrObj[key]);
            }
        }
    } else {
        for (let key in oldAttrObj) {
            if (oldAttrObj.hasOwnProperty(key)) {
                if (vmAttrObj[key] === undefined) {
                    // remove attribute if not present in current vm
                    cache.el.removeAttribute(key);
                }
            }
        }
        for (let key in vmAttrObj) {
            if (vmAttrObj.hasOwnProperty(key)) {
                if (oldAttrObj[key] !== vmAttrObj[key]) {
                    // update attribute if value changed
                    cache.el.setAttribute(key, vmAttrObj[key]);
                }
            }
        }
    }
    // update element data
    cache.elementData.attrObj = vmAttrObj;
};

/**
 * forOfBinding
 * @description
 * DOM decleartive for binding.
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const forOfBinding = (cache, viewModel, bindingAttrs) => {
    let dataKey = cache.dataKey;

    if (!dataKey || dataKey.length > config.maxDatakeyLength) {
        return;
    }
    // replace mess spaces with single space
    cache.dataKey = cache.dataKey.replace(util.REGEX.WHITESPACES, ' ');

    if (!cache.iterator) {
        let forExpMatch = dataKey.match(util.REGEX.FOROF);

        if (!forExpMatch) {
            return;
        }

        cache.iterator = {};
        cache.iterator.alias = forExpMatch[1].trim();

        if (forExpMatch[2]) {
            cache.iterator.dataKey = forExpMatch[2].trim();
            cache.parentElement = cache.el.parentElement;
            cache.previousNonTemplateElement = cache.el.previousSibling;
            cache.nextNonTemplateElement = cache.el.nextSibling;
        }
    }

    renderForOfBinding({
        bindingData: cache,
        viewModel: viewModel,
        bindingAttrs: bindingAttrs,
    });
};

export {
    renderTemplate,
    clickBinding,
    dblclickBinding,
    blurBinding,
    focusBinding,
    changeBinding,
    modelBinding,
    submitBinding,
    textBinding,
    showBinding,
    cssBinding,
    attrBinding,
    forOfBinding,
};
