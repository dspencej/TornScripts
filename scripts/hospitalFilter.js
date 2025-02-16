// ==UserScript==
// @name         Torn Hospital Revive Filter
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.9.0
// @description  Adds hospital filtering with persistence across page loads and pagination
// @author       Dustin
// @license      MIT
// @match        https://www.torn.com/hospitalview.php
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// ==/UserScript==

(function () {
    'use strict';

    // ----------------------------------------------------
    // 1. Load persisted settings from localStorage, if any
    // ----------------------------------------------------

    // Default filter settings.
    let filterSettings = {
        hideDisabledRevives: true,
        hideHospitalizedBy: true,
        hideMuggedBy: true,
        hideAttackedBy: true,
        hideIpecac: true,
        hideLostTo: true
    };

    // Global flag to control whether filtering is active.
    let filterActive = true;

    // Try to load filterActive from localStorage
    const storedFilterActive = localStorage.getItem('hospitalFilterActive');
    if (storedFilterActive !== null) {
        filterActive = (storedFilterActive === 'true');
    }

    // Try to load filterSettings from localStorage
    const storedFilterSettings = localStorage.getItem('hospitalFilterSettings');
    if (storedFilterSettings) {
        try {
            const parsedSettings = JSON.parse(storedFilterSettings);
            // Merge loaded settings into defaults (in case new keys get added later)
            Object.assign(filterSettings, parsedSettings);
        } catch (e) {
            // If there's an error parsing, we ignore it and stick to defaults
        }
    }

    // ----------------------------------------------------
    // 2. Create the filter UI, including checkboxes + button
    // ----------------------------------------------------

    const createFilterControls = () => {
        // Prevent duplicate controls
        if (document.querySelector('#revive-filter-controls')) return;

        const container = document.createElement('div');
        container.id = 'revive-filter-controls';
        container.style.padding = '10px';
        container.style.backgroundColor = '#1c1c1c';
        container.style.color = '#fff';
        container.style.marginBottom = '10px';
        container.style.borderRadius = '5px';
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '10px';
        container.style.alignItems = 'center';

        // Master toggle button
        const masterToggleButton = document.createElement('button');
        masterToggleButton.id = 'master-filter-toggle-button';
        masterToggleButton.textContent = filterActive ? 'Disable Filters' : 'Enable Filters';
        masterToggleButton.style.padding = '10px 20px';
        masterToggleButton.style.backgroundColor = '#444';
        masterToggleButton.style.color = '#fff';
        masterToggleButton.style.border = 'none';
        masterToggleButton.style.borderRadius = '5px';
        masterToggleButton.style.cursor = 'pointer';
        masterToggleButton.addEventListener('click', toggleMasterFilter);
        container.appendChild(masterToggleButton);

        // Define each individual filter control
        const controls = [
            { key: 'hideDisabledRevives', label: 'Hide Disabled Revives' },
            { key: 'hideHospitalizedBy', label: "Hide 'Hospitalized by'" },
            { key: 'hideMuggedBy', label: "Hide 'Mugged by'" },
            { key: 'hideAttackedBy', label: "Hide 'Attacked by'" },
            { key: 'hideIpecac', label: "Hide 'Ipecac Syrup ingestion'" },
            { key: 'hideLostTo', label: "Hide 'Lost to'" }
        ];

        // Create a checkbox for each control
        controls.forEach(control => {
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = control.key;
            checkbox.checked = filterSettings[control.key];
            checkbox.style.marginRight = '5px';
            checkbox.disabled = !filterActive; // disable if master filter is off

            // When checkbox changes, update filterSettings and localStorage
            checkbox.addEventListener('change', function () {
                filterSettings[control.key] = this.checked;
                localStorage.setItem('hospitalFilterSettings', JSON.stringify(filterSettings));
                if (filterActive) {
                    applyFilter();
                }
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(control.label));
            container.appendChild(label);
        });

        // Insert the controls into the page
        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
            contentWrapper.prepend(container);
        }
    };

    // ----------------------------------------------------
    // 3. Master toggle logic
    // ----------------------------------------------------

    const toggleMasterFilter = () => {
        filterActive = !filterActive;
        localStorage.setItem('hospitalFilterActive', filterActive.toString());

        const masterToggleButton = document.querySelector('#master-filter-toggle-button');
        if (masterToggleButton) {
            masterToggleButton.textContent = filterActive ? 'Disable Filters' : 'Enable Filters';
        }

        // Enable or disable the checkboxes
        const checkboxes = document.querySelectorAll('#revive-filter-controls input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.disabled = !filterActive;
        });

        if (filterActive) {
            applyFilter();
        } else {
            clearFilter();
        }
    };

    // ----------------------------------------------------
    // 4. Apply or clear filters
    // ----------------------------------------------------

    // Hide users if they match any checked filter condition
    const applyFilter = () => {
        const userElements = document.querySelectorAll('.userlist-wrapper.hospital-list-wrapper li');
        userElements.forEach((user) => {
            const reviveButton = user.querySelector('a.revive');
            const reasonElement = user.querySelector('.reason');
            const reasonText = reasonElement ? reasonElement.textContent.trim() : '';
            let shouldHide = false;

            if (filterSettings.hideDisabledRevives) {
                const hasDisabledRevives = reviveButton && reviveButton.classList.contains('reviveNotAvailable');
                if (hasDisabledRevives) {
                    shouldHide = true;
                }
            }
            if (!shouldHide && filterSettings.hideHospitalizedBy && reasonText.includes('Hospitalized by')) {
                shouldHide = true;
            }
            if (!shouldHide && filterSettings.hideMuggedBy && reasonText.includes('Mugged by')) {
                shouldHide = true;
            }
            if (!shouldHide && filterSettings.hideAttackedBy && reasonText.includes('Attacked by')) {
                shouldHide = true;
            }
            if (!shouldHide && filterSettings.hideIpecac && reasonText.includes('Ipecac Syrup ingestion')) {
                shouldHide = true;
            }
            if (!shouldHide && filterSettings.hideLostTo && reasonText.includes('Lost to')) {
                shouldHide = true;
            }

            user.style.display = shouldHide ? 'none' : '';
        });
    };

    // Show all users
    const clearFilter = () => {
        const userElements = document.querySelectorAll('.userlist-wrapper.hospital-list-wrapper li');
        userElements.forEach((user) => {
            user.style.removeProperty('display');
        });
    };

    // ----------------------------------------------------
    // 5. Observe DOM changes (for pagination, etc.)
    // ----------------------------------------------------

    const observeDOMChanges = () => {
        const targetNode = document.querySelector('.content-wrapper');
        if (!targetNode) return;

        const observer = new MutationObserver(() => {
            // Recreate controls if they are missing
            if (!document.querySelector('#revive-filter-controls')) {
                createFilterControls();
            }
            // If filter is active, reapply it when new elements appear
            if (filterActive) {
                applyFilter();
            }
        });

        observer.observe(targetNode, { childList: true, subtree: true });
    };

    // ----------------------------------------------------
    // 6. Initialize once the DOM is loaded
    // ----------------------------------------------------

    const init = () => {
        createFilterControls();
        if (filterActive) {
            applyFilter();
        }
        observeDOMChanges();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
