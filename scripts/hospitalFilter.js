// ==UserScript==
// @name         Torn Hospital Revive Filter
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.2.1
// @description  Adds functionality to hide users with disabled revives or specific hospitalization reasons on the Torn hospital page.
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
        // Prevent duplicate buttons
        if (document.querySelector('#revive-filter-button')) return;

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
        filterButton.id = 'revive-filter-button';
        filterButton.textContent = 'Filter Users';
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

    // Hide users with disabled revives or "Hospitalized by" in the reason
    const hideDisabledRevives = () => {
        const userElements = document.querySelectorAll('.userlist-wrapper.hospital-list-wrapper li');
        userElements.forEach((user) => {
            const reviveButton = user.querySelector('a.revive');
            const reasonElement = user.querySelector('.reason');
            const reasonText = reasonElement ? reasonElement.textContent.trim() : '';

            const hasDisabledRevives = reviveButton && reviveButton.classList.contains('reviveNotAvailable');
            const hasHospitalizedByReason = reasonText.includes('Hospitalized by');

            if (hasDisabledRevives || hasHospitalizedByReason) {
                user.style.display = 'none'; // Hide the user
            }
        });
        console.log('Users with disabled revives or "Hospitalized by" reasons have been hidden.');
    };

    // Observe DOM changes to ensure the button is re-added if the page content changes
    const observeDOMChanges = () => {
        const observer = new MutationObserver(() => {
            if (!document.querySelector('#revive-filter-button')) {
                createFilterButton();
            }
        });

        const targetNode = document.querySelector('.content-wrapper');
        if (targetNode) {
            observer.observe(targetNode, { childList: true, subtree: true });
        } else {
            console.error('Failed to observe the DOM. Content wrapper element not found.');
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
