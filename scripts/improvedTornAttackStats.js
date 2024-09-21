// ==UserScript==
// @name         Improved Torn Attack Stats
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.0.0
// @description  Get detailed information on the attack page, including win/loss stats, consumables, drugs, refills, and more. Adapted from script by Mathias
// @author       Dustin Spencer
// @match        https://www.torn.com/loader.php*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedTornAttackStats.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedTornAttackStats.js
// ==/UserScript==

(function() {
    'use strict';

    const API_KEY = localStorage.getItem('torn-attack-api-key') || prompt("Please enter your Torn API key:");
    if (!API_KEY) {
        alert('API key is required for Torn Attack Stats.');
        return;
    }

    // Save API key in localStorage for future use
    localStorage.setItem('torn-attack-api-key', API_KEY);

    const url = new URL(window.location.href);

    if (url.searchParams.get('sid') === 'attack') {
        const attackId = url.searchParams.get('user2ID');
        if (!attackId) {
            console.log('Error: Attack ID not found.');
            return;
        }

        // API request for attack stats
        fetchAttackData(attackId, API_KEY).then(displayAttackInfo).catch(handleError);
    }

    /**
     * Fetches attack data from Torn API for a given attack ID.
     * @param {string} attackId - The attacker's ID.
     * @param {string} apiKey - The user's Torn API key.
     * @returns {Promise} - A promise that resolves to the attack data.
     */
    function fetchAttackData(attackId, apiKey) {
        const apiUrl = `https://api.torn.com/user/${attackId}?selections=profile,personalstats&key=${apiKey}`;
        console.log(`Fetching attack data: ${apiUrl}`);

        return fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching attack data: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(`API Error: ${data.error.error}`);
                }
                return data;
            });
    }

    /**
     * Displays the fetched attack information on the attack page.
     * @param {Object} data - The attack data fetched from the Torn API.
     */
    function displayAttackInfo(data) {
        const joinBtn = $("button:contains('Start fight'), button:contains('Join fight')").closest("button");
        if (!joinBtn.length) return;

        const { personalstats, last_action, faction } = data;

        const attackInfoHtml = `
            <div id='attackInfo'>
                <br />Attacks: <font color='green'>[W] ${parseInt(personalstats.attackswon) || 0}</font> <font color='red'>[L] ${parseInt(personalstats.attackslost) || 0}</font>
                <br />Defends: <font color='green'>[W] ${parseInt(personalstats.defendswon) || 0}</font> <font color='red'>[L] ${parseInt(personalstats.defendslost) || 0}</font>
                <br />Drugs: ${parseInt(personalstats.drugsused) || 0} used (${parseInt(personalstats.xantaken) || 0} xan)
                <br />Consumables: ${parseInt(personalstats.consumablesused) || 0} used
                <br />Refills: ${parseInt(personalstats.refills) || 0} used
                <br />Networth: $${(personalstats.networth || 0).toLocaleString("en")}
                <br />Last action: ${last_action.relative}
                <br />Faction: <a href='https://www.torn.com/factions.php?step=profile&ID=${faction.faction_id}'>${faction.faction_name}</a>
            </div>`;

        // Insert the attack info below the join button
        $(joinBtn).after(attackInfoHtml);
    }

    /**
     * Handles any errors encountered during the fetch operation.
     * @param {Error} error - The error object.
     */
    function handleError(error) {
        console.error(`Error: ${error.message}`);
        alert(`An error occurred: ${error.message}`);
    }
})();
