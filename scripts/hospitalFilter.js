// ==UserScript==
// @name         Torn Hospital Revive Filter
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.8.0
// @description  Filters the Hospital Page
// @author       Dustin Spencer
// @license      MIT
// @match        https://www.torn.com/hospitalview.php
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// ==/UserScript==

(function () {
    'use strict';

    // Global flag to control whether filtering is active.
    let filterActive = true;

    // Define filter settings; each key corresponds to a checkbox control.
    let filterSettings = {
        hideDisabledRevives: true,
        hideHospitalizedBy: true,
        hideMuggedBy: true,
        hideAttackedBy: true,
        hideIpecac: true,
        hideLostTo: true
    };

    // Create the filter UI, including the master toggle button and individual checkboxes.
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

        // Create master toggle button to enable/disable filtering entirely.
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

        // Define each individual filter control.
        const controls = [
            { key: 'hideDisabledRevives', label: 'Hide Disabled Revives', default: filterSettings.hideDisabledRevives },
            { key: 'hideHospitalizedBy', label: "Hide 'Hospitalized by'", default: filterSettings.hideHospitalizedBy },
            { key: 'hideMuggedBy', label: "Hide 'Mugged by'", default: filterSettings.hideMuggedBy },
            { key: 'hideAttackedBy', label: "Hide 'Attacked by'", default: filterSettings.hideAttackedBy },
            { key: 'hideIpecac', label: "Hide 'Ipecac Syrup ingestion'", default: filterSettings.hideIpecac },
            { key: 'hideLostTo', label: "Hide 'Lost to'", default: filterSettings.hideLostTo }
        ];

        // Create a checkbox and label for each control.
        controls.forEach(control => {
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = control.key;
            checkbox.checked = control.default;
            checkbox.style.marginRight = '5px';
            checkbox.addEventListener('change', function () {
                filterSettings[control.key] = this.checked;
                // Only reapply filter if filtering is active.
                if (filterActive) {
                    applyFilter();
                }
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(control.label));
            container.appendChild(label);
        });

        // Insert the controls into the page; adjust the selector if necessary.
        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
            contentWrapper.prepend(container);
        } else {
            console.error('Failed to find content wrapper to prepend the filter controls.');
        }
    };

    // Toggle the master filter on or off.
    const toggleMasterFilter = () => {
        filterActive = !filterActive;
        const masterToggleButton = document.querySelector('#master-filter-toggle-button');
        if (masterToggleButton) {
            masterToggleButton.textContent = filterActive ? 'Disable Filters' : 'Enable Filters';
        }

        // Enable or disable the checkboxes so users see they are inactive when filtering is off.
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

    // Apply the filter: iterate over each user entry and hide it if any active filter condition is met.
    const applyFilter = () => {
        const userElements = document.querySelectorAll('.userlist-wrapper.hospital-list-wrapper li');
        userElements.forEach((user) => {
            const reviveButton = user.querySelector('a.revive');
            const reasonElement = user.querySelector('.reason');
            const reasonText = reasonElement ? reasonElement.textContent.trim() : '';
            let shouldHide = false;

            // Check each filter setting.
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
        console.log('Filter applied with current settings:', filterSettings);
    };

    // Clear the filter to show all users.
    const clearFilter = () => {
        const userElements = document.querySelectorAll('.userlist-wrapper.hospital-list-wrapper li');
        userElements.forEach((user) => {
            user.style.display = ''; // Reset the display style to default
        });
        console.log('Filter cleared: All users are visible.');
    };

    // Observe DOM changes to ensure that the filter controls remain visible and new elements get filtered.
    const observeDOMChanges = () => {
        const targetNode = document.querySelector('.content-wrapper');
        if (!targetNode) {
            console.error('Failed to observe the DOM. Content wrapper element not found.');
            return;
        }

        const observer = new MutationObserver(() => {
            if (!document.querySelector('#revive-filter-controls')) {
                createFilterControls();
            }
            // Reapply the filter if new elements are added and filtering is active.
            if (filterActive) {
                applyFilter();
            }
        });

        observer.observe(targetNode, { childList: true, subtree: true });
    };

    // Initialize the script once the DOM is fully loaded.
    const init = () => {
        createFilterControls();
        if (filterActive) {
            applyFilter(); // Apply filters initially if active
        }
        observeDOMChanges();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('Torn Hospital Revive Filter with Checkboxes and Master Toggle loaded successfully.');
})();
