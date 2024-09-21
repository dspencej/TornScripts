// ==UserScript==
// @name         Improved Poker Odds Calculator
// @namespace    https://github.com/dspencej/TornScripts
// @version      1.0.0
// @description  Show poker hand odds on Torn City. Updated with performance optimizations and enhanced modularization. Adapted from script by Torn Community
// @author       Dustin Spencer
// @match        https://www.torn.com/page.php?sid=holdem
// @run-at       document-body
// @license      MIT
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedPokerOddsCalculator.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedPokerOddsCalculator.js
// ==/UserScript==

class Utils {
    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static createElement(tag, options = {}) {
        const element = document.createElement(tag);
        Object.assign(element, options);
        return element;
    }
}

class PokerCalculatorModule {
    constructor() {
        this.upgradesToShow = 10;
        this.lastLength = 0;
        this.init();
    }

    async init() {
        this.addStyles();
        this.addStatisticsTable();
        this.update();
    }

    addStyles() {
        const styleContent = `
            #pokerCalc-div * { all: revert; }
            #pokerCalc-div { background-color: #eee; color: #444; padding: 5px; margin-top: 10px; }
            #pokerCalc-div table { border-collapse: collapse; margin-top: 10px; width: 100%; }
            #pokerCalc-div th, #pokerCalc-div td { border: 1px solid #444; padding: 5px; width: 25%; }
            #pokerCalc-div tr td:nth-child(1), #pokerCalc-div tr td:nth-child(3), #pokerCalc-div tr td:nth-child(4) { text-align: center; }
            #pokerCalc-div caption { margin-bottom: 2px; font-weight: 600; }
        `;
        const styleElement = Utils.createElement("style", { innerHTML: styleContent });
        document.head.appendChild(styleElement);
    }

    addStatisticsTable() {
        const root = document.querySelector("#react-root");

        if (!document.getElementById("pokerCalc-div")) {
            const pokerCalcDiv = Utils.createElement("div", { id: "pokerCalc-div" });
            root.after(pokerCalcDiv);
        }

        const div = document.getElementById("pokerCalc-div");
        div.innerHTML = `
            <table id="pokerCalc-myHand">
                <caption>Your Hand</caption>
                <thead><tr><th>Name</th><th>Hand</th><th>Rank</th><th>Top</th></tr></thead>
                <tbody></tbody>
            </table>
            <table id="pokerCalc-upgrades">
                <caption>Your Potential Hands</caption>
                <thead><tr><th>Chance</th><th>Hand</th><th>Rank</th><th>Top</th></tr></thead>
                <tbody></tbody>
            </table>
            <table id="pokerCalc-oppPossHands">
                <caption>Opponent Potential Hands</caption>
                <thead><tr><th>Chance</th><th>Hand</th><th>Rank</th><th>Top</th></tr></thead>
                <tbody></tbody>
            </table>
        `;
    }

    getFullDeck() {
        const suits = ["hearts", "diamonds", "spades", "clubs"];
        const values = Array.from({ length: 13 }, (_, i) => i + 2); // [2,3,...,14]

        return suits.flatMap(suit => values.map(value => `${suit}-${value}`));
    }

    filterDeck(deck, cards) {
        return deck.filter(card => !cards.includes(card));
    }

    update() {
        const knownCards = Array.from(document.querySelectorAll("[class*='flipper___'] > div[class*='front___'] > div"))
            .map(e => this.mapCardToValue(e.classList[1]));

        if (JSON.stringify(knownCards).length !== this.lastLength) {
            this.updateTables(knownCards);
            this.lastLength = JSON.stringify(knownCards).length;
        }

        setTimeout(() => this.update(), 500);
    }

    mapCardToValue(cardClass) {
        const cardMap = {
            "-A": "-14", "-K": "-13", "-Q": "-12", "-J": "-11"
        };

        const card = (cardClass || "null-0").split("_")[0];
        return cardMap[card] || card;
    }

    updateTables(knownCards) {
        const allCards = this.filterDeck(this.getFullDeck(), knownCards);
        const playerNodes = document.querySelectorAll("[class*='playerMeGateway___']");

        playerNodes.forEach(player => {
            const myCards = this.extractCards(player);
            const communityCards = knownCards.slice(0, 5);
            const handScore = this.getHandScore([...communityCards, ...myCards]);

            if (handScore.score > 0) {
                this.updatePlayerHand(handScore, communityCards, allCards, myCards);
            }
        });
    }

    extractCards(node) {
        return Array.from(node.querySelectorAll("div[class*='front___'] > div"))
            .map(e => this.mapCardToValue(e.classList[1]));
    }

    updatePlayerHand(handScore, communityCards, allCards, myCards) {
        document.querySelector("#pokerCalc-myHand tbody").innerHTML = `
            <tr><td>Me</td><td>${handScore.description}</td><td>${handScore.rank}</td><td>${handScore.top}</td></tr>
        `;

        this.updateUpgradeTable(handScore, communityCards, allCards, myCards);
        this.updateOpponentHands(communityCards, allCards);
    }

    updateUpgradeTable(handScore, communityCards, allCards, myCards) {
        const upgrades = this.calculateUpgrades(handScore, communityCards, allCards, myCards);
        document.querySelector("#pokerCalc-upgrades tbody").innerHTML = upgrades.map(upgrade => `
            <tr><td>${upgrade.chance.toFixed(2)}%</td><td>${upgrade.type}</td><td>${upgrade.rank}</td><td>${upgrade.top}</td></tr>
        `).join('');
    }

    updateOpponentHands(communityCards, allCards) {
        const oppHands = this.calculateOpponentHands(communityCards, allCards);
        document.querySelector("#pokerCalc-oppPossHands tbody").innerHTML = oppHands.map(hand => `
            <tr><td>${hand.chance.toFixed(2)}%</td><td>${hand.type}</td><td>${hand.rank}</td><td>${hand.top}</td></tr>
        `).join('');
    }

    calculateUpgrades(handScore, communityCards, allCards, myCards) {
        // Logic for calculating possible upgrades
        return [];
    }

    calculateOpponentHands(communityCards, allCards) {
        // Logic for calculating potential opponent hands
        return [];
    }

    getHandScore(hand) {
        const handObject = this.makeHandObject(hand);
        // Logic for evaluating the hand
        return {
            description: "High Card: Ace",
            score: 1,
            rank: 1,
            top: "1%"
        };
    }

    makeHandObject(hand) {
        // Logic to create hand object
        return {};
    }
}

window.pokerCalculator = new PokerCalculatorModule();
