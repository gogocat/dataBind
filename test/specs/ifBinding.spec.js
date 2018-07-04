describe('When myIfComponent with data-jq-if binding inited', function() {
    var namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {

        loadFixtures('./fixtures/ifBinding.html');

        namespace.viewModel = {
            renderIntro: true,
			heading: 'Test data-if-binding',
			description: 'This is intro text',
			story: {
				title: 'Hansel and Gretel',
				description: '"Hansel and Gretel" (also known as Hansel and Grettel, Hansel and Grethel, or Little Brother and Little Sister) is a well-known fairy tale of German origin.',
				link: 'https://www.google.com.au/search?q=Hansel+and+Gretel'
			},
			setStroylinkAttr: function($data) {
				return {
					href: this.story.link,
					title: this.story.title,
					target: '_blank',
					rel: 'noopener noreferrer'
				};
			},
			onStoryClick: function(e, $el) {
				e.preventDefault();
			},
			updateView: function(opt) {
				this.APP.render(opt);
			}
        };

        namespace.myIfComponent = dataBind.init(
            $('[data-jq-comp="myIfComponent"]'),
            namespace.viewModel
        );
		
        namespace.myIfComponent.render();
		
		// jasmine spies
        spyOn(namespace.viewModel, 'onStoryClick');
    });

    afterEach(function() {
        // clean up all app/components
        for (var prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="myIfComponent"] should have render', function(done) {
        setTimeout(function() {
            expect($('#intro-heading').text()).toBe(namespace.viewModel.heading);
            expect($('#intro-description').text()).toBe(namespace.viewModel.description);
            done();
        }, 200);
    });
	
	it('Then render if-binding elements with comment tag wrap around', function(done) {
        setTimeout(function() {
			var introOpenCommentWrap = document.getElementById('intro').previousSibling;
			var introCloseCommentWrap = document.getElementById('intro').nextSibling;
			
			expect(introOpenCommentWrap.nodeType).toBe(8);
			expect(introCloseCommentWrap.nodeType).toBe(8);
			expect(introOpenCommentWrap.textContent).toContain('data-if');
            expect(introCloseCommentWrap.textContent).toContain('data-if');
            done();
        }, 200);
    });
	
	it('Then #story should not render', function(done) {
        setTimeout(function() {
            expect($('#story').length).toBe(0);
            done();
        }, 200);
    });
	
	describe('When update viewModel renderIntro to false', function() {
        it('should render story and remove intro', function(done) {
			namespace.viewModel.renderIntro = false;
			namespace.viewModel.updateView();
			
            setTimeout(function() {
				expect($('#story').length).toBe(1);
				expect($('#intro').length).toBe(0);
				expect($('#storyIntroHeading').text()).toBe(namespace.viewModel.story.title);
				expect($('#storyDescription').text()).toBe(namespace.viewModel.story.description);
				expect($('#storyLink').attr('href')).toBe(namespace.viewModel.story.link);
				expect($('#storyLink').attr('title')).toBe(namespace.viewModel.story.title);
				expect($('#storyLink').attr('target')).toBe('_blank');
				expect($('#storyLink').attr('rel')).toBe('noopener noreferrer');
				
				$('#storyLink').click();
				expect(namespace.viewModel.onStoryClick).toHaveBeenCalled();
				namespace.viewModel.onStoryClick.calls.reset();
				done();
            }, 200);
        });
    });
	
	describe('When update viewModel renderIntro to true', function() {
        it('should render intro and remove story', function(done) {
			namespace.viewModel.renderIntro = true;
			namespace.viewModel.updateView();
			
            setTimeout(function() {
				expect($('#story').length).toBe(0);
				expect($('#intro').length).toBe(1);
				done();
            }, 200);
        });
    });
	
	describe('When update viewModel renderIntro to false again', function() {
        it('should render story and event handler rebind', function(done) {
			namespace.viewModel.renderIntro = false;
			namespace.viewModel.updateView();
			
            setTimeout(function() {
				expect($('#story').length).toBe(1);
				expect($('#intro').length).toBe(0);
				$('#storyLink').click();
				expect(namespace.viewModel.onStoryClick).toHaveBeenCalled();
				namespace.viewModel.onStoryClick.calls.reset();
				done();
            }, 200);
        });
    });
});
