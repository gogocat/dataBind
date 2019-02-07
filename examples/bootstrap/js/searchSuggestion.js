(function(jQuery) {
    let searchSuggestion = [
        'Air Conditioning',
        'Heating',
        'Bricklaying',
        'Carpentry',
        'Concreting',
        'Paving',
        'Electrical',
        'Fencing',
        'Gates',
        'Flooring',
        'Handyman',
        'Painting',
        'Decorating',
        'Pest Control',
        'Plastering',
        'Tiling',
        'Plumbing',
        'Roofing',
        'Rubbish Removal',
        'Skip Hiring',
        'Scaffolding',
        'Other Building',
        'Construction',
    ];

    let substringMatcher = function(strs) {
        return function findMatches(q, cb) {
            let matches = [];
            // regex used to determine if a string contains the substring `q`
            let substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function(i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };

    $(document).ready(function() {
        $('#scrollable-dropdown-menu .typeahead').typeahead(null, {
            name: 'searchSuggestion',
            limit: 5,
            source: substringMatcher(searchSuggestion),
        });
        // after typeahead init. move label and focus bar
        $('[for="searchWord"]').insertAfter($('#searchWord'));
        $('.search-bar__focus-bar').insertAfter($('[for="searchWord"]'));
    });
})($);
