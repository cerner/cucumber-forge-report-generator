/* globals window, document */
const persistentSettingsEnabled = typeof (Storage) !== 'undefined';
let pauseScrollActions = false;

const toggleSettingsDrawer = () => {
  document.getElementById('settingsDrawer').classList.toggle('active');
};

const toggleTagDisplay = () => {
  Array.from(document.getElementsByClassName('tags')).forEach((tagBlock) => {
    tagBlock.classList.toggle('active');
  });
};

const toggleFunctionAccordion = (element) => {
  element.classList.toggle('active');
  const icon = element.getElementsByTagName('i')[0];
  const panel = element.nextElementSibling;
  panel.classList.toggle('active');

  if (panel.classList.contains('active')) {
    icon.classList.add('fa-angle-down');
    icon.classList.remove('fa-angle-right');
  } else {
    icon.classList.remove('fa-angle-down');
    icon.classList.add('fa-angle-right');
  }
};

const toggleScenarioButton = (element) => {
  // Clear all the other buttons
  Array.from(document.getElementsByClassName('scenario-button')).forEach((scenarioButton) => {
    scenarioButton.classList.remove('active');
  });
  element.classList.add('active');
};

const scrollTo = (element) => {
  // Pause the scroll actions while we jump to a new location:
  pauseScrollActions = true;
  setTimeout(() => {
    pauseScrollActions = false;
  }, (1000));
  const target = document.getElementById(element.getAttribute('scroll-to-id'));
  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'end',
  });
};

const checkVisible = (elm) => {
  const rect = elm.getBoundingClientRect();
  const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
};

const getVisibleAnchor = () => {
  let visibleAnchor;
  Array.from(document.getElementsByClassName('anchor active')).some((anchor) => {
    if (checkVisible(anchor)) {
      visibleAnchor = anchor;
      return true;
    }
    return false;
  });
  return visibleAnchor;
};

const updateActiveScenarioWhenScrolling = () => {
  if (pauseScrollActions) return;
  const visibleAnchor = getVisibleAnchor();
  if (visibleAnchor) {
    if (visibleAnchor.getAttribute('scenario-button')) {
      const visibleScenarioButton = document.getElementById(visibleAnchor.getAttribute('scenario-button'));
      if (!visibleScenarioButton.classList.contains('active')) {
        toggleScenarioButton(visibleScenarioButton);
      }
    }
  }
};

const toggleDisplayedFeature = (element) => {
  // Deactivate all features
  Array.from(document.getElementsByClassName('feature-wrapper')).forEach((featureWrapper) => {
    featureWrapper.classList.remove('active');
  });
  // Deactivate all anchors
  Array.from(document.getElementsByClassName('anchor')).forEach((anchor) => {
    anchor.classList.remove('active');
  });
  // Activate selected feature
  const featureWrapper = document.getElementById(element.getAttribute('feature-wrapper-id'));
  featureWrapper.classList.add('active');
  Array.from(featureWrapper.querySelectorAll('.anchor')).forEach((anchor) => {
    anchor.classList.add('active');
  });
};

const toggleDirectoryButton = (element) => {
  element.classList.toggle('active');
  const icon = element.getElementsByTagName('i')[0];
  const panel = element.nextElementSibling;
  panel.classList.toggle('active');

  if (panel.classList.contains('active')) {
    icon.classList.remove('fa-folder');
    icon.classList.add('fa-folder-open');
  } else {
    icon.classList.add('fa-folder');
    icon.classList.remove('fa-folder-open');
  }
};

const toggleParentDirectoryButtons = (element) => {
  toggleDirectoryButton(element);

  // Recuse on any directory buttons above
  const parentDirectoryButton = element.parentNode.parentNode.previousElementSibling;
  if (parentDirectoryButton && parentDirectoryButton.classList.contains('directory-button')) {
    toggleParentDirectoryButtons(parentDirectoryButton);
  }
};

const tagsCheckboxClicked = () => {
  toggleTagDisplay();
  if (persistentSettingsEnabled) {
    const { localStorage } = window;
    localStorage.cfDisplayTags = localStorage.cfDisplayTags != null && localStorage.cfDisplayTags === 'true' ? 'false' : 'true';
  }
};

const init = () => {
  // Add listeners for directory buttons
  Array.from(document.getElementsByClassName('directory-button')).forEach((directoryButton) => {
    directoryButton.addEventListener('click', function click() {
      toggleDirectoryButton(this);
    });
  });

  // Add listeners for feature buttons
  Array.from(document.getElementsByClassName('feature-button')).forEach((featureButton) => {
    featureButton.addEventListener('click', function click() {
      toggleFunctionAccordion(this);
      if (this.classList.contains('active')) {
        toggleDisplayedFeature(this);
        scrollTo(this);

        // Toggle the first scenario button of the feature
        const scenarioButton = this.nextElementSibling.getElementsByTagName('button')[0];
        toggleScenarioButton(scenarioButton);
      }
    });
  });

  // Add listeners for scenario buttons
  Array.from(document.getElementsByClassName('scenario-button')).forEach((scenarioButton) => {
    scenarioButton.addEventListener('click', function click() {
      // Make sure the scenario's feature is active
      const featureButton = this.parentNode.parentNode.previousElementSibling;
      if (!this.classList.contains('active')) {
        toggleDisplayedFeature(featureButton);
      }
      toggleScenarioButton(this);
      scrollTo(this);
    });
  });

  // Make sure the right scenario is active when scrolling
  window.addEventListener('scroll', updateActiveScenarioWhenScrolling, true);

  // Add listeners to settings controls
  const settingsButton = document.getElementById('settingsButton');
  if (settingsButton) {
    settingsButton.addEventListener('click', toggleSettingsDrawer);
  }
  const tagsCheckbox = document.getElementById('tagsCheckbox');
  if (tagsCheckbox) {
    tagsCheckbox.addEventListener('click', tagsCheckboxClicked);
  }

  // Open the first feature.
  const firstFeatureButton = document.getElementsByClassName('feature-button')[0];
  if (firstFeatureButton) {
    // Open any parent directory buttons
    const directoryButton = firstFeatureButton.parentNode.parentNode.previousElementSibling;
    toggleParentDirectoryButtons(directoryButton);

    toggleFunctionAccordion(firstFeatureButton);
    toggleDisplayedFeature(firstFeatureButton);
  }

  // Initialize the settings
  if (persistentSettingsEnabled) {
    // Display the tags if necessary
    const { localStorage } = window;
    if (localStorage.cfDisplayTags != null && localStorage.cfDisplayTags === 'true') {
      toggleTagDisplay();
      if (tagsCheckbox) {
        tagsCheckbox.checked = 'true';
      }
    }
  }
};

init();
