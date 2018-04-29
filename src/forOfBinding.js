import {maxDatakeyLength} from './config';
import {REGEX} from './util';
import renderForOfBinding from './renderForOfBinding';

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

    if (!dataKey || dataKey.length > maxDatakeyLength) {
        return;
    }
    // replace mess spaces with single space
    cache.dataKey = cache.dataKey.replace(REGEX.WHITESPACES, ' ');

    if (!cache.iterator) {
        let forExpMatch = dataKey.match(REGEX.FOROF);

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

export default forOfBinding;
