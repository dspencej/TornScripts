// ==UserScript==
// @name         Torn Profile Button Enhancements
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.1.0
// @description  Enlarges the revive button and hides the display case button on a user's profile page in Torn.
// @author       Dustin Spencer
// @license      MIT
// @match        https://www.torn.com/profiles.php?XID=*
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/profileButtonEnhancements.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/profileButtonEnhancements.js
// ==/UserScript==

(function () {
    'use strict';

    // Enlarge the revive button
    const enlargeReviveButton = () => {
        const reviveButton = document.querySelector('.profile-button-revive');
        if (reviveButton) {
            // Enlarge the button
            reviveButton.style.width = '100px';
            reviveButton.style.height = '100px';
            reviveButton.style.padding = '10px';
            reviveButton.style.margin = '10px';

            // Enlarge the SVG icon within the button
            const svgIcon = reviveButton.querySelector('svg');
            if (svgIcon) {
                svgIcon.style.width = '80px';
                svgIcon.style.height = '80px';
            }

            console.log('Revive button has been enlarged.');
        } else {
            console.warn('Revive button not found on this profile.');
        }
    };

    // Hide the display case button
    const hideDisplayCaseButton = () => {
        const displayCaseButton = document.querySelector('.profile-button-viewDisplayCabinet');
        if (displayCaseButton) {
            displayCaseButton.style.display = 'none'; // Hide the button
            console.log('Display case button has been hidden.');
        } else {
            console.warn('Display case button not found on this profile.');
        }
    };

    // Function to handle both actions
    const handleProfileButtons = () => {
        enlargeReviveButton();
        hideDisplayCaseButton();
    };

    // Observe DOM changes for dynamic content
    const observeDOMChanges = () => {
        const observer = new MutationObserver(() => {
            handleProfileButtons();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    };

    // Initialize the script
    const init = () => {
        handleProfileButtons();
        observeDOMChanges();
    };

    init();
    console.log('Torn Profile Button Enhancements Script loaded successfully.');
})();
