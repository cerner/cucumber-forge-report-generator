Feature: Report Generation
  <In order to> record or communicate feature documentation
  <As a> consumer of cucumber-forge-report-generator
  <I want> to generate HTML reports directly from feature files

  Background:
    Given there is a file named 'dog_care.feature' with the following contents:
      """
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
    And there is a file named 'cat_care.feature' with the following contents:
      """
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
    And the variable 'dogCarePath' contains the path to 'dog_care.feature'
    And the variable 'catCarePath' contains the path to 'cat_care.feature'

  Scenario: Generating an HTML report for a feature file
    Given the current date is {current_date}
    And the username of the current user is {username}
    When a report is generated with the code "new Generator().generate([this.dogCarePath])"
    Then the title on the report will be "Feature documentation - {current_date}"
    And the report will inculude CSS styling
    And the report will include a favicon
    And the report will contain 1 feature
    And the report will contain 2 scenarios
    And the report name on the sidebar will be "All Scenarios"
    And the project title on the sidebar will be "Feature documentation"
    And the header on the sidebar will be "{username} - {current_date}"
    And the footer on the sidebar will be "Cucumber Forge"
    And the sidebar will contain 1 feature button
    And the sidebar will contain 2 scenario buttons

  Scenario: Generating an HTML report for multiple feature files
    When a report is generated with the code "new Generator().generate([this.dogCarePath, this.catCarePath])"
    Then the report will contain 2 features
    And the report will contain 4 scenarios
    And the sidebar will contain 2 feature buttons
    And the sidebar will contain 4 scenario buttons

  Scenario: Generating an HTML report when the project name is provided
    Given the current date is {current_date}
    When a report is generated with the code "new Generator().generate([this.dogCarePath], 'Pet Project')"
    Then the title on the report will be "Pet Project - {current_date}"
    And the project title on the sidebar will be "Pet Project"

  Scenario Outline: Generating an HTML report filtered by a tag
    The features and scenarios included in a report can be filtered based on their tags.
    The provided tag can optionally be prefixed with '@'.

    When a report is generated with the code "new Generator().generate([this.dogCarePath, this.catCarePath], null, <tag:>)"
    Then the report will contain 2 features
    And the report will contain 2 scenarios
    And the report name on the sidebar will be <tag:>
    And the sidebar will contain 2 feature buttons
    And the sidebar will contain 2 scenario buttons

    Examples:
      | tag:       |
      | 'feeding'  |
      | '@feeding' |

  Scenario: Generating a report when no feature files are provided
    When a report is generated with the code "new Generator().generate()"
    Then the report will contain 0 features
    And the sidebar will contain 0 feature buttons
