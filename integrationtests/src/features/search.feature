Feature: Test search
    As a developer
    I want to be able to test if search works

    Background:
        Given I open the site "/examples/bootstrap.html"

    Scenario: Test if the enter search word and location will show search results"
        Given there is an element "[data-jq-comp='search-bar']" on the page
        When I set "Air Conditioning" to the inputfield "#searchWord"
        When I set "Melbourne" to the inputfield "#location"
        When I click on the button ".search-bar__btn"
        When I submit the form "#search-form"
        When I pause for 3000ms
        Then I expect that element "#searchResultTitle" contains the text "Search results"
        #Then I expect elements ".result-item" falsCase false exists on the page 7 times$

