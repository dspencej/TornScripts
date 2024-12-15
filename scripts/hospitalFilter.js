// ==UserScript==
// @name         Torn Hospital Filter
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.0.1
// @description  Adds filtering functionality to the Torn hospital list.
// @author       Dustin Spencer
// @license      MIT
// @match        https://www.torn.com/hospitalview.php
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/hospitalFilter.js
// ==/UserScript==

(function () {
    'use strict';

    // Create a filter menu UI
    const createFilterUI = () => {
        const container = document.createElement('div');
        container.style.padding = '10px';
        container.style.backgroundColor = '#1c1c1c';
        container.style.color = '#fff';
        container.style.marginBottom = '10px';
        container.style.borderRadius = '5px';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Filter by reason... (e.g., Overdosed on Xanax)';
        input.style.flexGrow = '1';
        input.style.marginRight = '10px';
        input.style.padding = '5px';
        input.style.borderRadius = '3px';
        input.style.border = '1px solid #666';

        const hideCheckbox = document.createElement('input');
        hideCheckbox.type = 'checkbox';
        hideCheckbox.id = 'hide-checkbox';
        const hideLabel = document.createElement('label');
        hideLabel.htmlFor = 'hide-checkbox';
        hideLabel.textContent = 'Hide matches';
        hideLabel.style.marginLeft = '5px';

        const filterButton = document.createElement('button');
        filterButton.textContent = 'Apply Filter';
        filterButton.style.padding = '5px 10px';
        filterButton.style.backgroundColor = '#444';
        filterButton.style.color = '#fff';
        filterButton.style.border = 'none';
        filterButton.style.borderRadius = '3px';
        filterButton.style.cursor = 'pointer';

        container.appendChild(input);
        container.appendChild(hideCheckbox);
        container.appendChild(hideLabel);
        container.appendChild(filterButton);

        document.querySelector('.content-wrapper').prepend(container);

        return { input, hideCheckbox, filterButton };
    };

    // Filter function
    const filterHospitalList = (filterText, hideMatches) => {
        const userList = document.querySelector('.user-info-list-wrap.revive');
        console.log('Filter button pressed!');
        if (!userList) return;

        const users = userList.querySelectorAll('li');
        users.forEach((user) => {
            const reasonElement = user.querySelector('.hosp.reason');
            if (!reasonElement) return;

            const reasonText = reasonElement.textContent.trim();
            if (reasonText.includes(filterText)) {
                user.style.display = hideMatches ? 'none' : '';
            } else {
                user.style.display = hideMatches ? '' : 'none';
            }
        });
    };

    // Set up the filter menu and attach functionality
    const setupFilter = () => {
        const { input, hideCheckbox, filterButton } = createFilterUI();
        console.log('Setting up listeners.');
        filterButton.addEventListener('click', () => {
            const filterText = input.value.trim();
            const hideMatches = hideCheckbox.checked;
            filterHospitalList(filterText, hideMatches);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const filterText = input.value.trim();
                const hideMatches = hideCheckbox.checked;
                filterHospitalList(filterText, hideMatches);
            }
        });
    };

    // Initialize the script
    const init = () => {
        const observer = new MutationObserver(() => {
            setupFilter();
        });

        const targetNode = document.querySelector('.userlist-wrapper.hospital-list-wrapper');
        if (targetNode) {
            observer.observe(targetNode, { childList: true, subtree: true });
        }

        setupFilter();
    };

    init();
    console.log('Torn Hospital Filter Script loaded successfully.');
})();
