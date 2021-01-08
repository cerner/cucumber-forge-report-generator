Feature: Report Generation
  <In order to> record or communicate feature documentation
  <As a> consumer of cucumber-forge-report-generator
  <I want> to generate HTML reports directly from feature files

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
          Given the dog is hungry
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
          Given the cat is hungry
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
    And the variable 'dogCarePath' contains the path to the 'feature/dog' directory
    And the variable 'catCarePath' contains the path to the 'feature/cat' directory
    And the variable 'allFeaturesPath' contains the path to the 'feature' directory

  Scenario: Generating an HTML report for a feature file
    Given the current date is {current_date}
    And the username of the current user is {username}
    When a report is generated with the code "new Generator().generate(this.dogCarePath)"
    Then the title on the report will be "Feature documentation - {current_date}"
    And the report will include CSS styling
    And the report will include a favicon
    And the report will contain 1 feature
    And the report will contain 2 scenarios
    And the report name on the sidebar will be "All Scenarios"
    And the report will not contain gherkin comments
    And the project title on the sidebar will be "Feature documentation"
    And the header on the sidebar will be "{username} - {current_date}"
    And the footer on the sidebar will be "Cucumber Forge"
    And the sidebar will contain 1 directory button
    And the sidebar will contain 1 feature button
    And the sidebar will contain 2 scenario buttons

  Scenario: Generating an HTML report for multiple feature files in different directories
    When a report is generated with the code "new Generator().generate(this.allFeaturesPath)"
    Then the report will contain 2 features
    And the report will contain 4 scenarios
    And the sidebar will contain 2 directory buttons
    And the sidebar will contain 2 feature buttons
    And the sidebar will contain 4 scenario buttons

  Scenario: Generating an HTML report when the project name is provided
    Given the current date is {current_date}
    When a report is generated with the code "new Generator().generate(this.dogCarePath, 'Pet Project')"
    Then the title on the report will be "Pet Project - {current_date}"
    And the project title on the sidebar will be "Pet Project"

  Scenario Outline: Generating an HTML report with scenarios filtered by a tag
    The features and scenarios included in a report can be filtered based on their tags.
    The provided tag can optionally be prefixed with '@'.

    When a report is generated with the code "new Generator().generate(this.allFeaturesPath, null, <tag:>)"
    Then the report will contain 2 features
    And the report will contain 2 scenarios
    And the report name on the sidebar will be <tag:>
    And the sidebar will contain 2 feature buttons
    And the sidebar will contain 2 scenario buttons

    Examples:
      | tag:       |
      | 'feeding'  |
      | '@feeding' |
      | '@feed*'   |
      | '@feeding*'|
      | 'feed*'    |
      | 'feeding*' |

  Scenario: Generating an HTML report with features filtered by a tag
    The features and scenarios included in a report can be filtered based on their tags.

    When a report is generated with the code "new Generator().generate(this.allFeaturesPath, null, '@cats')"
    Then the report will contain 1 feature
    And the report will contain 2 scenarios
    And the report name on the sidebar will be '@cats'
    And the sidebar will contain 1 feature button
    And the sidebar will contain 2 scenario buttons

  Scenario: Generating a report when the directory contains an empty feature file    
    Given there is a file named 'empty.feature' in the 'feature/dog' directory with the following contents:
      """
      """
    When a report is generated with the code "new Generator().generate(this.dogCarePath)"
    Then the report will contain 2 features

  Scenario: Generating a report when the directory contains a feature file without the feature header
    Given there is a file named 'invalid.feature' in the 'feature/dog' directory with the following contents:
      """
        Background:
          Given I have a dog

        @feeding
        Scenario: Feeding the Dog
          Given the dog is hungry
          When I give dog food to the dog
          Then the dog will eat it
      """
    When a report is generated with the code "new Generator().generate(this.dogCarePath)"
    Then the report will contain 2 features

  Scenario: Generating a report when the directory contains a feature file without a scenario header
    Given there is a file named 'invalid.feature' in the 'feature/dog' directory with the following contents:
      """
      Feature: Dog Care
          Given the dog is hungry
          When I give dog food to the dog
          Then the dog will eat it
      """
    When a report is generated with the code "new Generator().generate(this.dogCarePath)"
    Then the report will contain 2 features

  Scenario: Generating a report when the directory contains a feature file that has only Cucumber steps
    Given there is a file named 'invalid.feature' in the 'feature/dog' directory with the following contents:
      """
          Given the dog is hungry
          When I give dog food to the dog
          Then the dog will eat it
      """
    When a report is generated with the code "new Generator().generate(this.dogCarePath)"
    Then the report will contain 2 features
    
  Scenario: Generating a report when the directory contains a feature file without Cucumber keywords
    Given there is a file named 'invalid.feature' in the 'feature/dog' directory with the following contents:
      """
      This is an invalid feature file
      """
    When a report is generated with the code "new Generator().generate(this.dogCarePath)"
    Then the report will contain 2 features

  @exception
  Scenario: Generating a report when no path is provided
    When a report is generated with the code "new Generator().generate()"
    Then an error will be thrown with the message "A feature directory path must be provided."

  @exception
  Scenario: Generating a report when no feature files are provided
    Given the variable 'noFeaturesPath' contains the path to a directory with no feature files
    When a report is generated with the code "new Generator().generate(this.noFeaturesPath)"
    Then an error will be thrown with the message "No feature files were found in the given directory."

  Scenario: Generating an HTML report for a feature file with an alternative Gherkin dialect when the dialect is provided
    Given there is a file named 'afrikaans.feature' in the 'feature/dialect' directory with the following contents:
      """
      Besigheid Behoefte: Hondsorg
        Agtergrond:
          Gegewe Ek het 'n hond

        Situasie: Die hond voed
          Gegewe die hond is honger
          Wanneer I give dog food to the dog
          Dan Ek gee hondekos vir die hond

        Situasie Uiteensetting: Die hondjie klapper
          Wanneer Ek troeteldier van die hond se hare <direction:>
          Dan die hond sal <result>
          Maar die hond sal my nie byt nie
          En die hond sal kalmeer

          Voorbeelde:
            | direction:  | result      |
            | agteruit    | lek my hand |
            | voorspelers | grom        |
      """
    And the variable 'dialectPath' contains the path to the 'feature/dialect' directory
    When a report is generated with the code "new Generator().generate(this.dialectPath, null, null, 'af')"
    Then the report will contain 1 features
    And the report will contain 2 scenarios
    And the sidebar will contain 1 directory buttons
    And the sidebar will contain 1 feature buttons
    And the sidebar will contain 2 scenario buttons

  Scenario: Generating an HTML report for a feature file with an alternative Gherkin dialect when the language header is present in the feature
    Given there is a file named 'panjabi.feature' in the 'feature/dialect' directory with the following contents:
      """
      # language: pa
      ਨਕਸ਼ ਨੁਹਾਰ: ਕੁੱਤੇ ਦੀ ਦੇਖਭਾਲ
        ਪਿਛੋਕੜ:
          ਜਿਵੇਂ ਕਿ ਮੇਰੇ ਕੋਲ ਇੱਕ ਕੁੱਤਾ ਹੈ

        ਪਟਕਥਾ: ਕੁੱਤੇ ਨੂੰ ਖੁਆਉਣਾ
          ਜੇਕਰ ਕੁੱਤਾ ਭੁੱਖਾ ਹੈ
          ਜਦੋਂ ਮੈਂ ਕੁੱਤੇ ਨੂੰ ਖਾਣਾ ਦਿੰਦਾ ਹਾਂ
          ਤਦ ਕੁੱਤਾ ਇਹ ਖਾਵੇਗਾ

        ਪਟਕਥਾ ਰੂਪ ਰੇਖਾ: ਕੁੱਤਾ ਪਾਲ ਰਹੇ
          ਜਦੋਂ ਮੈਂ ਕੁੱਤੇ ਦੇ ਵਾਲ ਪਾਲਤੂ ਹਾਂ <direction:>
          ਤਦ ਕੁੱਤਾ ਕਰੇਗਾ <result>
          ਪਰ ਕੁੱਤਾ ਮੈਨੂੰ ਨਹੀਂ ਡੰਗੇਗਾ
          ਅਤੇ ਕੁੱਤਾ ਸ਼ਾਂਤ ਹੋ ਜਾਵੇਗਾ

          ਉਦਾਹਰਨਾਂ:
            | direction: | result     |
            | ਪਿੱਛੇ ਵੱਲ     | ਮੇਰਾ ਹੱਥ ਚੱਟੋ |
            | ਅੱਗੇ        | ਫੁੱਟ         |
      """
    And the variable 'dialectPath' contains the path to the 'feature/dialect' directory
    When a report is generated with the code "new Generator().generate(this.allFeaturesPath)"
    Then the report will contain 3 features
    And the report will contain 6 scenarios
    And the sidebar will contain 3 directory buttons
    And the sidebar will contain 3 feature buttons
    And the sidebar will contain 6 scenario buttons

  @exception
  Scenario: Generating an HTML report when the provided Gherkin dialect is not supported
    When a report is generated with the code "new Generator().generate(this.allFeaturesPath, null, null, 'invalid')"
    Then an error will be thrown with the message "The provided dialect [invalid] is not supported."

  @exception
  Scenario: Generating an HTML report for a feature file with an alternative Gherkin dialect when the language header in the feature is not supported
    Given there is a file named 'american.feature' in the 'feature/dialect' directory with the following contents:
      """
      # language: american
      Feature: Dog Care
        Scenario: Feeding the Dog
          Given the dog is hungry
          When I give dog food to the dog
          Then the dog will eat it
      """
    When a report is generated with the code "new Generator().generate(this.allFeaturesPath)"
    Then an error will be thrown with a message that matches "The language \[american\] configured for the feature file \[(.*)american.feature\] is not supported."
