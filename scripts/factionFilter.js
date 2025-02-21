// ==UserScript==
// @name         Torn Faction Member Filter
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.2.0
// @description  Filters faction members
// @author       dspencej
// @license      MIT
// @match        https://www.torn.com/factions.php?*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ----------------------------------------------------
    // 1. Load persisted settings
    // ----------------------------------------------------
    // Each checkbox here means “show entries with this attribute”.
    // When at least one checkbox in a group is checked, only rows matching one of those criteria are allowed.
    let filterSettings = {
        // Player status group – if any is checked, only show rows with one of the selected statuses.
        showOnline: false,
        showIdle: false,
        showOffline: false,
        // Hospital group:
        // If true, only show rows that represent a hospitalized player.
        showHospitalOnly: false,
        // Hospital reason group – only applied to hospital rows.
        // If any is checked, the hospital row must mention at least one of these phrases.
        showHospitalizedBy: false,
        showAttackedBy: false,
        showLostTo: false
    };

    let filterActive = true;
    const storedFilterActive = localStorage.getItem('factionFilterActive');
    if (storedFilterActive !== null) {
        filterActive = storedFilterActive === 'true';
    }
    const storedFilterSettings = localStorage.getItem('factionFilterSettings');
    if (storedFilterSettings) {
        try {
            const parsed = JSON.parse(storedFilterSettings);
            Object.assign(filterSettings, parsed);
        } catch (e) {
            // Use defaults if parsing fails.
        }
    }

    // ----------------------------------------------------
    // 2. Create the filter UI controls
    // ----------------------------------------------------
    function createFilterControls() {
        if (document.getElementById('faction-filter-controls')) return;

        const container = document.createElement('div');
        container.id = 'faction-filter-controls';
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
        const masterButton = document.createElement('button');
        masterButton.id = 'master-filter-toggle-button';
        masterButton.textContent = filterActive ? 'Disable Filters' : 'Enable Filters';
        masterButton.style.padding = '8px 16px';
        masterButton.style.cursor = 'pointer';
        masterButton.addEventListener('click', toggleMasterFilter);
        container.appendChild(masterButton);

        // --- Player Status Group ---
        container.appendChild(createCheckboxControl('showOnline', 'Show Online', filterSettings.showOnline));
        container.appendChild(createCheckboxControl('showIdle', 'Show Idle', filterSettings.showIdle));
        container.appendChild(createCheckboxControl('showOffline', 'Show Offline', filterSettings.showOffline));

        // --- Hospital Group ---
        container.appendChild(createCheckboxControl('showHospitalOnly', 'Show only hospital', filterSettings.showHospitalOnly));

        // --- Hospital Reason Group (only applies to hospital rows) ---
        const reasonsContainer = document.createElement('div');
        reasonsContainer.style.display = 'flex';
        reasonsContainer.style.flexWrap = 'wrap';
        reasonsContainer.style.gap = '10px';
        reasonsContainer.style.marginLeft = '20px';
        reasonsContainer.id = 'hospital-reason-controls';
        reasonsContainer.appendChild(createCheckboxControl('showHospitalizedBy', 'Show if "Hospitalized by"', filterSettings.showHospitalizedBy));
        reasonsContainer.appendChild(createCheckboxControl('showAttackedBy', 'Show if "Attacked by"', filterSettings.showAttackedBy));
        reasonsContainer.appendChild(createCheckboxControl('showLostTo', 'Show if "Lost to"', filterSettings.showLostTo));
        container.appendChild(reasonsContainer);

        // Insert the controls into the page – adjust the selector as needed.
        const contentWrapper = document.querySelector('.content-wrapper') || document.body;
        contentWrapper.prepend(container);
    }

    function createCheckboxControl(key, labelText, checked) {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '5px';
        checkbox.id = key;
        checkbox.checked = checked;
        checkbox.addEventListener('change', function () {
            filterSettings[key] = this.checked;
            saveSettings();
            if (filterActive) applyFilter();
        });
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(labelText));
        return label;
    }

    function saveSettings() {
        localStorage.setItem('factionFilterSettings', JSON.stringify(filterSettings));
    }

    // ----------------------------------------------------
    // 3. Master toggle logic
    // ----------------------------------------------------
    function toggleMasterFilter() {
        filterActive = !filterActive;
        localStorage.setItem('factionFilterActive', filterActive.toString());
        const btn = document.getElementById('master-filter-toggle-button');
        if (btn) btn.textContent = filterActive ? 'Disable Filters' : 'Enable Filters';
        document.querySelectorAll('#faction-filter-controls input').forEach(input => {
            input.disabled = !filterActive;
        });
        if (filterActive) {
            applyFilter();
        } else {
            clearFilter();
        }
    }

    // ----------------------------------------------------
    // 4. Filtering logic
    // ----------------------------------------------------
    function applyFilter() {
        // Select all faction member rows.
        const rows = document.querySelectorAll('.table-body .table-row');
        rows.forEach(row => {
            let show = true; // start with row shown

            // --- Player Status Filtering ---
            // Build an array of selected statuses.
            const selectedStatuses = [];
            if (filterSettings.showOnline) selectedStatuses.push('online');
            if (filterSettings.showIdle) selectedStatuses.push('idle');
            if (filterSettings.showOffline) selectedStatuses.push('offline');
            if (selectedStatuses.length > 0) {
                // Determine row status based on the SVG's fill attribute.
                const statusWrap = row.querySelector('.userStatusWrap___ljSJG');
                if (statusWrap) {
                    const svg = statusWrap.querySelector('svg');
                    if (svg) {
                        const fillVal = svg.getAttribute('fill') || '';
                        let rowStatus = '';
                        if (fillVal.indexOf('#svg_status_online') !== -1) {
                            rowStatus = 'online';
                        } else if (fillVal.indexOf('#svg_status_idle') !== -1) {
                            rowStatus = 'idle';
                        } else if (fillVal.indexOf('#svg_status_offline') !== -1) {
                            rowStatus = 'offline';
                        }
                        if (selectedStatuses.indexOf(rowStatus) === -1) {
                            show = false;
                        }
                    }
                }
            }

            // --- Hospital Filtering ---
            // Determine if the row represents a hospitalized player.
            const hospitalLi = row.querySelector('li[title*="<b>Hospital</b>"]');
            const isHospital = Boolean(hospitalLi);

            // If the "Show only hospital" filter is active, then only show rows that are in hospital.
            if (filterSettings.showHospitalOnly && !isHospital) {
                show = false;
            }

            // --- Hospital Reason Filtering ---
            // For hospital rows, if any hospital reason checkbox is selected,
            // then only show the row if the hospital element’s title contains at least one selected phrase.
            const activeReasons = [];
            if (filterSettings.showHospitalizedBy) activeReasons.push("Hospitalized by");
            if (filterSettings.showAttackedBy) activeReasons.push("Attacked by");
            if (filterSettings.showLostTo) activeReasons.push("Lost to");
            if (isHospital && activeReasons.length > 0) {
                const titleText = hospitalLi.getAttribute('title') || '';
                const reasonMatch = activeReasons.some(reason => titleText.indexOf(reason) !== -1);
                if (!reasonMatch) {
                    show = false;
                }
            }

            row.style.display = show ? '' : 'none';
        });
    }

    function clearFilter() {
        const rows = document.querySelectorAll('.table-body .table-row');
        rows.forEach(row => row.style.display = '');
    }

    // ----------------------------------------------------
    // 5. Observe DOM changes (for pagination, dynamic content, etc.)
    // ----------------------------------------------------
    function observeDOMChanges() {
        const target = document.querySelector('.content-wrapper');
        if (!target) return;
        const observer = new MutationObserver(() => {
            if (!document.getElementById('faction-filter-controls')) {
                createFilterControls();
            }
            if (filterActive) {
                applyFilter();
            }
        });
        observer.observe(target, {childList: true, subtree: true});
    }

    // ----------------------------------------------------
    // 6. Initialize the script
    // ----------------------------------------------------
    function init() {
        createFilterControls();
        if (filterActive) {
            applyFilter();
        }
        observeDOMChanges();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
