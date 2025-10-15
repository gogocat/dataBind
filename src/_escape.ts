/**
 * _escape
 * @description
 * https://github.com/lodash/lodash/blob/master/escape.js
 */

const baseToString = (value: unknown): string => {
    if (typeof value == 'string') {
        return value;
    }
    return value == null ? '' : `${value}`;
};

/** Used to match HTML entities and HTML characters. */
const reUnescapedHtml = /[&<>"'`]/g;
const reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

/** Used to map characters to HTML entities. */
const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
    '`': '&#96;',
};

/**
  * escapeHtmlChar
  * @description convert characters to HTML entities.
  * @private
  * @param {string} chr The matched character to escape.
  * @return {string} Returns the escaped character.
  */
const escapeHtmlChar = (chr: string): string => {
    return htmlEscapes[chr];
};

/**
 * Converts the characters "&", "<", ">", '"', "'", and "\`", in `string` to
 * their corresponding HTML entities.
 * @param {string} string
 * @return {string} string
 */
const escape = (string: unknown): string => {
    // Reset `lastIndex` because in IE < 9 `String#replace` does not.
    const strValue = baseToString(string);
    return (strValue && reHasUnescapedHtml.test(strValue)) ?
        strValue.replace(reUnescapedHtml, escapeHtmlChar) :
        strValue;
};

export default escape;
