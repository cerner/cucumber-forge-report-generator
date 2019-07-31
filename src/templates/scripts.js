/* globals window, document */
let pauseScrollActions = false;

const toggleFunctionAccordion = (element) => {
  element.classList.toggle('active');
  const icon = element.getElementsByTagName('i')[0];
  const panel = element.nextElementSibling;
  if (panel.style.maxHeight) {
    panel.style.maxHeight = null;
    icon.classList.remove('fa-angle-down');
    icon.classList.add('fa-angle-right');
  } else {
    panel.style.maxHeight = `${panel.scrollHeight}px`;
    // Close all the other panels
    Array.from(document.getElementsByClassName('feature-button')).forEach((featureButton) => {
      if (element !== featureButton) {
        featureButton.classList.remove('active');
        featureButton.nextElementSibling.style.maxHeight = null;
        const iconToClose = featureButton.getElementsByTagName('i')[0];
        iconToClose.classList.remove('fa-angle-down');
        iconToClose.classList.add('fa-angle-right');
      }
    });
    icon.classList.add('fa-angle-down');
    icon.classList.remove('fa-angle-right');
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


/*
 * Toggles the review mode on and off. Removes any added checks and
 * strikethroughs when toggling off. Adds checkboxes and event listeners to
 * toggle strikethroughs on scenario titles when toggling on.
 */
const toggleReviewMode = () => {
  const checkmarks = Array.from(document.getElementsByClassName('review-check'));
  if (checkmarks.length > 0) {
    Array.from(document.getElementsByClassName('scenario-button-review'))
      .forEach((scenarioButton) => {
        scenarioButton.className = 'scenario-button';
        scenarioButton.style.textDecoration = 'none';
      });
    checkmarks.forEach((check) => { check.remove(); });
  } else {
    Array.from(document.getElementsByClassName('scenario-button'))
      .forEach((scenarioButton) => {
        scenarioButton.className = 'scenario-button-review';
        const btn = document.createElement('input');
        btn.setAttribute('type', 'checkbox');
        btn.setAttribute('class', 'review-check');
        btn.addEventListener('click', () => {
          if (!scenarioButton.style.textDecoration
                       || scenarioButton.style.textDecoration === 'none') {
            scenarioButton.style.textDecoration = 'line-through';
          } else {
            scenarioButton.style.textDecoration = 'none';
          }
        });
        scenarioButton.insertAdjacentElement('beforebegin', btn);
      });
  }
};

/*
 * Initialization for settings menu. Sets up event handlers for opening /
 * closing the menu and alternating the icons.
 */
const initSettingsMenu = () => {
  const gear = document.getElementById('gear');
  if (gear) {
    gear.addEventListener('click', function toggle() {
      document.getElementById('cross').style.display = 'block';
      document.getElementById('menu-list').style.visibility = 'visible';
      this.style.display = 'none';
    });
  }

  const cross = document.getElementById('cross');
  if (cross) {
    cross.addEventListener('click', function click() {
      document.getElementById('gear').style.display = 'block';
      document.getElementById('menu-list').style.visibility = 'hidden';
      this.style.display = 'none';
    });
  }

  const reviewMode = document.getElementById('review-mode');
  if (reviewMode) {
    reviewMode.addEventListener('click', () => {
      toggleReviewMode();
    });
  }
};

const init = () => {
  // Add listeners for feature buttons
  Array.from(document.getElementsByClassName('feature-button')).forEach((featureButton) => {
    featureButton.addEventListener('click', function click() {
      toggleFunctionAccordion(this);
      toggleDisplayedFeature(this);
      scrollTo(this);
    });
  });

  // Add listeners for scenario buttons
  Array.from(document.getElementsByClassName('scenario-button')).forEach((scenarioButton) => {
    scenarioButton.addEventListener('click', function click() {
      toggleScenarioButton(this);
      scrollTo(this);
    });
  });

  // Make sure the right scenario is active when scrolling
  window.addEventListener('scroll', updateActiveScenarioWhenScrolling, true);

  // Open the first feature.
  const firstFeatureButton = document.getElementsByClassName('feature-button')[0];
  if (firstFeatureButton) {
    toggleFunctionAccordion(firstFeatureButton);
    toggleDisplayedFeature(firstFeatureButton);
  }

  initSettingsMenu();
};

init();
