Feature: Test the page title
    As a developer
    I want to be able to test if a page has a certain title

    Background:
        Given I open the site "/examples/bootstrap.html"

    Scenario: Test if the demo app has the title "Bootstrap 4 dataBind Demo"
        Given the title is "Bootstrap 4 dataBind Demo"
        Then I expect that element "#searchResultTitle" contains the text "Featured service providers"
        Then I expect that element "#search-result-columns" is not empty
        Then I expect that element ".mass-message__trigger-wrap" is not visible
        Then I expect that element "#message-modal" is not visible

