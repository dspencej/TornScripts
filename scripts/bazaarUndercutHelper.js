// ==UserScript==
// @name         Torn Bazaar Undercut Helper
// @namespace    https://github.com/dspencej/TornScripts
// @version      0.1.0
// @description  Prefills bazaar price inputs to $1 below the lowest current market listing for that item, with safeguards.
// @author       dspencej
// @license      MIT
// @match        https://www.torn.com/imarket.php*
// @match        https://www.torn.com/bazaar.php*
// @match        https://www.torn.com/item.php*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const LS_PREFIX = 'torn:lowestPrice:'; // key = `${LS_PREFIX}${itemKey}`
  const PRICE_TTL_MS = 30 * 60 * 1000; // 30 minutes

  const clampPrice = (n) => Math.max(1, Math.floor(n));

  const parsePrice = (text) => {
    if (!text) return null;
    const m = String(text).replace(/[^0-9.]/g, '');
    if (!m) return null;
    const n = Number(m);
    return Number.isFinite(n) ? Math.floor(n) : null;
  };

  const now = () => Date.now();

  const getItemKey = (name) => (name || '').trim().toLowerCase();

  const saveLowest = (itemName, price) => {
    const key = LS_PREFIX + getItemKey(itemName);
    localStorage.setItem(key, JSON.stringify({ price: clampPrice(price), ts: now() }));
    console.log('[BazaarUndercut] saved', { itemName, price });
  };

  const loadLowest = (itemName) => {
    const key = LS_PREFIX + getItemKey(itemName);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj.price !== 'number' || typeof obj.ts !== 'number') return null;
      if (now() - obj.ts > PRICE_TTL_MS) return null; // stale
      return obj;
    } catch (_e) {
      return null;
    }
  };

  // Heuristics to find a readable item name on the page (title-like elements)
  const findItemName = (root = document) => {
    const candidates = Array.from(root.querySelectorAll('h1, h2, .title, .name, [class*="title"], [class*="name"]'))
      .map((el) => el.textContent?.trim())
      .filter(Boolean);
    if (candidates.length) return candidates[0];
    const t = document.title.replace(/\s*[|•-].*$/, '').trim();
    return t || null;
  };

  // On Item Market: detect current lowest price on page and store it
  const captureLowestOnMarket = () => {
    const isMarket = /\/imarket\.php/i.test(location.pathname);
    if (!isMarket) return;
    // Collect all numeric prices that look like $ amounts
    const priceNodes = Array.from(document.querySelectorAll('span, div, td, li, b, strong'));
    const prices = [];
    for (const el of priceNodes) {
      const txt = el.textContent || '';
      if (!txt.includes('$')) continue;
      const val = parsePrice(txt);
      if (val && val > 0 && val < 1e10) prices.push(val);
    }
    if (!prices.length) return;
    const lowest = Math.min(...prices);
    const name = findItemName();
    if (!name) return;
    saveLowest(name, lowest);
  };

  // On Bazaar/Inventory: find price inputs and prefill from stored lowest-1
  const enhanceBazaarPricing = () => {
    const isBazaarOrInv = /\/(bazaar|item)\.php/i.test(location.pathname);
    if (!isBazaarOrInv) return;

    const style = document.createElement('style');
    style.textContent = `
      .undercut-btn { cursor: pointer; margin-left: 6px; padding: 2px 6px; font-size: 12px; }
      .undercut-note { margin-left: 6px; font-size: 11px; opacity: 0.8; }
    `;
    document.head.appendChild(style);

    const applyToInput = (input) => {
      if (!input || input.dataset.undercutBound) return;
      input.dataset.undercutBound = '1';

      // Try to locate nearby item name
      let container = input.closest('.modal, .content, .dialog, form, .container') || document;
      const itemName = findItemName(container) || findItemName(document) || '';
      const stored = itemName ? loadLowest(itemName) : null;
      const setValue = (base) => {
        const val = clampPrice(base - 1);
        input.value = String(val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Undercut $1';
      btn.className = 'undercut-btn';
      btn.addEventListener('click', () => {
        const current = itemName ? loadLowest(itemName) : null;
        if (current) setValue(current.price);
      });

      const note = document.createElement('span');
      note.className = 'undercut-note';
      if (stored) note.textContent = `Lowest seen: $${stored.price.toLocaleString()} (<=30m)`;

      input.insertAdjacentElement('afterend', btn);
      input.insertAdjacentElement('afterend', note);

      // Auto-prefill on bind if we have fresh data
      if (stored) setValue(stored.price);
    };

    const scan = () => {
      const inputs = document.querySelectorAll('input[type="number"], input[name*="price" i], input[placeholder*="price" i]');
      inputs.forEach(applyToInput);
    };

    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });
  };

  const init = () => {
    captureLowestOnMarket();
    enhanceBazaarPricing();
  };

  // Wait a tick for SPA content
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 300);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(init, 300));
  }
})();

