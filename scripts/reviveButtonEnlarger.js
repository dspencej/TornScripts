// ==UserScript==
// @name         Torn Revive Button Enlarger
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.8.0
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

    const _0xa = 150;
    const _0xb = 300;
    const _0xc = 50;

    let _0xd = false;
    let _0xe = false;

    const _0xf = (el) => {
        if (!el) return false;
        if (_0xd) return false;
        if (el.hasAttribute('disabled')) return false;
        if (el.classList && el.classList.contains('disabled')) return false;
        const style = window.getComputedStyle(el);
        if (!style) return false;
        if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none') return false;
        if (!(el.offsetWidth > 0 && el.offsetHeight > 0)) return false;
        return true;
    };

    function _0x10(element) {
        const delay = Math.floor(Math.random() * (_0xb - _0xa + 1)) + _0xa;
        setTimeout(() => {
            element.click();
        }, delay);
    }

    const _0x11 = () => {
        if (_0xd) return;
        const reviveButton = document.querySelector('.profile-button-revive');
        if (_0xf(reviveButton)) {
            _0xd = true;
            setTimeout(() => {
                try {
                    reviveButton.click();
                } catch (e) {
                    _0xd = false;
                }
            }, 250);
        }
    };

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

    function _0x15() {
        const hospitalDesc = document.querySelector('.description');
        if (!hospitalDesc) return;
        const reasonText = hospitalDesc.textContent.toLowerCase();
        if (!reasonText.includes('hospitalized by')) return;

        const reviveButton = document.querySelector('.profile-button-revive');
        if (reviveButton) {
            _0x10(reviveButton);
            return;
        }

        const okButton = document.querySelector('button.confirm-action.okay');
        if (okButton) {
            _0x10(okButton);
            return;
        }

        const dialog = document.querySelector('.profile-buttons-dialog');
        if (dialog) {
            const textEl = dialog.querySelector('.text');
            const yesButton = dialog.querySelector('.confirm-action-yes');
            const noButton = dialog.querySelector('.confirm-action-no');

            if (textEl && yesButton && noButton) {
                const match = textEl.textContent.match(/(\d+\.\d+)%/);
                if (match) {
                    const percentage = parseFloat(match[1]);
                    if (percentage > _0xc) {
                        const _0x16 = () => {
                            _0x10(yesButton);
                            document.removeEventListener('keydown', _0x16);
                        };
                        document.addEventListener('keydown', _0x16);
                    } else {
                        _0x10(noButton);
                    }
                } else {
                    _0x10(yesButton);
                }
            }
        }
    }

    const _0x17 = () => {
        _0x13();
        _0x14();
        _0x12();
        _0x11();
        _0x15();
    };

    const _0x18 = () => {
        const observerSelector = 'button.confirm-action.okay, .profile-buttons-dialog, .profile-button-revive, .description';
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