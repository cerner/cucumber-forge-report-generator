Feature: Report Usage
  <In order to> navigate the feature documentation report
  <As a> someone viewing the HTML report in a web browser
  <I want> to be able to navigate the report with the built-in functionality

  Background:
    Given there is a file named 'dog_care.feature' in the 'feature/dog' directory with the following contents:
      """
      @pet_care @dogs
      Feature: Dog Care
        <In order to> care for and enjoy my pet
        <As a> dog owner
        <I want> interact with my dog

        Background:
          Given I have a dog

        @feeding 
        Scenario: Feeding the Dog
          Given the dog is hungery
          When I give dog food to the dog
          Then the dog will eat it

        # Do not need examples for left to right and right to left petting directions
        @petting
        Scenario Outline: Petting the Dog
          Dog's do not like to be pet in the wrong direction.

          When I pet the dog's hair <direction:>
          Then the dog will <result>

          Examples:
            | direction: | result       |
            | backwards  | lick my hand |
            | forwards   | growl        |
      """
    And there is a file named 'cat_care.feature' in the 'feature/cat' directory with the following contents:
      """
      @pet_care @cats
      Feature: Cat Care
        <In order to> care for and enjoy my pet
        <As a> cat owner
        <I want> interact with my cat

        Background:
          Given I have a cat

        @feeding
        Scenario: Feeding the Cat
          Given the cat is hungery
          When I give the following food to the cat:
            | fish  |
            | steak |
          Then the cat will eat it

        @petting
        Scenario Outline: Petting the Cat
          Cat's do not like to be pet in the wrong direction.

          When I pet the cat's hair <direction:>
          Then the cat will hiss

          Examples:
            | direction: |
            | backwards  |
            | forwards   |
      """

  Scenario: Clicking the directory buttons
    Given there is a report for the 'feature' directory
    And the feature button for the first directory is expanded in the sidebar
    And the feature button for the second directory is not expanded in the sidebar
    When the second directory button is clicked
    Then the feature button for the second directory will be expanded in the sidebar
    And the feature button for the first directory is expanded in the sidebar
    When the first directory button is clicked
    Then the feature button for the first directory will not be expanded in the sidebar
    And the feature button for the second directory is expanded in the sidebar

  Scenario: Clicking the feature buttons
    Given there is a report for the 'feature' directory
    And the first feature is displayed
    And the scenario buttons for the first feature are expanded in the sidebar
    And the scenario buttons for the second feature are not expanded in the sidebar
    When the second feature button is clicked
    Then the second feature will be displayed
    And the scenario buttons for the second feature will be expanded in the sidebar
    And the scenario buttons for the first feature are expanded in the sidebar
    When the first feature button is clicked
    Then the second feature will be displayed
    And the scenario buttons for the first feature will not be expanded in the sidebar
    And the scenario buttons for the second feature are expanded in the sidebar

  Scenario: Clicking the scenario buttons
    Given there is a report for the 'feature/dog' directory
    And the report will contain 2 scenarios
    When the first scenario button is clicked
    Then the first scenario button will be highlighted
    And the first scenario will be scrolled into view
    When the second scenario button is clicked
    Then the second scenario button will be highlighted
    And the second scenario will be scrolled into view

  Scenario: Scrolling through the scenarios in a feature
    Given there is a report for the 'feature/dog' directory
    When the first scenario is scrolled into view
    Then the first scenario button will be highlighted
    When the second scenario is scrolled into view
    Then the second scenario button will be highlighted

  Scenario: Opening the settings drawer
    Given there is a report for the 'feature/dog' directory
    When the settings button is clicked
    Then the settings drawer will be displayed
    When the settings button is clicked
    Then the settings drawer will be hidden
    
  Scenario: Showing the tags in the report
    Given there is a report for the 'feature/dog' directory
    And the settings button is clicked
    When the box is checked to show tags
    Then the tags displayed for the feature will be '@pet_care @dogs'
    Then the tags displayed for the first scenario will be '@feeding'
    Then the tags displayed for the second scenario will be '@petting'

  Scenario: Opening a report with a feature title link
    Given there is a report for the 'feature' directory
    When the report is opened with a link for the second feature title
    Then the second feature will be displayed
    And the scenario buttons for the second feature will be expanded in the sidebar
    When the report is opened with a link for the first feature title
    Then the first feature will be displayed
    And the scenario buttons for the first feature will be expanded in the sidebar

  Scenario: Opening a report with a scenario title link
    Given there is a report for the 'feature' directory
    When the report is opened with a link for the second scenario title in the second feature
    Then the second feature will be displayed
    And the scenario buttons for the second feature will be expanded in the sidebar
    And the second scenario button will be highlighted
    When the report is opened with a link for the first scenario title in the first feature
    Then the first feature will be displayed
    And the scenario buttons for the first feature will be expanded in the sidebar
    And the first scenario button will be highlighted