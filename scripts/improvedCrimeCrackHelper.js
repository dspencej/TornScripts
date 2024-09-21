// ==UserScript==
// @name         Improved Crime Crack Helper
// @namespace    https://github.com/dspencej/TornScripts/blob/main/scripts/improvedCrimeCrackHelper.js
// @version      1.0.0
// @description  Utilize password database to crack Torn crimes, including support for TornPDA. Adapted from the original script by nodelore [2786679] and NEvaldas [352097].
// @author       Dustin Spencer
// @match        https://www.torn.com/loader.php?sid=crimes*
// @grant        GM_getValue
// @grant        GM.getValue
// @grant        GM_setValue
// @grant        GM.setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @license      MIT
// @downloadURL  https://github.com/dspencej/TornScripts/blob/main/scripts/improvedCrimeCrackHelper.js
// @updateURL    https://github.com/dspencej/TornScripts/blob/main/scripts/improvedCrimeCrackHelper.js
// ==/UserScript==
'use strict';

(function () {
  // Avoid duplicate injection
  if (window.CRACK_HELPER_INJECTED) {
    return;
  }
  window.CRACK_HELPER_INJECTED = true;

  const cracker_record = {};
  const filter_history = {};

  const isMobile = () => window.innerWidth <= 768;

  // Check if the script is running inside TornPDA
  let inPDA = false;
  const PDAKey = "###PDA-APIKEY###";
  if (PDAKey && PDAKey.charAt(0) !== "#") {
    inPDA = true;
  }

  const http_get = (url, success, failed, retries = 3, delay = 1000) => {
    GM_xmlhttpRequest({
      method: "get",
      url: url,
      timeout: 30000,
      ontimeout: (err) => {
        if (retries > 0) {
          setTimeout(() => http_get(url, success, failed, retries - 1, delay * 2), delay);
        } else {
          failed(err);
        }
      },
      onerror: (err) => {
        if (retries > 0) {
          setTimeout(() => http_get(url, success, failed, retries - 1, delay * 2), delay);
        } else {
          failed(err);
        }
      },
      onload: (res) => {
        success(res);
      }
    });
  };

  // ========================= Configuration =========================================================
  const CRACKER_STATUS_KEY = "CRACKER_STATUS";
  const defaultSel = isMobile() ? "100k" : "1m";
  let CRACKER_SEL = localStorage.getItem(CRACKER_STATUS_KEY) || defaultSel;
  const LIMIT = 10;

  // Password database with multiple sources
  const PASSWORD_DATABASE = {
    "10m": "https://raw.githubusercontent.com/ignis-sec/Pwdb-Public/master/wordlists/ignis-10M.txt",
    "1m": "https://raw.githubusercontent.com/ignis-sec/Pwdb-Public/master/wordlists/ignis-1M.txt",
    "1m_alter": "https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10-million-password-list-top-1000000.txt",
    "100k": "https://raw.githubusercontent.com/ignis-sec/Pwdb-Public/master/wordlists/ignis-100K.txt",
    "100k_alter": "https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10-million-password-list-top-100000.txt",
    "10k": "https://raw.githubusercontent.com/ignis-sec/Pwdb-Public/master/wordlists/ignis-10K.txt",
    "1k": "https://raw.githubusercontent.com/ignis-sec/Pwdb-Public/master/wordlists/ignis-1K.txt"
  };
  // ===================================================================================================

  if (GM) {
    window.GM_getValue = GM.getValue;
    window.GM_setValue = GM.setValue;
  }

  if (!PASSWORD_DATABASE[CRACKER_SEL]) {
    console.log("Failed to fetch cracker password list.");
    return;
  }
  const CRACKER_HELPER_KEY = "CRACKER_HELPER_STORAGE";

  let cracker_helper = {
    source: "",
    data: []
  };

  let titleInterval, updateInterval;
  let is_injected = false;

  const setCrackTitle = (title) => {
    if (titleInterval) {
      clearInterval(titleInterval);
    }
    titleInterval = setInterval(() => {
      const titleQuery = "div[class*=titleBar___] div[class*=title___]";
      if ($(titleQuery).length > 0) {
        $(titleQuery).text(`CRACKING (${title})`);
        clearInterval(titleInterval);
        titleInterval = undefined;
      }
    }, 1000);
  };

  const fetch_action = (useCache = true) => {
    setCrackTitle("Loading from network");
    http_get(
      PASSWORD_DATABASE[CRACKER_SEL],
      (res) => {
        const text = res.responseText;
        cracker_helper.data = text.split("\n").map(pwd => pwd.trim());
        cracker_helper.source = PASSWORD_DATABASE[CRACKER_SEL];
        if (useCache) {
          GM_setValue(CRACKER_HELPER_KEY, cracker_helper);
        }
        setCrackTitle("Loaded");
        updatePage();
        console.log("Loaded cracker_helper from network:", cracker_helper);
      },
      (err) => {
        console.error(`Error fetching password list: ${err}`);
        alert('Failed to load password list. Please try again later.');
      }
    );
  };

  const insertSelector = () => {
    let options = "";
    for (let abbr in PASSWORD_DATABASE) {
      options += `<option value="${abbr}">${abbr}</option>`;
    }

    const selector = $(`
      <div class="cracker-helper-selector">
        <label>Source:</label>
        <select name="crackerSel">${options}</select>
      </div>
    `);
    selector.find("select").val(CRACKER_SEL);

    selector.find("select").change(function () {
      CRACKER_SEL = $(this).val();
      localStorage.setItem(CRACKER_STATUS_KEY, CRACKER_SEL);
      $("div.cracker-helper-panel").remove();
      fetch_action();
    });

    if ($("div.cracker-helper-selector").length === 0) {
      $("h4[class*=heading___]").after(selector);
    }
  };

  const addStyle = () => {
    const styles = `
      .cracker-helper-selector{
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: bold;
      }
      .cracker-helper-selector select{
        background: transparent;
        text-align: center;
        border: none;
      }
      .dark-mode .cracker-helper-selector select{
        color: #F2F2F2 !important;
      }
      .dark-mode .cracker-helper-selector select option{
        background: #333 !important;
        color: #F2F2F2 !important;
      }
    `;
    const isTampermonkeyEnabled = typeof unsafeWindow !== "undefined";
    if (isTampermonkeyEnabled) {
      GM_addStyle(styles);
    } else {
      let style = document.createElement("style");
      style.type = "text/css";
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  };

  const inject_once = () => {
    if (is_injected) {
      return;
    }
    addStyle();
    interceptFetch();

    if (inPDA) {
      console.log("Loading password list for TornPDA");
      fetch_action(false);
    } else {
      GM.getValue(CRACKER_HELPER_KEY, cracker_helper)
        .then((cracker) => {
          cracker_helper = cracker;
          if (cracker_helper.source === PASSWORD_DATABASE[CRACKER_SEL]) {
            setCrackTitle("Loaded");
            updatePage();
            console.log("Loaded cracker_helper from cache:", cracker_helper);
          } else {
            fetch_action();
          }
        })
        .catch(() => {
          fetch_action(false);
        });
    }

    is_injected = true;
  };

  console.log("Torn Crime Crack Helper starts.");
  updatePage();

  window.onhashchange = () => {
    updatePage();
  };
})();
