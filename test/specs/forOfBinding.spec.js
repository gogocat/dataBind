describe('When search-results-component with forOf binding inited', function() {
    var namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {

        loadFixtures('./fixtures/forOfBinding.html');

        namespace.viewModel = {
            searchResultTitle: 'Featured service providers',
            messageTriggerCss: '',
            bookmarkCss: '',
            searchResults: [
                {
                    id: '001',
                    title: 'Card title that wraps to a new line',
                    description:
                        'This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
                    image: 'bootstrap/images/pic-home.jpg',
                    bookmarked: false,
                    numLikes: 110,
                    options: [
                        {text: '1', value: '1'},
                        {text: '2', value: '2'},
                        {text: '3', value: '3'},
                    ],
                },
                {
                    id: '456',
                    title: 'Card title',
                    description:
                        'This card has supporting text below as a natural lead-in to additional content.',
                    image: '',
                    bookmarked: false,
                    numLikes: 8,
                    selected: true,
                    options: [
                        {text: '4', value: '4'},
                        {text: '5', value: '5'},
                        {text: '6', value: '6'},
                    ],
                },
                {
                    id: '789',
                    title: 'Sample carpemter service',
                    description:
                        'This is a wider card with supporting text below as a natural lead-in to additional content. This card has even longer content than the first to show that equal height action.',
                    image: 'bootstrap/images/pic-carpenter.jpg',
                    bookmarked: false,
                    numLikes: 8,
                    highlight: true,
                    highlightCss: 'result-item--highlight',
                    options: [
                        {text: '7', value: '7'},
                        {text: '8', value: '8'},
                        {text: '9', value: '9'},
                    ],
                },
            ],
            getResultItemAttr: function(oldAttrObj, $el, index) {
                var self = this;
                if (self.searchResults[index].image) {
                    return {
                        src: self.searchResults[index].image,
                        alt: self.searchResults[index].title || '',
                    };
                }
            },
            setResultOptionAttr: function(oldAttrObj, $el, $data) {
                if ($data && $data.value) {
                    // todo: the index here is the outter loop index
                    return {
                        value: $data.value,
                    };
                }
            },
            onAdMessageCheck: function(e, $el, newValue, oldValue, index) {
                console.log('onAdMessageCheck: ', $el, newValue, oldValue, index);
            },
            onAdBookmarkClick: function(e, $el, index) {
                e.preventDefault();
                console.log('onAdBookmarkClick: ', $el, index);
            },
        };

        namespace.searchResultsComponent = dataBind.init(
            $('[data-jq-comp="search-results-component"]'),
            namespace.viewModel
        );
		
        namespace.searchResultsComponent.render();
    });

    afterEach(function() {
        // clean up all app/components
        for (var prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="search-results-component"] should have render', function(done) {
        setTimeout(function() {
            expect($('#searchResultTitle').text()).toBe(namespace.viewModel.searchResultTitle);
            expect($('#search-result-columns').children().length).not.toBe(0);
            done();
        }, 200);
    });
	
	it('Then render forOf binding elements with comment tag wrap around', function(done) {
        setTimeout(function() {
            var $searchColumn = document.getElementById('search-result-columns');
			var firstCommentWrap = $searchColumn.firstElementChild.previousSibling;
			var lastCommentWrap = $searchColumn.lastElementChild.nextSibling
			
			expect(firstCommentWrap.nodeType).toBe(8);
			expect(lastCommentWrap.nodeType).toBe(8);
			expect(firstCommentWrap.textContent).toContain('data-forOf');
            expect(lastCommentWrap.textContent).toContain('data-forOf');
            done();
        }, 200);
    });

    it('Then render same amount of items in viewModel.searchResults', function(done) {
        setTimeout(function() {
			var $searchColumn = document.getElementById('search-result-columns');
            expect($searchColumn.children.length).toBe(namespace.viewModel.searchResults.length);
            done();
        }, 200);
    });
	
	describe('When each search item rendered', function() {
        it('should render bindings according to searchResults data', function(done) {
            setTimeout(function() {
				var $results = $('#search-result-columns').children();
                
				expect($results.length).not.toBe(0);
				
				$results.each(function(index) {
					var indexString = String(index);
					var $result = $(this);
					var $img = $result.find('.result-item__img');
					var $body = $result.find('.card-body');
					var $footer = $result.find('.result-item__footer');
					var $checkbox = $footer.find('.result-item__icon-checkbox');
					var $options = $footer.find('select.form-control option');
					var imgSrc = $img.attr('src') || '';
					var bodyIndex = $body.find('.bodyIndex').text();
					var footerIndex = $footer.find('.footerIndex').text();
					var bookMarkIndex = $result.find('.bookMarkIndex').text();
					var searchResult = namespace.viewModel.searchResults[index];
					
					bodyIndex = bodyIndex.charAt(bodyIndex.length - 1);
					footerIndex = footerIndex.charAt(footerIndex.length - 1);
					bookMarkIndex = bookMarkIndex.charAt(bookMarkIndex.length - 1);
					
					expect($img.length).not.toBe(0);
					expect(imgSrc).toBe(namespace.viewModel.searchResults[index].image);
					expect($body.children().length).not.toBe(0);
					expect(bodyIndex).toEqual(indexString);
					expect($footer.length).not.toBe(0);
					expect(footerIndex).toEqual(indexString);
					expect(bookMarkIndex).toEqual(indexString);
					expect($checkbox.is(':checked')).toEqual(Boolean(searchResult.selected));
					// first option is not from data
					expect($options.length).toEqual(searchResult.options.length + 1);
					expect($options.eq(index + 1).text()).toEqual(searchResult.options[index].text);
					expect($options.eq(index + 1).val()).toEqual(searchResult.options[index].value);
				});
				
				done();
            }, 200);
        });

    });
});
