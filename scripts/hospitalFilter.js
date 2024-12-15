// ==UserScript==
// @name         Torn Hospital Revive Filter
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.1.0
// @description  Adds functionality to hide users with disabled revives on the Torn hospital page.
// @author       Dustin Spencer
// @license      MIT
// @match        https://www.torn.com/hospitalview.php
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// ==/UserScript==

(function () {
    'use strict';

    // Create the filter button UI
    const createFilterButton = () => {
        const container = document.createElement('div');
        container.style.padding = '10px';
        container.style.backgroundColor = '#1c1c1c';
        container.style.color = '#fff';
        container.style.marginBottom = '10px';
        container.style.borderRadius = '5px';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';

        const filterButton = document.createElement('button');
        filterButton.textContent = 'Hide Users with Disabled Revives';
        filterButton.style.padding = '10px 20px';
        filterButton.style.backgroundColor = '#444';
        filterButton.style.color = '#fff';
        filterButton.style.border = 'none';
        filterButton.style.borderRadius = '5px';
        filterButton.style.cursor = 'pointer';
        filterButton.addEventListener('click', hideDisabledRevives);

        container.appendChild(filterButton);

        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
            contentWrapper.prepend(container);
        } else {
            console.error('Failed to find content wrapper to prepend the filter button.');
        }
    };

    // Hide users with disabled revives
    const hideDisabledRevives = () => {
        const userElements = document.querySelectorAll('.userlist-wrapper.hospital-list-wrapper li');
        userElements.forEach((user) => {
            const reviveButton = user.querySelector('a.revive');
            if (reviveButton && reviveButton.classList.contains('reviveNotAvailable')) {
                user.style.display = 'none'; // Hide the user
            }
        });
        console.log('Users with disabled revives have been hidden.');
    };

    // Observe DOM changes to ensure the button is re-added if the page content changes
    const observeDOMChanges = () => {
        const observer = new MutationObserver(() => {
            const hospitalList = document.querySelector('.userlist-wrapper.hospital-list-wrapper');
            if (hospitalList && !document.querySelector('button:contains("Hide Users with Disabled Revives")')) {
                createFilterButton();
            }
        });

        const targetNode = document.body;
        if (targetNode) {
            observer.observe(targetNode, { childList: true, subtree: true });
        } else {
            console.error('Failed to observe the DOM. Body element not found.');
        }
    };

    // Initialize the script
    const init = () => {
        createFilterButton();
        observeDOMChanges();
    };

    init();
    console.log('Torn Hospital Revive Filter Script loaded successfully.');
})();
