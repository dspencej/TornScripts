// ==UserScript==
// @name         Hide Torn Level-up Message
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.1.0
// @description  Hides the congratulatory level-up message on all Torn pages.
// @author       dspencej
// @license      MIT
// @match        https://www.torn.com/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hideLevelUp.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hideLevelUp.js
// ==/UserScript==

(function() {
    'use strict';

    function hideLevelUpMessage() {
        const infoMsgs = document.querySelectorAll('.info-msg.border-round');
        infoMsgs.forEach(msg => {
            // Check for text content that indicates a level up message and a link to level2.php.
            if (msg.textContent.includes("Congratulations!") &&
                msg.querySelector('a[href*="level2.php"]')) {
                msg.style.display = 'none';
            }
        });
    }

    // Run on initial load.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideLevelUpMessage);
    } else {
        hideLevelUpMessage();
    }

    // Observe DOM changes (in case the message is loaded dynamically).
    const observer = new MutationObserver(hideLevelUpMessage);
    observer.observe(document.body, { childList: true, subtree: true });
})();