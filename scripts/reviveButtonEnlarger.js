// ==UserScript==
// @name         Torn Revive Button Enlarger
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.12.0
// @description  Enlarges the revive button, hides display case button, and centers
// @author       dspencej
// @license      MIT
// @match        https://www.torn.com/profiles.php?XID=*
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/main/scripts/reviveButtonEnlarger.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/main/scripts/reviveButtonEnlarger.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    let _0xe = false;

    const _0x12 = () => {
        if (_0xe) return;
        const reviveButton = document.querySelector('.profile-button-revive');
        if (!reviveButton) return;
        const style = window.getComputedStyle(reviveButton);
        if (!style || style.display === 'none' || style.visibility === 'hidden') return;
        if (!(reviveButton.offsetWidth > 0 && reviveButton.offsetHeight > 0)) return;

        _0xe = true;
        setTimeout(() => {
            try {
                reviveButton.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            } catch (e) {
                reviveButton.scrollIntoView(true);
            }
        }, 150);
    };

    const _0x13 = () => {
        const reviveButton = document.querySelector('.profile-button-revive');
        if (reviveButton) {
            reviveButton.style.width = '200px';
            reviveButton.style.height = '200px';
            reviveButton.style.padding = '10px';
            reviveButton.style.margin = '10px';

            const svgIcon = reviveButton.querySelector('svg');
            if (svgIcon) {
                svgIcon.style.width = '160px';
                svgIcon.style.height = '160px';
            }
        }
    };

    const _0x14 = () => {
        const displayCaseButton = document.querySelector('.profile-button-viewDisplayCabinet');
        if (displayCaseButton) {
            displayCaseButton.style.display = 'none';
        }
    };

    const _0x17 = () => {
        _0x13();
        _0x14();
        _0x12();
    };

    const _0x18 = () => {
        const observerSelector = '.profile-button-revive, .profile-button-viewDisplayCabinet';
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (
                            node.nodeType === Node.ELEMENT_NODE &&
                            (node.matches(observerSelector) || node.querySelector(observerSelector))
                        ) {
                            _0x17();
                            return;
                        }
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    };

    const _0x19 = () => {
        _0x17();
        _0x18();
    };

    _0x19();
})();
