// ==UserScript==
// @name         Target Risk Colorizer
// @namespace    https://github.com/dspencej/TornScripts/blob/main/scripts/improvedPickpocketingColors.js
// @version      1.0.0
// @description  Automatically colorizes target elements based on their risk level and user skill, and adds a color-coded border for easy identification, based on the script by Korbrm [2931507]
// @author       Dustin Spencer
// @match        https://www.torn.com/loader.php?sid=crimes*
// @grant        none
// @license      MIT
// @updateURL    https://github.com/dspencej/TornScripts/blob/main/scripts/improvedPickpocketingColors.js
// @downloadURL  https://github.com/dspencej/TornScripts/blob/main/scripts/improvedPickpocketingColors.js
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

    const tier1 = {
        "Safe": "#37b24d",
        "Moderately Unsafe": "#f76707",
        "Unsafe": "#f03e3e",
        "Risky": "#f03e3e",
        "Dangerous": "#f03e3e",
        "Very Dangerous": "#7048e8",
    };
    const tier2 = {
        "Safe": "#37b24d",
        "Moderately Unsafe": "#37b24d",
        "Unsafe": "#f76707",
        "Risky": "#f03e3e",
        "Dangerous": "#f03e3e",
        "Very Dangerous": "#7048e8",
    };
    const tier3 = {
        "Safe": "#37b24d",
        "Moderately Unsafe": "#37b24d",
        "Unsafe": "#37b24d",
        "Risky": "#f76707",
        "Dangerous": "#f03e3e",
        "Very Dangerous": "#7048e8",
    };
    const tier4 = {
        "Safe": "#37b24d",
        "Moderately Unsafe": "#37b24d",
        "Unsafe": "#37b24d",
        "Risky": "#37b24d",
        "Dangerous": "#f76707",
        "Very Dangerous": "#7048e8",
    };
    const tier5 = {
        "Safe": "#37b24d",
        "Moderately Unsafe": "#37b24d",
        "Unsafe": "#37b24d",
        "Risky": "#37b24d",
        "Dangerous": "#37b24d",
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

        // Update sideColorMap based on skill level
        let sideColorMap;
        if (pickpocketSkill < 10) {
            sideColorMap = tier1;
        } else if (pickpocketSkill < 35) {
            sideColorMap = tier2;
        } else if (pickpocketSkill < 65) {
            sideColorMap = tier3;
        } else if (pickpocketSkill < 80) {
            sideColorMap = tier4;
        } else {
            sideColorMap = tier5;
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

    // Optional: Add a legend to explain the color categories
    function addLegend() {
        const legend = document.createElement('div');
        legend.style.position = 'fixed';
        legend.style.bottom = '10px';
        legend.style.right = '10px';
        legend.style.backgroundColor = '#fff';
        legend.style.padding = '10px';
        legend.style.border = '1px solid #ccc';
        legend.innerHTML = `
           <strong>Legend:</strong><br>
           <span style="color: #37b24d;">Safe</span><br>
           <span style="color: #f76707;">Moderately Unsafe</span><br>
           <span style="color: #f03e3e;">Dangerous</span>
       `;
        document.body.appendChild(legend);
    }

    addLegend();
})();
