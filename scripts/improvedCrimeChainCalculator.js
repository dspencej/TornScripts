// ==UserScript==
// @name         Improved Crime Chain Calculator
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.0.0
// @description  Calculates and displays your current crime chain with improved UI, error handling, and performance. Adapted from script by Ironhydedragon [2428902]
// @author       Dustin Spencer
// @match        https://www.torn.com/loader.php?sid=crimes*
// @license      MIT
// @run-at       document-end
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedCrimeChainCalculator.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedCrimeChainCalculator.js
// ==/UserScript==

let crimeChain = 0;
const redFlame = '#e64d1a';
const PDA_API_KEY = '###PDA-APIKEY###';

function isPDA() {
    return !/^(###).+(###)$/.test(PDA_API_KEY);
}

// API Key Storage
function setApiKey(apiKey) {
    localStorage.setItem('ihdScriptApiKey', apiKey);
}

function getApiKey() {
    return localStorage.getItem('ihdScriptApiKey');
}

// Render Stylesheet for form and crime chain display
const stylesheet = `
  <style>
    #crime-chain { cursor: unset; }
    #api-form.header-wrapper-top { display: flex; justify-content: space-between; }
    #api-form.header-wrapper-top .container { display: flex; justify-content: start; align-items: center; }
    #api-form.header-wrapper-top input { width: clamp(180px, 50%, 250px); margin-left: 20px; border: 1px solid #444; }
    #api-form.header-wrapper-top a { margin-left: 10px; }
  </style>`;
function injectStylesheet() {
    document.head.insertAdjacentHTML('beforeend', stylesheet);
}

// Render API Key Input Form
function renderApiForm() {
    const topHeader = document.querySelector('#topHeaderBanner');
    if (document.querySelector('#api-form')) return;
    const apiFormHTML = `
      <div id="api-form" class="header-wrapper-top">
        <div class="container">
          <h2>API Key</h2>
          <input id="api-form__input" type="text" placeholder="Enter your Torn API key..." maxlength="16" />
          <a href="#" id="api-form__submit" class="btn">Submit</a>
        </div>
      </div>`;
    topHeader.insertAdjacentHTML('afterbegin', apiFormHTML);
}

// Display the Crime Chain
function renderCrimeChain() {
    const titleContainer = document.querySelector('.crimes-app .heading___dOsMq');
    if (document.querySelector('#crime-chain')) return;

    const crimeChainHTML = `
      <div class="linksContainer___LiOTN">
        <span id="crime-chain" class="linkContainer___X16y4">
          <span class="linkTitle____NPyM">Crime Chain: <span id="crime-chain__current">0</span></span>
        </span>
      </div>`;
    titleContainer.insertAdjacentHTML('afterend', crimeChainHTML);
}

// Update the crime chain display
function updateCrimeChainDisplay() {
    document.querySelector('#crime-chain__current').textContent = Math.floor(crimeChain);
}

// Fetch crimes from Torn API
async function fetchCrimes(toTimestamp = null) {
    try {
        const response = await fetch(`https://api.torn.com/user/?selections=log&cat=136${toTimestamp ? '&to=' + toTimestamp : ''}&key=${getApiKey()}`);
        if (!response.ok) throw new Error('Failed to fetch crime log.');
        return await response.json();
    } catch (error) {
        console.error(`Error fetching crimes: ${error.message}`);
        alert('Unable to fetch crime data. Please check your API key.');
        return null;
    }
}

// Calculate the crime chain
async function calculateCrimeChain() {
    let dataCollector = [];
    let initialData = await fetchCrimes();
    if (!initialData) return;

    // Helper function to collect crime data
    const collectCrimeData = (crimeLog) => {
        Object.values(crimeLog.log).forEach((logEntry) => {
            if (/Crime (success|fail|critical fail)/i.test(logEntry.title)) {
                dataCollector.push(logEntry);
            }
        });
    };
    collectCrimeData(initialData);

    // Fetch more crime data if needed
    while (!dataCollector.some((log) => /Crime critical fail/i.test(log.title))) {
        const lastTimestamp = dataCollector[0]?.timestamp - 1;
        let moreData = await fetchCrimes(lastTimestamp);
        if (!moreData) break;
        collectCrimeData(moreData);
    }

    // Process the collected crime data
    dataCollector.forEach((logEntry) => {
        if (/Crime success/i.test(logEntry.title)) {
            crimeChain++;
        } else if (/Crime fail/i.test(logEntry.title)) {
            crimeChain = crimeChain ? crimeChain / 2 : 0;
        } else if (/Crime critical fail/i.test(logEntry.title)) {
            crimeChain = 0;
        }
    });
    updateCrimeChainDisplay();
}

// Form submission handler for the API key
function handleApiKeySubmission() {
    const inputElement = document.querySelector('#api-form__input');
    const apiKey = inputElement.value;
    if (apiKey.length === 16) {
        setApiKey(apiKey);
        document.querySelector('#api-form').remove();
        window.location.reload();
    } else {
        inputElement.style.border = `2px solid ${redFlame}`;
    }
}

// Form validation for API key
function validateApiKeyInput() {
    const inputElement = document.querySelector('#api-form__input');
    const submitButton = document.querySelector('#api-form__submit');
    if (inputElement.value.length === 16) {
        submitButton.disabled = false;
        inputElement.style.border = '1px solid #444';
    } else {
        submitButton.disabled = true;
    }
}

// Real-time crime chain update observer
function observeCrimeUpdates() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length && mutation.addedNodes[0].classList?.contains('crimes-outcome-')) {
                const outcomeClass = mutation.addedNodes[0].classList.value.match(/crimes-outcome-(\w+)/)[1];
                if (outcomeClass === 'success') crimeChain++;
                else if (outcomeClass === 'failure' || outcomeClass === 'criticalFailure') crimeChain = Math.floor(crimeChain / 2);
                updateCrimeChainDisplay();
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Initialize the script
function initialize() {
    injectStylesheet();
    if (!getApiKey()) {
        renderApiForm();
        document.querySelector('#api-form__submit').addEventListener('click', handleApiKeySubmission);
        document.querySelector('#api-form__input').addEventListener('input', validateApiKeyInput);
        return;
    }
    renderCrimeChain();
    calculateCrimeChain();
    observeCrimeUpdates();
}

// Wait for the page to load and initialize
(async function () {
    console.log('Crime Chain Script Initialized');
    if (isPDA()) {
        setApiKey(PDA_API_KEY);
    }
    initialize();
})();
