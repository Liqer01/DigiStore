/**
 * ClosyGuard Anti-DevTools & Source Protection
 * Blocks F12, Inspect Shortcuts, Right-Click, and Neutralizes Console
 */
(function() {
  'use strict';

  // 1. Block Right-Click Context Menu
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, { capture: true, passive: false });

  // 2. Block Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
  window.addEventListener('keydown', function(e) {
    // F12
    if (e.keyCode === 123 || e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    const ctrlOrMeta = e.ctrlKey || e.metaKey;

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (ctrlOrMeta && e.shiftKey) {
      const k = (e.key || '').toUpperCase();
      if (k === 'I' || k === 'J' || k === 'C' || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    // Ctrl+U (View Page Source), Ctrl+S (Save Page)
    if (ctrlOrMeta) {
      const k = (e.key || '').toUpperCase();
      if (k === 'U' || k === 'S' || e.keyCode === 85 || e.keyCode === 83) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  }, { capture: true, passive: false });

  // 3. Prevent dragging elements / images
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
  }, { capture: true, passive: false });

  // 4. Neutralize Console
  try {
    const noop = function() {};
    const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupEnd', 'time', 'timeEnd', 'assert', 'profile'];
    for (let i = 0; i < methods.length; i++) {
      try {
        window.console[methods[i]] = noop;
      } catch(err) {}
    }
    // Clean console periodically
    setInterval(function() {
      try {
        console.clear();
      } catch(err) {}
    }, 1000);
  } catch(e) {}

  // 5. Anti-Debugger Trap for DevTools
  setInterval(function() {
    try {
      (function() {
        return false;
      }['constructor']('debugger')());
    } catch(err) {}
  }, 1000);
})();
