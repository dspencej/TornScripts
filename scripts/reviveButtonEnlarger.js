// ==UserScript==
// @name         Torn Profile Revive Button Enlarger
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.0.0
// @description  Enlarges the revive button on a user's profile page for easier and faster clicking.
// @author       Dustin Spencer
// @license      MIT
// @match        https://www.torn.com/profiles.php?XID=*
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/reviveButtonEnlarger.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/reviveButtonEnlarger.js
// ==/UserScript==

(function () {
    'use strict';

    // Adjust the revive button when the page loads
    const enlargeReviveButton = () => {
        const reviveButton = document.querySelector('.profile-button-revive');
        if (reviveButton) {
            // Enlarge the button
            reviveButton.style.width = '80px'; // Increased width
            reviveButton.style.height = '80px'; // Increased height
            reviveButton.style.padding = '10px';
            reviveButton.style.margin = '10px';

            // Enlarge the SVG icon inside the button
            const svgIcon = reviveButton.querySelector('svg');
            if (svgIcon) {
                svgIcon.style.width = '60px'; // Adjust icon size
                svgIcon.style.height = '60px'; // Adjust icon size
            }

            console.log('Revive button has been enlarged.');
        } else {
            console.warn('Revive button not found on this profile.');
        }
    };

    // Observe changes to ensure the button is enlarged if the page dynamically updates
    const observeDOMChanges = () => {
        const observer = new MutationObserver(() => {
            enlargeReviveButton();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    };

    // Initialize the script
    const init = () => {
        enlargeReviveButton();
        observeDOMChanges();
    };

    init();
    console.log('Torn Profile Revive Button Enlarger Script loaded successfully.');
})();
