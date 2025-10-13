import {maxDatakeyLength} from './config';
import {REGEX} from './util';
import renderForOfBinding from './renderForOfBinding';
import type { BindingCache, ViewModel, BindingAttrs } from './types';

/**
 * forOfBinding
 * @description
 * DOM decleartive for binding.
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const forOfBinding = (cache: BindingCache, viewModel: ViewModel, bindingAttrs: BindingAttrs, _forceRender?: boolean): void => {
    const dataKey = cache.dataKey;

    if (!dataKey || dataKey.length > maxDatakeyLength) {
        return;
    }

    if (!cache.iterator) {
        if (dataKey.length > maxDatakeyLength) {
            return;
        }
        // replace mess spaces with single space
        cache.dataKey = cache.dataKey.replace(REGEX.WHITE_SPACES, ' ');
        const forExpMatch = dataKey.match(REGEX.FOR_OF);

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
