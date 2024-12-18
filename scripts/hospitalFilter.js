// ==UserScript==
// @name         Torn Hospital Revive Filter
// @namespace    https://github.com/dspencej/TornScripts
// @version      2.2.0
// @description  Adds filtering functionality to the Torn hospital page.
// @author       Dustin Spencer
// @license      MIT
// @match        https://www.torn.com/hospitalview.php
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// ==/UserScript==

(function () {
    'use strict';

    const FILTER_STORAGE_KEY = 'torn_hospital_filters';

    // Default filter options
    const filterOptions = [
        { id: 'filter-disabled-revives', label: 'Disabled Revives' },
        { id: 'filter-hospitalized-by', label: 'Hospitalized by' },
        { id: 'filter-mugged-by', label: 'Mugged by' },
        { id: 'filter-attacked-by', label: 'Attacked by' },
        { id: 'filter-ipecac-syrup', label: 'Ipecac Syrup' },
        { id: 'filter-lost-to', label: 'Lost to' },
        { id: 'filter-crashed', label: 'Crashed' },
        { id: 'filter-exploded', label: 'Exploded' },
        { id: 'filter-swat', label: 'SWAT' },
        { id: 'filter-arson', label: 'Arson' },
    ];

    // Save filter states to localStorage
    const saveFilterStates = () => {
        const states = {};
        filterOptions.forEach(option => {
            const checkbox = document.querySelector(`#${option.id}`);
            states[option.id] = checkbox.checked;
        });
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(states));
    };

    // Load filter states from localStorage
    const loadFilterStates = () => {
        const savedStates = JSON.parse(localStorage.getItem(FILTER_STORAGE_KEY) || '{}');
        const states = filterOptions.reduce((acc, option) => {
            acc[option.id] = savedStates[option.id] !== undefined ? savedStates[option.id] : true; // Default to checked
            return acc;
        }, {});
        return states;
    };

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

        const filterStates = loadFilterStates();

        filterOptions.forEach(option => {
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.marginBottom = '5px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = option.id;
            checkbox.style.marginRight = '10px';
            checkbox.checked = filterStates[option.id]; // Set checkbox state based on localStorage or default

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
        applyButton.addEventListener('click', () => {
            saveFilterStates();
            applyFilter();
        });

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
        const filters = filterOptions.reduce((acc, option) => {
            const checkbox = document.querySelector(`#${option.id}`);
            acc[option.id] = checkbox && checkbox.checked;
            return acc;
        }, {});

        userElements.forEach((user) => {
            const reviveButton = user.querySelector('a.revive');
            const reasonElement = user.querySelector('.reason');
            const reasonText = reasonElement ? reasonElement.textContent.trim() : '';

            const shouldShow =
                (filters['filter-disabled-revives'] && reviveButton && reviveButton.classList.contains('reviveNotAvailable')) ||
                (filters['filter-hospitalized-by'] && reasonText.includes('Hospitalized by')) ||
                (filters['filter-mugged-by'] && reasonText.includes('Mugged by')) ||
                (filters['filter-attacked-by'] && reasonText.includes('Attacked by')) ||
                (filters['filter-ipecac-syrup'] && reasonText.includes('Ipecac Syrup ingestion')) ||
                (filters['filter-lost-to'] && reasonText.includes('Lost to')) ||
                (filters['filter-crashed'] && reasonText.includes('Crashed')) ||
                (filters['filter-exploded'] && reasonText.includes('Exploded')) ||
                (filters['filter-swat'] && reasonText.includes('SWAT')) ||
                (filters['filter-arson'] && reasonText.includes('arson'));

            user.style.display = shouldShow ? '' : 'none'; // Show if matching, otherwise hide
        });

        console.log('Filters applied.');
    };

    // Observe DOM changes to ensure the UI is re-added if the page content changes
    const observeDOMChanges = () => {
        const observer = new MutationObserver(() => {
            if (!document.querySelector('#revive-filter-container')) {
                createFilterUI();
                applyFilter(); // Reapply filters if new elements are added
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
        applyFilter();
        observeDOMChanges();
    };

    init();
    console.log('Torn Hospital Revive Filter Script with reversed checkbox logic loaded successfully.');
})();
