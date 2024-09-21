// ==UserScript==
// @name         Improved Pickpocketing Colors
// @namespace    https://github.com/dspencej
// @version      1.0.3
// @description  Automatically colorizes target elements based on their risk level and user skill, and adds a color-coded border for easy identification, based on the script by Korbrm [2931507]
// @author       Dustin Spencer
// @match        https://www.torn.com/loader.php?sid=crimes*
// @grant        none
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedPickpocketingColors.js
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedPickpocketingColors.js
// ==/UserScript==

(function () {
    'use strict';

    const categoryColorMap = {
        "Safe": "#37b24d",
        "Moderately Unsafe": "#74b816",
        "Unsafe": "#f59f00",
        "Risky": "#f76707",
        "Dangerous": "#f03e3e",
        "Very Dangerous": "#7048e8",
    };

    const markGroups = {
        "Safe": ["Drunk man", "Drunk woman", "Homeless person", "Junkie", "Elderly man", "Elderly woman"],
        "Moderately Unsafe": ["Classy lady", "Laborer", "Postal worker", "Young man", "Young woman", "Student"],
        "Unsafe": ["Rich kid", "Sex worker", "Thug"],
        "Risky": ["Jogger", "Businessman", "Businesswoman", "Gang member", "Mobster"],
        "Dangerous": ["Cyclist"],
        "Very Dangerous": ["Police officer"],
    };

    let lastSkill = null;

    function findAncestor(element, levels) {
        let parent = element;
        for (let i = 0; i < levels; i++) {
            if (parent.parentElement) {
                parent = parent.parentElement;
            }
        }
        return parent;
    }

    function setBorderForParent(element, category, sideColorMap) {
        const parentElement = findAncestor(element, 3);
        if (!parentElement.classList.contains('processed')) {
            parentElement.style.borderLeft = `3px solid ${sideColorMap[category]}`;
            parentElement.classList.add('processed');
        }
    }

    function updateDivColors() {
        const spanElement = document.querySelector('.value___FdkAT.copyTrigger___fsdzI');
        if (!spanElement) return;

        const pickpocketSkill = parseInt(spanElement.textContent, 10);
        if (pickpocketSkill === lastSkill) return;  // No need to update if the skill is the same
        lastSkill = pickpocketSkill;

        let sideColorMap;
        if (pickpocketSkill < 10) {
            sideColorMap = categoryColorMap;
        } else if (pickpocketSkill < 35) {
            sideColorMap = categoryColorMap;
        } else if (pickpocketSkill < 65) {
            sideColorMap = categoryColorMap;
        } else if (pickpocketSkill < 80) {
            sideColorMap = categoryColorMap;
        } else {
            sideColorMap = categoryColorMap;
        }

        const divElements = document.querySelectorAll('.titleAndProps___DdeVu:not(.processed)');
        divElements.forEach(divElement => {
            const divContent = divElement.querySelector('div').textContent.trim();
            const additionalData = divElement.querySelector('button.physicalPropsButton___xWW45');

            if (additionalData) {
                const additionalText = additionalData.textContent.trim();
                const text = divContent + ' ' + additionalText;

                for (const category in markGroups) {
                    if (markGroups[category].some(group => text.includes(group))) {
                        divElement.querySelector('div').style.color = categoryColorMap[category];
                        if (window.innerWidth > 386) {
                            divElement.querySelector('div').textContent = `${divContent} (${category})`;
                        }

                        divElement.classList.add('processed');
                        setBorderForParent(divElement, category, sideColorMap);
                    }
                }
            }
        });
    }

    const observer = new MutationObserver(updateDivColors);
    observer.observe(document.body, {childList: true, subtree: true});

    function retryUntilSuccess() {
        updateDivColors();
        setTimeout(retryUntilSuccess, 2000);
    }

    retryUntilSuccess();
})();
