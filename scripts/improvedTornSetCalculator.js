// ==UserScript==
// @name         Improved Torn Set Calculator
// @namespace    https://github.com/dspencej
// @version      1.0.0
// @description  Calculates prices of plushie, flower, and other sets with improved sorting, error handling, and user preferences. Adapted from script by MrHat / foilman
// @author       Dustin Spencer
// @require      http://cdnjs.cloudflare.com/ajax/libs/accounting.js/0.4.1/accounting.min.js
// @match        http://www.torn.com/imarket.php*
// @match        https://www.torn.com/imarket.php*
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedTornSetCalculator.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedTornSetCalculator.js
// @license      MIT
// ==/UserScript==

var itemSets = [
    { name: "Plushie Set", points: 10, itemIds: ["186", "215", "187", "261", "618", "258", "273", "269", "266", "268", "281", "274", "384"] },
    { name: "Exotic Flower Set", points: 10, itemIds: ["260", "617", "263", "272", "264", "271", "267", "277", "282", "276", "385"] },
    { name: "Medieval Coin Set", points: 100, itemIds: ["450", "451", "452"] },
    { name: "Vairocana Buddha", points: 100, itemIds: ["454"] },
    { name: "Ganesha Sculpture", points: 250, itemIds: ["453"] },
    { name: "Shabti Sculpture", points: 500, itemIds: ["458"] },
    { name: "Scripts from the Quran Set", points: 1000, itemIds: ["455", "456", "457"] },
    { name: "Senet Game Set", points: 2000, itemIds: ["460", "461", "462"] },
    { name: "Egyptian Amulet", points: 10000, itemIds: ["459"] }
];

// Function to show loading message
function showLoadingMessage() {
    var container = $('#setCalculator');
    if (!container.length) {
        container = $('<div>').attr('id', 'setCalculator').addClass('msg right-round');
        var wrapper = $('<div>').addClass('info-msg border-round').html($('<i>').addClass('info-icon'));
        wrapper.append(container);
        wrapper.prependTo($('.main-market-page'));
    }
    container.html('<span>Loading item sets...</span>');
}

// Function to sort the results
function sortResults(setResults, criteria) {
    switch (criteria) {
        case 'totalCost':
            return setResults.sort((a, b) => a.totalCost - b.totalCost);
        case 'name':
            return setResults.sort((a, b) => a.set.name.localeCompare(b.set.name));
        default:
            return setResults.sort((a, b) => a.individualCost - b.individualCost); // Default to cost per point
    }
}

// Function to display results
function displayResults(sortedResults) {
    var container = $('#setCalculator');
    container.empty();

    var message = sortedResults.map(function(setResult) {
        return `
            One ${setResult.set.name} costs <b>${accounting.formatMoney(setResult.totalCost, "$", 0)}</b>. 
            This equals to <b>${accounting.formatMoney(setResult.individualCost, "$", 0)}</b> per point.<br/>
        `;
    });

    container.append($('<span>').html(message));
}

// Function to handle items when loaded
function itemsLoaded(items) {
    var container = $('#setCalculator');
    container.empty();

    var setResults = [];

    $.each(itemSets, function(i, itemSet) {
        var sum = 0;
        $.each(items, function(j, item) {
            var occurrence = $.grep(itemSet.itemIds, function(itemId) {
                return itemId === item.itemID;
            }).length;

            sum += (parseInt(item.price) * occurrence);
        });

        if (sum > 0) {
            setResults.push({
                set: itemSet,
                totalCost: sum,
                individualCost: sum / itemSet.points
            });
        }
    });

    if (setResults.length) {
        var criteria = loadUserPreference('sortCriteria', 'individualCost');
        var sortedResults = sortResults(setResults, criteria);
        displayResults(sortedResults);
    } else {
        container.append($('<span>').html('No sets available.'));
    }
}

// Event listener for AJAX completion
$(document).ajaxComplete(function(e, xhr, settings) {
    var marketRegex = /^imarket.php\?rfcv=(.+)$/;
    if (marketRegex.test(settings.url)) {
        showLoadingMessage();
        try {
            var items = JSON.parse(xhr.responseText);
            if (items) {
                itemsLoaded(items);
            }
        } catch (error) {
            $('#setCalculator').html('<span>Error fetching item data. Please try again.</span>');
        }
    }
});

// Save and load user preferences
function saveUserPreference(key, value) {
    localStorage.setItem(key, value);
}

function loadUserPreference(key, defaultValue) {
    return localStorage.getItem(key) || defaultValue;
}

// Add sort control UI
function addSortControl() {
    var sortControl = $('<div>').attr('id', 'sortControl').addClass('sort-container').html(`
        <label for="sort-by">Sort by:</label>
        <select id="sort-by">
            <option value="individualCost">Cost per point</option>
            <option value="totalCost">Total cost</option>
            <option value="name">Name</option>
        </select>
    `);

    $('#setCalculator').before(sortControl);

    $('#sort-by').val(loadUserPreference('sortCriteria', 'individualCost'));

    $('#sort-by').change(function() {
        var criteria = $(this).val();
        saveUserPreference('sortCriteria', criteria);
        itemsLoaded(JSON.parse(xhr.responseText));  // Re-render with the selected sort option
    });
}

// Initialize UI components
$(document).ready(function() {
    addSortControl();
});
