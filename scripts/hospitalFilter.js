// ==UserScript==
// @name         Torn Hospital Revive Filter
// @namespace    https://github.com/dspencej/TornScripts
// @version      2.5.0
// @description  Adds filtering functionality to the Torn hospital page with persistent filters and enhanced UI. "Disabled Revives" condition overrides other filters if active.
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
        if (document.querySelector('#revive-filter-container')) return;

        const container = document.createElement('div');
        container.id = 'revive-filter-container';
        container.style.padding = '15px';
        container.style.backgroundColor = '#282c34';
        container.style.color = '#ffffff';
        container.style.marginBottom = '15px';
        container.style.borderRadius = '8px';
        container.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'start';

        const header = document.createElement('h3');
        header.textContent = 'Hospital Filter Options';
        header.style.marginBottom = '10px';
        header.style.color = '#61dafb';
        container.appendChild(header);

        const filterStates = loadFilterStates();

        filterOptions.forEach(option => {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.marginBottom = '8px';

            const label = document.createElement('label');
            label.setAttribute('for', option.id);
            label.textContent = option.label;
            label.style.marginLeft = '10px';
            label.style.fontSize = '14px';
            label.style.cursor = 'pointer';
            label.style.color = '#ffffff';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = option.id;
            checkbox.checked = filterStates[option.id];
            checkbox.style.display = 'none';

            const toggle = document.createElement('span');
            toggle.className = 'toggle-switch';
            toggle.style.position = 'relative';
            toggle.style.display = 'inline-block';
            toggle.style.width = '34px';
            toggle.style.height = '20px';
            toggle.style.backgroundColor = checkbox.checked ? '#61dafb' : '#ccc';
            toggle.style.borderRadius = '20px';
            toggle.style.transition = 'background-color 0.3s';
            toggle.style.cursor = 'pointer';

            const toggleCircle = document.createElement('span');
            toggleCircle.style.position = 'absolute';
            toggleCircle.style.width = '16px';
            toggleCircle.style.height = '16px';
            toggleCircle.style.borderRadius = '50%';
            toggleCircle.style.backgroundColor = '#ffffff';
            toggleCircle.style.top = '2px';
            toggleCircle.style.left = checkbox.checked ? '16px' : '2px';
            toggleCircle.style.transition = 'left 0.3s';

            toggle.appendChild(toggleCircle);

            checkbox.addEventListener('change', () => {
                toggle.style.backgroundColor = checkbox.checked ? '#61dafb' : '#ccc';
                toggleCircle.style.left = checkbox.checked ? '16px' : '2px';
                applyFilter();
            });

            toggle.addEventListener('click', () => {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            });

            wrapper.appendChild(checkbox);
            wrapper.appendChild(toggle);
            wrapper.appendChild(label);
            container.appendChild(wrapper);
        });

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

            // If "Disabled Revives" is active and the user has disabled revives, always hide
            if (filters['filter-disabled-revives'] && reviveButton && reviveButton.classList.contains('reviveNotAvailable')) {
                user.style.display = 'none';
                return;
            }

            const shouldShow =
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

    const observeDOMChanges = () => {
        const observer = new MutationObserver(() => {
            if (!document.querySelector('#revive-filter-container')) {
                createFilterUI();
                applyFilter();
            }
        });

        const targetNode = document.querySelector('.content-wrapper');
        if (targetNode) {
            observer.observe(targetNode, { childList: true, subtree: true });
        } else {
            console.error('Failed to observe the DOM. Content wrapper element not found.');
        }
    };

    const init = () => {
        createFilterUI();
        applyFilter();
        observeDOMChanges();
    };

    init();
    console.log('Torn Hospital Revive Filter Script with "Disabled Revives" priority loaded successfully.');
})();
