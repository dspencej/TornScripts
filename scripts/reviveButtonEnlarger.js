// ==UserScript==
// @name         Torn Revive Button Enlarger
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.5.0
// @description  Enlarges the revive button and hides the display case button on a user's profile page in Torn.
// @author       dspencej
// @license      MIT
// @match        https://www.torn.com/profiles.php?XID=*
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/main/scripts/reviveButtonEnlarger.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/main/scripts/reviveButtonEnlarger.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Ensure we auto-click at most once per page load
    let hasAutoClickedRevive = false;
    // Ensure we center at most once per page load
    let hasCenteredRevive = false;

    const isClickable = (el) => {
        if (!el) return false;
        if (hasAutoClickedRevive) return false;
        if (el.hasAttribute('disabled')) return false;
        if (el.classList && el.classList.contains('disabled')) return false;
        const style = window.getComputedStyle(el);
        if (!style) return false;
        if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none') return false;
        if (!(el.offsetWidth > 0 && el.offsetHeight > 0)) return false;
        return true;
    };

    const autoClickRevive = () => {
        if (hasAutoClickedRevive) return;
        const reviveButton = document.querySelector('.profile-button-revive');
        if (isClickable(reviveButton)) {
            hasAutoClickedRevive = true;
            setTimeout(() => {
                try {
                    reviveButton.click();
                    console.log('Revive button auto-clicked.');
                } catch (e) {
                    console.warn('Failed to auto-click revive button:', e);
                    hasAutoClickedRevive = false; // allow a retry if needed
                }
            }, 250);
        }
    };

    const centerReviveButton = () => {
        if (hasCenteredRevive) return;
        const reviveButton = document.querySelector('.profile-button-revive');
        if (!reviveButton) return;
        const style = window.getComputedStyle(reviveButton);
        if (!style || style.display === 'none' || style.visibility === 'hidden') return;
        if (!(reviveButton.offsetWidth > 0 && reviveButton.offsetHeight > 0)) return;

        hasCenteredRevive = true;
        setTimeout(() => {
            try {
                reviveButton.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                console.log('Revive button centered in viewport.');
            } catch (e) {
                // Fallback
                reviveButton.scrollIntoView(true);
            }
        }, 150);
    };

    // Enlarge the revive button
    const enlargeReviveButton = () => {
        const reviveButton = document.querySelector('.profile-button-revive');
        if (reviveButton) {
            // Enlarge the button
            reviveButton.style.width = '200px';
            reviveButton.style.height = '200px';
            reviveButton.style.padding = '10px';
            reviveButton.style.margin = '10px';

            // Enlarge the SVG icon within the button
            const svgIcon = reviveButton.querySelector('svg');
            if (svgIcon) {
                svgIcon.style.width = '160px';
                svgIcon.style.height = '160px';
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
        centerReviveButton();
        autoClickRevive();
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
