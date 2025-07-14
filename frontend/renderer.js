try {
    const $ = require('jquery');
    window.$ = window.jQuery = $;
    require('select2')(window.$);
} catch (e) {
}
$(function () {
    $('#objectSelector').select2({});
});