/**
 * _escape
 * @description
 * https://github.com/lodash/lodash/blob/master/escape.js
 */

function baseToString(value: any): string {
    if (typeof value == 'string') {
        return value;
    }
    return value == null ? '' : `${value}`;
}

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
function escapeHtmlChar(chr: string): string {
    return htmlEscapes[chr];
}

/**
 * Converts the characters "&", "<", ">", '"', "'", and "\`", in `string` to
 * their corresponding HTML entities.
 * @param {string} string
 * @return {string} string
 */
export default function escape(string: any): string {
    // Reset `lastIndex` because in IE < 9 `String#replace` does not.
    string = baseToString(string);
    return (string && reHasUnescapedHtml.test(string)) ?
        string.replace(reUnescapedHtml, escapeHtmlChar) :
        string;
}
