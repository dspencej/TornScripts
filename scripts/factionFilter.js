// ==UserScript==
// @name         Torn Faction Member Filter
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.0.0
// @description  Adds filtering for faction members – filtering by revives enabled, player status, hospital status and hospitalization reason – with persistence.
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
    let filterSettings = {
        // When enabled, hide rows where the player's revive button is disabled.
        hideDisabledRevives: false,
        // Filter by player status. If checked, only rows matching the icon will show.
        filterOnline: false,
        filterIdle: false,
        filterOffline: false,
        // Hide players that appear to be in the hospital (based on text markers)
        hideInHospital: false,
        // Filter hospital reason: if nonempty, only show rows whose text contains this substring.
        filterHospitalReason: ""
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
            // fallback to defaults on parse error
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

        // Revives filter checkbox
        container.appendChild(createCheckboxControl('hideDisabledRevives', 'Hide players with disabled revives', filterSettings.hideDisabledRevives));

        // Player status controls – one for each status.
        container.appendChild(createCheckboxControl('filterOnline', 'Filter: Online', filterSettings.filterOnline));
        container.appendChild(createCheckboxControl('filterIdle', 'Filter: Idle', filterSettings.filterIdle));
        container.appendChild(createCheckboxControl('filterOffline', 'Filter: Offline', filterSettings.filterOffline));

        // Hospital status filter checkbox
        container.appendChild(createCheckboxControl('hideInHospital', 'Hide players in hospital', filterSettings.hideInHospital));

        // Hospitalization reason text input
        const reasonLabel = document.createElement('label');
        reasonLabel.textContent = 'Hospitalization reason contains: ';
        const reasonInput = document.createElement('input');
        reasonInput.type = 'text';
        reasonInput.id = 'filterHospitalReason';
        reasonInput.value = filterSettings.filterHospitalReason;
        reasonInput.style.padding = '4px';
        reasonInput.addEventListener('input', function () {
            filterSettings.filterHospitalReason = this.value;
            saveSettings();
            if (filterActive) applyFilter();
        });
        reasonLabel.appendChild(reasonInput);
        container.appendChild(reasonLabel);

        // Insert the controls into the page (adjust the selector as needed)
        const contentWrapper = document.querySelector('.content-wrapper') || document.body;
        contentWrapper.prepend(container);
    }

    function createCheckboxControl(key, labelText, checked) {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = key;
        checkbox.checked = checked;
        checkbox.style.marginRight = '5px';
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
        // Optionally disable/enable other inputs:
        document.querySelectorAll('#faction-filter-controls input').forEach(input => {
            if (input.id !== 'master-filter-toggle-button') {
                input.disabled = !filterActive;
            }
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
        // Assuming faction member rows have the selector '.table-body .table-row'
        const rows = document.querySelectorAll('.table-body .table-row');
        rows.forEach(row => {
            let shouldHide = false;

            // Revives filter:
            if (filterSettings.hideDisabledRevives) {
                const reviveBtn = row.querySelector('a.revive');
                if (reviveBtn && reviveBtn.classList.contains('reviveNotAvailable')) {
                    shouldHide = true;
                }
            }

            // Player status filter:
            const statusWrap = row.querySelector('.userStatusWrap___ljSJG');
            if (statusWrap) {
                const svg = statusWrap.querySelector('svg');
                if (svg) {
                    const classStr = svg.getAttribute('class') || '';
                    if (filterSettings.filterOnline && !classStr.includes('svg_status_online')) {
                        shouldHide = true;
                    }
                    if (filterSettings.filterIdle && !classStr.includes('svg_status_idle')) {
                        shouldHide = true;
                    }
                    if (filterSettings.filterOffline && !classStr.includes('svg_status_offline')) {
                        shouldHide = true;
                    }
                }
            }

            // Hospital status: assume that if the row’s text contains one of these keywords it is showing hospital info.
            if (filterSettings.hideInHospital) {
                if (row.textContent.includes('Hospitalized by') ||
                    row.textContent.includes('Attacked by') ||
                    row.textContent.includes('Lost to')) {
                    shouldHide = true;
                }
            }

            // Hospitalization reason filter:
            if (filterSettings.filterHospitalReason) {
                if (!row.textContent.toLowerCase().includes(filterSettings.filterHospitalReason.toLowerCase())) {
                    shouldHide = true;
                }
            }

            row.style.display = shouldHide ? 'none' : '';
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
    // 6. Initialize once DOM is loaded
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
