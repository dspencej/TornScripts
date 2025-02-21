// ==UserScript==
// @name         Hide Torn Info Message
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.0.0
// @description  Hides the congratulatory level-up message on all Torn pages.
// @author       dspencej
// @license      MIT
// @match        https://www.torn.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const style = document.createElement('style');
    style.innerHTML = `.info-msg.border-round { display: none !important; }`;
    document.head.appendChild(style);
})();
