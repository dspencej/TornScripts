// ==UserScript==
// @name         Torn Hospital Revive Filter (Improved)
// @namespace    https://github.com/dspencej/TornScripts
// @version      2.7.0
// @description  Adds filtering functionality to the Torn hospital page with persistent filters, enhanced UI, and improved maintainability.
// @license      MIT
// @match        https://www.torn.com/hospitalview.php
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// ==/UserScript==

(function () {
    'use strict';

    const FILTER_STORAGE_KEY = 'torn_hospital_filters';

    // Filter definitions: id, label, and reason keyword(s) to match
    const filterOptions = [
        { id: 'filter-disabled-revives', label: 'Disabled Revives', reasons: null }, // Handled specially
        { id: 'filter-hospitalized-by', label: 'Hospitalized by', reasons: ['hospitalized by'] },
        { id: 'filter-mugged-by', label: 'Mugged by', reasons: ['mugged by'] },
        { id: 'filter-attacked-by', label: 'Attacked by', reasons: ['attacked by'] },
        { id: 'filter-ipecac-syrup', label: 'Ipecac Syrup', reasons: ['ipecac syrup ingestion'] },
        { id: 'filter-lost-to', label: 'Lost to', reasons: ['lost to'] },
        { id: 'filter-crashed', label: 'Crashed', reasons: ['crashed'] },
        { id: 'filter-exploded', label: 'Exploded', reasons: ['exploded'] },
        { id: 'filter-swat', label: 'SWAT', reasons: ['swat'] },
        { id: 'filter-arson', label: 'Arson', reasons: ['arson'] },
    ];

    // Store frequently used selectors
    let contentWrapper = null;

    // Debounce timer for mutation observer
    let mutationTimeout = null;

    // Inject a style tag for better maintainability
    function injectStyles() {
        if (document.getElementById('revive-filter-styles')) return;

        const style = document.createElement('style');
        style.id = 'revive-filter-styles';
        style.textContent = `
            #revive-filter-container {
                padding: 15px;
                background-color: #282c34;
                color: #ffffff;
                margin-bottom: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                align-items: start;
            }
            #revive-filter-container h3 {
                margin-bottom: 10px;
                color: #61dafb;
            }
            #revive-filter-container label {
                margin-left: 10px;
                font-size: 14px;
                cursor: pointer;
                color: #ffffff;
            }
            .filter-option-wrapper {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
            }
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 34px;
                height: 20px;
                background-color: #ccc;
                border-radius: 20px;
                transition: background-color 0.3s;
                cursor: pointer;
            }
            .toggle-switch.checked {
                background-color: #61dafb;
            }
            .toggle-switch-circle {
                position: absolute;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background-color: #ffffff;
                top: 2px;
                left: 2px;
                transition: left 0.3s;
            }
            .toggle-switch.checked .toggle-switch-circle {
                left: 16px;
            }
        `;
        document.head.appendChild(style);
    }

    // Save filter states to localStorage
    const saveFilterStates = () => {
        const states = {};
        filterOptions.forEach(option => {
            const checkbox = document.querySelector(`#${option.id}`);
            if (checkbox) {
                states[option.id] = checkbox.checked;
            }
        });
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(states));
    };

    // Load filter states from localStorage
    const loadFilterStates = () => {
        const savedStates = JSON.parse(localStorage.getItem(FILTER_STORAGE_KEY) || '{}');
        return filterOptions.reduce((acc, option) => {
            // Default to true if not saved
            acc[option.id] = savedStates[option.id] !== undefined ? savedStates[option.id] : true;
            return acc;
        }, {});
    };

    // Create the filter UI
    const createFilterUI = () => {
        if (document.querySelector('#revive-filter-container')) return;

        const filterStates = loadFilterStates();
        const container = document.createElement('div');
        container.id = 'revive-filter-container';

        const header = document.createElement('h3');
        header.textContent = 'Hospital Filter Options';
        container.appendChild(header);

        filterOptions.forEach(option => {
            const wrapper = document.createElement('div');
            wrapper.className = 'filter-option-wrapper';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = option.id;
            checkbox.checked = filterStates[option.id];
            checkbox.style.display = 'none';

            const toggle = document.createElement('span');
            toggle.className = 'toggle-switch' + (checkbox.checked ? ' checked' : '');
            const toggleCircle = document.createElement('span');
            toggleCircle.className = 'toggle-switch-circle';
            toggle.appendChild(toggleCircle);

            const label = document.createElement('label');
            label.setAttribute('for', option.id);
            label.textContent = option.label;

            checkbox.addEventListener('change', () => {
                toggle.classList.toggle('checked', checkbox.checked);
                saveFilterStates();
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

        if (contentWrapper) {
            contentWrapper.prepend(container);
        } else {
            console.error('Hospital Revive Filter: Failed to find .content-wrapper to prepend the filter UI.');
        }
    };

    // Apply the selected filters
    const applyFilter = () => {
        const userElements = document.querySelectorAll('.userlist-wrapper.hospital-list-wrapper li');
        const filters = loadFilterStates(); // Reload states in case they've changed

        userElements.forEach(user => {
            const reviveButton = user.querySelector('a.revive');
            const reasonElement = user.querySelector('.reason');
            const reasonText = reasonElement ? reasonElement.textContent.trim().toLowerCase() : '';

            // If "Disabled Revives" is active and user has disabled revives, always hide
            if (filters['filter-disabled-revives'] && reviveButton && reviveButton.classList.contains('reviveNotAvailable')) {
                user.style.display = 'none';
                return;
            }

            // Determine if user should be shown by checking reason text against active filters
            let shouldShow = false;
            for (const option of filterOptions) {
                if (option.id === 'filter-disabled-revives') continue; // handled above

                if (filters[option.id] && option.reasons && option.reasons.some(r => reasonText.includes(r))) {
                    shouldShow = true;
                    break;
                }
            }

            user.style.display = shouldShow ? '' : 'none';
        });
    };

    // Observe DOM changes and recreate UI if missing
    const observeDOMChanges = () => {
        const observer = new MutationObserver(() => {
            // Debounce the UI updates to avoid excessive calls
            clearTimeout(mutationTimeout);
            mutationTimeout = setTimeout(() => {
                if (!document.querySelector('#revive-filter-container')) {
                    // Content wrapper might have changed, reselect it
                    contentWrapper = document.querySelector('.content-wrapper');
                    createFilterUI();
                    applyFilter();
                }
            }, 200);
        });

        if (contentWrapper) {
            observer.observe(contentWrapper, { childList: true, subtree: true });
        } else {
            console.error('Hospital Revive Filter: Failed to observe DOM. .content-wrapper not found.');
        }
    };

    const init = () => {
        injectStyles();
        contentWrapper = document.querySelector('.content-wrapper');
        if (!contentWrapper) {
            console.error('Hospital Revive Filter: .content-wrapper not found. The script will not run correctly.');
            return;
        }
        createFilterUI();
        applyFilter();
        observeDOMChanges();
    };

    init();
    console.log('Torn Hospital Revive Filter (Improved) initialized.');
})();
