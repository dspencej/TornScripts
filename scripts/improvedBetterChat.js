// ==UserScript==
// @name         Improved Better Chat
// @namespace    https://github.com/dspencej
// @version      1.0.0
// @description  Improvements to the usability of chats 2.0 with modularization, performance optimizations, and accessibility features. Adapted from the original script by DeKleineKobini [2114440].
// @author       Dustin Spencer
// @license      MIT
// @match        https://www.torn.com/*
// @grant        GM_addStyle
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedBetterChat.js
// @updateURL    https://raw.githubusercontent.com/dspencej/TornScripts/refs/heads/main/scripts/improvedBetterChat.js
// ==/UserScript==

(function () {
    'use strict';

    class Settings {
        static instance;
        static getSettings() {
            if (!Settings.instance) {
                const storedSettings = localStorage.getItem('better-chat-settings');
                Settings.instance = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
            }
            return Settings.instance;
        }

        static saveSettings() {
            localStorage.setItem('better-chat-settings', JSON.stringify(Settings.getSettings()));
        }
    }

    class MessageHighlight {
        static highlightMessages(message, senderName) {
            if (!settings.messages.highlight.length) return;
            const highlights = this.buildHighlights();
            this.nameHighlight(message, highlights, senderName);
            this.messageHighlight(message, highlights);
        }

        static buildHighlights() {
            return settings.messages.highlight.map(({ search, color }) => ({
                search: search.replaceAll("%player%", getCurrentPlayerName()),
                color: convertColor(color),
            }));
        }

        static nameHighlight(message, highlights, senderName) {
            const nameHighlight = highlights.find(({ search }) => senderName.toLowerCase() === search.toLowerCase());
            if (!nameHighlight) return;
            const senderElement = findByPartialClass(message, CHAT_SELECTORS.MESSAGE_SENDER_CLASS);
            senderElement.setAttribute('style', `background-color: ${nameHighlight.color} !important;`);
        }

        static messageHighlight(message, highlights) {
            const messageElement = findByPartialClass(message, CHAT_SELECTORS.MESSAGE_CONTENT_WRAPPER_CLASS);
            const messageHighlight = highlights.find(({ search }) => messageElement.textContent.toLowerCase().includes(search.toLowerCase()));
            if (!messageHighlight) return;
            const wrapperElement = findByPartialClass(message, CHAT_SELECTORS.MESSAGE_BODY_WRAPPER_CLASS);
            wrapperElement.setAttribute('style', `background-color: ${messageHighlight.color} !important;`);
        }
    }

    class ChatStyling {
        static includeStyle(styleRules) {
            if (typeof GM_addStyle !== "undefined") {
                GM_addStyle(styleRules);
            } else {
                const styleElement = document.createElement("style");
                styleElement.setAttribute("type", "text/css");
                styleElement.innerHTML = styleRules;
                document.head.appendChild(styleElement);
            }
        }

        static applyMessageStyles() {
            ChatStyling.includeStyle(`
                [class*='${CHAT_SELECTORS.MESSAGE_AVATAR_CLASS}'] {
                    display: none;
                }
            `);
        }

        static applyBoxStyles() {
            ChatStyling.includeStyle(`
                [class*='${CHAT_SELECTORS.CHAT_WRAPPER_WRAPPER_CLASS}'] {
                    gap: 3px;
                }
            `);
        }

        static applyFontSize(size) {
            ChatStyling.includeStyle(`
                [class*='${CHAT_SELECTORS.MESSAGE_CONTENT_WRAPPER_CLASS}'],
                [class*='${CHAT_SELECTORS.MESSAGE_SENDER_CLASS}'] {
                    font-size: ${size}px !important;
                }
            `);
        }
    }

    class Feedback {
        static showNotification(message) {
            const notification = document.createElement('div');
            notification.innerText = message;
            notification.style.position = 'fixed';
            notification.style.top = '10px';
            notification.style.right = '10px';
            notification.style.backgroundColor = '#333';
            notification.style.color = '#fff';
            notification.style.padding = '10px';
            document.body.appendChild(notification);

            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        }
    }

    class AccessibilityEnhancements {
        static addKeyboardShortcuts() {
            document.addEventListener('keydown', (event) => {
                if (event.ctrlKey && event.key === 'Enter') {
                    document.querySelector('.chat-send-button').click();
                } else if (event.key === 'Escape') {
                    document.querySelector('.chat-close-button').click();
                }
            });
        }

        static describeChatButtons(chat) {
            findAll(chat, "button:not(.better-chat-described), *[role='button'][tabindex]").forEach((button) => this.describeChatButton(button));
        }

        static describeChatButton(button) {
            let description;
            const svg = button.querySelector("svg");
            if (svg) {
                const className = svg.getAttribute("class") || "";
                if (className.includes(CHAT_SELECTORS.CHAT_HEADER_MINIMIZE_ICON_CLASS)) {
                    description = "Minimize this chat";
                } else if (className.includes(CHAT_SELECTORS.CHAT_HEADER_CLOSE_ICON_CLASS)) {
                    description = "Close this chat";
                }
            }
            button.ariaLabel = description ?? null;
            button.classList.add("better-chat-described");
        }
    }

    const settings = Settings.getSettings();

    // Load styling on demand
    ChatStyling.applyMessageStyles();
    ChatStyling.applyBoxStyles();
    if (settings.messages.fontSize.enabled) {
        ChatStyling.applyFontSize(settings.messages.fontSize.size);
    }

    // Load accessibility enhancements
    AccessibilityEnhancements.addKeyboardShortcuts();

    Feedback.showNotification('Better Chat loaded successfully!');

    // Mutation observer for dynamic chat updates
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        MessageHighlight.highlightMessages(node, getCurrentPlayerName());
                        AccessibilityEnhancements.describeChatButtons(node);
                    }
                });
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // MutationObserver for unread messages in chats
    setInterval(() => {
        const chatList = document.querySelectorAll('.chat-app__chat-list-chat-box-wrapper___');
        chatList.forEach((chat) => {
            const unreadCount = chat.querySelector('.message-count___');
            if (unreadCount) {
                Feedback.showNotification(`You have ${unreadCount.textContent} unread messages in chat!`);
            }
        });
    }, 5000);

})();
