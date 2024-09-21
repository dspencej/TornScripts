// ==UserScript==
// @name         Improved Egg Finder
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.0.1
// @description  Makes finding eggs a little bit easier with enhanced visuals and user settings.
// @author       Dustin Spencer, based on original script by Lazerpent [2112641]
// @match        https://www.torn.com/*
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedEggFinder.js
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedEggFinder.js
// ==/UserScript==
'use strict';

window.addEventListener('load', () => {
    // Check if the egg-hunt element is present
    const egg = document.getElementById('easter-egg-hunt-root');
    if (egg) {
        if (egg.classList.contains('egg-finder-found')) {
            return;
        }
        egg.classList.add('egg-finder-found');

        // Notify the user using a non-blocking notification
        showNotification('There appears to be an egg on this page!');

        // Move the egg and make it visually distinct
        moveEgg();
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '10px';
        notification.style.right = '10px';
        notification.style.backgroundColor = '#ff9800';
        notification.style.color = 'white';
        notification.style.padding = '15px';
        notification.style.borderRadius = '5px';
        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Function to dynamically move and highlight the egg
    function moveEgg() {
        let retries = 0;
        const maxRetries = 20; // Limit retries to avoid infinite loops

        function tryMoveEgg() {
            if (retries >= maxRetries) {
                console.error('Egg could not be found on this page.');
                return;
            }

            const buttons = egg.querySelectorAll('button');
            if (buttons.length === 0) {
                retries++;
                setTimeout(tryMoveEgg, 100); // Debounced retry every 100ms
                return;
            }

            // Make the egg visually distinct
            buttons.forEach(b => {
                const eggSize = localStorage.getItem('eggSize') || '20';

                b.style.position = 'fixed';
                b.style.top = '50%';
                b.style.left = '50%';
                b.style.transform = 'translate(-50%, -50%)';
                b.style.height = `${eggSize}%`;
                b.style.width = `${eggSize}%`;
                b.style.border = '5px solid red';

                const children = b.children;
                children[0].style.height = '100%';

                const particles = children[children.length - 1];
                particles.style.left = '0';
                particles.style.width = '100%';
                particles.style.height = '100%';
            });
        }

        tryMoveEgg();
    }

    // Add a menu command to set egg size, if using Greasemonkey or Tampermonkey
    if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand('Set Egg Size', () => {
            const userSize = prompt('Set egg size (percentage of screen):', '20');
            localStorage.setItem('eggSize', userSize || '20');
        });
    }
});
