// ==UserScript==
// @name         Torn Hospital Revive Filter
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.6.0
// @description  Adds filtering functionality to the Torn hospital page with selectable filters via checkboxes.
// @author       Dustin Spencer
// @license      MIT
// @match        https://www.torn.com/hospitalview.php
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// ==/UserScript==

(function () {
    'use strict';

    // Create the filter UI
    const createFilterUI = () => {
        // Prevent duplicate UI
        if (document.querySelector('#revive-filter-container')) return;

        const container = document.createElement('div');
        container.id = 'revive-filter-container';
        container.style.padding = '10px';
        container.style.backgroundColor = '#1c1c1c';
        container.style.color = '#fff';
        container.style.marginBottom = '10px';
        container.style.borderRadius = '5px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'start';

        const filterOptions = [
            { id: 'filter-disabled-revives', label: 'Disabled Revives' },
            { id: 'filter-hospitalized-by', label: 'Hospitalized by' },
            { id: 'filter-mugged-by', label: 'Mugged by' },
            { id: 'filter-attacked-by', label: 'Attacked by' },
            { id: 'filter-ipecac-syrup', label: 'Ipecac Syrup' },
            { id: 'filter-lost-to', label: 'Lost to' },
        ];

        filterOptions.forEach(option => {
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.marginBottom = '5px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = option.id;
            checkbox.style.marginRight = '10px';

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(option.label));
            container.appendChild(label);
        });

        const applyButton = document.createElement('button');
        applyButton.textContent = 'Apply Filters';
        applyButton.style.padding = '10px 20px';
        applyButton.style.backgroundColor = '#444';
        applyButton.style.color = '#fff';
        applyButton.style.border = 'none';
        applyButton.style.borderRadius = '5px';
        applyButton.style.cursor = 'pointer';
        applyButton.addEventListener('click', applyFilter);

        container.appendChild(applyButton);

        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
            contentWrapper.prepend(container);
        } else {
            console.error('Failed to find content wrapper to prepend the filter UI.');
        }
    };

    // Apply the selected filters
    const applyFilter = () => {
        const userElements = document.querySelectorAll('.userlist-wrapper.hospital-list-wrapper li');
        const filters = {
            disabledRevives: document.querySelector('#filter-disabled-revives').checked,
            hospitalizedBy: document.querySelector('#filter-hospitalized-by').checked,
            muggedBy: document.querySelector('#filter-mugged-by').checked,
            attackedBy: document.querySelector('#filter-attacked-by').checked,
            ipecacSyrup: document.querySelector('#filter-ipecac-syrup').checked,
            lostTo: document.querySelector('#filter-lost-to').checked,
        };

        userElements.forEach((user) => {
            const reviveButton = user.querySelector('a.revive');
            const reasonElement = user.querySelector('.reason');
            const reasonText = reasonElement ? reasonElement.textContent.trim() : '';

            const shouldHide =
                (filters.disabledRevives && reviveButton && reviveButton.classList.contains('reviveNotAvailable')) ||
                (filters.hospitalizedBy && reasonText.includes('Hospitalized by')) ||
                (filters.muggedBy && reasonText.includes('Mugged by')) ||
                (filters.attackedBy && reasonText.includes('Attacked by')) ||
                (filters.ipecacSyrup && reasonText.includes('Ipecac Syrup ingestion')) ||
                (filters.lostTo && reasonText.includes('Lost to'));

            user.style.display = shouldHide ? 'none' : '';
        });

        console.log('Filters applied.');
    };

    // Observe DOM changes to ensure the UI is re-added if the page content changes
    const observeDOMChanges = () => {
        const observer = new MutationObserver(() => {
            if (!document.querySelector('#revive-filter-container')) {
                createFilterUI();
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
        createFilterUI();
        observeDOMChanges();
    };

    init();
    console.log('Torn Hospital Revive Filter Script with checkboxes loaded successfully.');
})();
