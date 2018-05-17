import {getViewModelValue, resolveViewModelContext, resolveParamList} from './util';

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
    shouldShow = getViewModelValue(viewModel, dataKey);

    // do nothing if data in viewModel is undefined
    if (typeof shouldShow !== 'undefined' && shouldShow !== null) {
        if (typeof shouldShow === 'function') {
            viewModelContext = resolveViewModelContext(viewModel, dataKey);
            paramList = paramList ? resolveParamList(viewModel, paramList) : [];
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

export default showBinding;
