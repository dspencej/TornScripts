// ==UserScript==
// @name         Torn Hospital Revive Filter
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.3.0
// @description  Adds filtering functionality to the Torn hospital page, hides specific players based on revive status or hospitalization reasons.
// @author       Dustin Spencer
// @license      MIT
// @match        https://www.torn.com/hospitalview.php
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// ==/UserScript==

(function () {
    'use strict';

    let filterActive = true; // Filter is applied by default

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
        filterButton.textContent = 'Disable Filter';
        filterButton.style.padding = '10px 20px';
        filterButton.style.backgroundColor = '#444';
        filterButton.style.color = '#fff';
        filterButton.style.border = 'none';
        filterButton.style.borderRadius = '5px';
        filterButton.style.cursor = 'pointer';
        filterButton.addEventListener('click', toggleFilter);

        container.appendChild(filterButton);

        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
            contentWrapper.prepend(container);
        } else {
            console.error('Failed to find content wrapper to prepend the filter button.');
        }
    };

    // Apply or remove the filter based on the current state
    const toggleFilter = () => {
        filterActive = !filterActive;
        const filterButton = document.querySelector('#revive-filter-button');
        filterButton.textContent = filterActive ? 'Disable Filter' : 'Enable Filter';

        if (filterActive) {
            applyFilter();
        } else {
            clearFilter();
        }
    };

    // Apply the filter to hide users with disabled revives or "Hospitalized by"
    const applyFilter = () => {
        const userElements = document.querySelectorAll('.userlist-wrapper.hospital-list-wrapper li');
        userElements.forEach((user) => {
            const reviveButton = user.querySelector('a.revive');
            const reasonElement = user.querySelector('.reason');
            const reasonText = reasonElement ? reasonElement.textContent.trim() : '';

            const hasDisabledRevives = reviveButton && reviveButton.classList.contains('reviveNotAvailable');
            const hasHospitalizedByReason1 = reasonText.includes('Hospitalized by');
            const hasHospitalizedByReason2 = reasonText.includes('Mugged by');

            if (hasDisabledRevives || hasHospitalizedByReason1 || hasHospitalizedByReason2) {
                user.style.display = 'none'; // Hide the user
            }
        });
        console.log('Filter applied: Users with disabled revives or "Hospitalized by" reasons are hidden.');
    };

    // Clear the filter to show all users
    const clearFilter = () => {
        const userElements = document.querySelectorAll('.userlist-wrapper.hospital-list-wrapper li');
        userElements.forEach((user) => {
            user.style.display = ''; // Reset display to default
        });
        console.log('Filter cleared: All users are visible.');
    };

    // Observe DOM changes to ensure the button is re-added if the page content changes
    const observeDOMChanges = () => {
        const observer = new MutationObserver(() => {
            if (!document.querySelector('#revive-filter-button')) {
                createFilterButton();
            }
            if (filterActive) {
                applyFilter(); // Reapply filter if new elements are added
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
        applyFilter(); // Apply the filter by default
        observeDOMChanges();
    };

    init();
    console.log('Torn Hospital Revive Filter Script loaded successfully.');
})();
