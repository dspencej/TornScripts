// ==UserScript==
// @name         Torn Revive Button Enlarger
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.6.0
// @description  Enlarges the revive button, hides display case button, and completes revive process for contract targets.
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

    const MIN_DELAY = 150;
    const MAX_DELAY = 300;
    const MIN_CHANCE = 50;

    let hasAutoClickedRevive = false;
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

    function clickWithDelay(element) {
        const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
        setTimeout(() => {
            element.click();
        }, delay);
    }

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

    function processRevive() {
        const hospitalDesc = document.querySelector('.description');
        if (!hospitalDesc) return;
        const reasonText = hospitalDesc.textContent.toLowerCase();
        if (!reasonText.includes('hospitalized by')) return;

        const reviveButton = document.querySelector('.profile-button-revive');
        if (reviveButton) {
            clickWithDelay(reviveButton);
            return;
        }

        const okButton = document.querySelector('button.confirm-action.okay');
        if (okButton) {
            clickWithDelay(okButton);
            return;
        }

        const dialog = document.querySelector('.profile-buttons-dialog');
        if (dialog) {
            const textEl = dialog.querySelector('.text');
            const yesButton = dialog.querySelector('.confirm-action-yes');
            const noButton = dialog.querySelector('.confirm-action-no');

            if (textEl && yesButton && noButton) {
                const match = textEl.textContent.match(/(\d+\.\d+)%/);
                if (match) {
                    const percentage = parseFloat(match[1]);
                    if (percentage > MIN_CHANCE) {
                        const keyHandler = () => {
                            clickWithDelay(yesButton);
                            document.removeEventListener('keydown', keyHandler);
                        };
                        document.addEventListener('keydown', keyHandler);
                    } else {
                        clickWithDelay(noButton);
                    }
                } else {
                    clickWithDelay(yesButton);
                }
            }
        }
    }

    const handleProfileButtons = () => {
        enlargeReviveButton();
        hideDisplayCaseButton();
        centerReviveButton();
        autoClickRevive();
        processRevive();
    };

    const observeDOMChanges = () => {
        const observerSelector = 'button.confirm-action.okay, .profile-buttons-dialog, .profile-button-revive, .description';
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (
                            node.nodeType === Node.ELEMENT_NODE &&
                            (node.matches(observerSelector) || node.querySelector(observerSelector))
                        ) {
                            handleProfileButtons();
                            return;
                        }
                    }
                }
            }
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
