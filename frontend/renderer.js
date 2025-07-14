console.log('renderer.js loaded');
console.log('typeof $.fn.select2:', typeof $.fn.select2);

$(document).ready(function () {
    $('#objectSelector').select2({
        multiple: true,
    });
});