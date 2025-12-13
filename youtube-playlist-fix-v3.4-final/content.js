// YouTube Playlist Multi-Select Fix - V3.4 (January 2025)
// Fixed: Survives YouTube's client-side navigation
// Fixed: Works persistently across page changes
// NEW: Auto-clicks "Change" button to update bookmark icons!
// NEW: Click away from menu to close it!

(function() {
    'use strict';
    
    // Prevent multiple instances
    if (window.__ytPlaylistFixLoaded) {
        console.log('%c[Playlist Fix] ⚠️ Already loaded, skipping', 'color: #ffaa00');
        return;
    }
    window.__ytPlaylistFixLoaded = true;
    
    console.log('%c[Playlist Fix] 🚀 V3.4 Loaded', 'color: #00ff00; font-weight: bold; font-size: 16px');
    
    let isManualClose = false;
    let currentDropdown = null;
    let observers = [];
    let handlers = [];
    let globalScanInterval = null;
    let globalObserver = null;
    
    // Cleanup function
    function cleanup() {
        observers.forEach(obs => {
            try { obs.disconnect(); } catch(e) {}
        });
        handlers.forEach(h => {
            try {
                if (h.element && h.event && h.handler) {
                    h.element.removeEventListener(h.event, h.handler, h.capture);
                }
            } catch(e) {}
        });
        observers = [];
        handlers = [];
        currentDropdown = null;
    }
    
    // Add a handler and track it for cleanup
    function addTrackedHandler(element, event, handler, capture = false) {
        if (!element) return;
        element.addEventListener(event, handler, capture);
        handlers.push({ element, event, handler, capture });
    }
    
    // NEW: Auto-click "Change" button to update bookmark icons
    function autoClickChangeButton() {
        console.log('%c[Playlist Fix] 🔍 Looking for Change button...', 'color: #00aaff');
        
        // Strategy 1: Look in snackbar-view-model (the notification at bottom left)
        const snackbars = document.querySelectorAll('snackbar-view-model, tp-yt-paper-toast');
        for (const snackbar of snackbars) {
            // Look for button-view-model inside snackbar
            const buttonModels = snackbar.querySelectorAll('button-view-model button, yt-button-view-model button');
            for (const btn of buttonModels) {
                const text = btn.textContent?.trim().toLowerCase() || '';
                if (text === 'change') {
                    console.log('%c[Playlist Fix] 🔘 Found Change button in snackbar!', 'color: #00ff00');
                    btn.click();
                    return true;
                }
            }
            
            // Also check all buttons in snackbar as fallback
            const allBtns = snackbar.querySelectorAll('button');
            for (const btn of allBtns) {
                const text = btn.textContent?.trim().toLowerCase() || '';
                if (text === 'change') {
                    console.log('%c[Playlist Fix] 🔘 Found Change button!', 'color: #00ff00');
                    btn.click();
                    return true;
                }
            }
        }
        
        // Strategy 2: Look in any visible button with "Change" text
        const allButtons = document.querySelectorAll('button, a[role="button"]');
        for (const btn of allButtons) {
            const text = btn.textContent?.trim().toLowerCase() || '';
            
            if (text === 'change') {
                // Check if visible
                const style = window.getComputedStyle(btn);
                const rect = btn.getBoundingClientRect();
                
                if (style.display !== 'none' && 
                    style.visibility !== 'hidden' && 
                    rect.width > 0 && 
                    rect.height > 0) {
                    console.log('%c[Playlist Fix] 🔘 Found Change button (fallback)!', 'color: #00ff00');
                    btn.click();
                    return true;
                }
            }
        }
        
        console.log('%c[Playlist Fix] ⚠️ Change button not found yet', 'color: #ffaa00');
        return false;
    }
    
    // Watch for the confirmation popup and auto-click Change
    function watchForChangeButton() {
        const popupObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        const text = node.textContent?.toLowerCase() || '';
                        const tagName = node.tagName?.toLowerCase() || '';
                        
                        // Look for snackbar or confirmation messages
                        if (tagName === 'snackbar-view-model' || 
                            tagName === 'tp-yt-paper-toast' ||
                            text.includes('saved to') || 
                            text.includes('added to') || 
                            text.includes('removed from')) {
                            
                            console.log('%c[Playlist Fix] 📢 Confirmation detected!', 'color: #00aaff');
                            
                            // Try multiple times with different delays
                            setTimeout(autoClickChangeButton, 50);
                            setTimeout(autoClickChangeButton, 150);
                            setTimeout(autoClickChangeButton, 300);
                            setTimeout(autoClickChangeButton, 500);
                            setTimeout(autoClickChangeButton, 800);
                        }
                    }
                }
            }
        });
        
        popupObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        observers.push(popupObserver);
    }
    
    // Main patching function
    function patchDropdown(dropdown) {
        if (!dropdown) return;
        
        // Check if this is a playlist dropdown
        const hasPlaylistItems = dropdown.querySelector(
            'ytd-playlist-add-to-option-renderer, ' +
            'yt-list-item-view-model, ' +
            '[aria-label*="playlist"], ' +
            '[aria-label*="Watch later"]'
        );
        
        if (!hasPlaylistItems) return;
        
        // Check if visible
        try {
            const computed = window.getComputedStyle(dropdown);
            if (computed.display === 'none' || computed.visibility === 'hidden') return;
        } catch(e) {
            return;
        }
        
        // Don't re-patch the same dropdown
        if (currentDropdown === dropdown) return;
        
        // Clean up previous dropdown
        if (currentDropdown && currentDropdown !== dropdown) {
            console.log('%c[Playlist Fix] ⚠️ New dropdown detected', 'color: #ffaa00');
            cleanup();
        }
        
        console.log('%c[Playlist Fix] 🎵 Patching playlist dropdown...', 'color: #00ff00; font-weight: bold');
        currentDropdown = dropdown;
        
        // Start watching for the Change button
        watchForChangeButton();
        
        // Store original methods
        const origClose = dropdown.close?.bind(dropdown);
        const origHide = dropdown.hide?.bind(dropdown);
        
        // Override close/hide methods if not already done
        if (!dropdown._ytPlaylistFixPatched) {
            dropdown._ytPlaylistFixPatched = true;
            
            if (dropdown.close) {
                dropdown.close = function(...args) {
                    if (isManualClose) {
                        console.log('%c[Playlist Fix] ✓ Manual close', 'color: #ffaa00');
                        cleanup();
                        return origClose?.(...args);
                    }
                    console.log('%c[Playlist Fix] ⛔ Blocked close()', 'color: #ff0000');
                    return;
                };
            }
            
            if (dropdown.hide) {
                dropdown.hide = function(...args) {
                    if (isManualClose) {
                        console.log('%c[Playlist Fix] ✓ Manual hide', 'color: #ffaa00');
                        cleanup();
                        return origHide?.(...args);
                    }
                    console.log('%c[Playlist Fix] ⛔ Blocked hide()', 'color: #ff0000');
                    return;
                };
            }
        }
        
        // Prevent style-based hiding
        const styleObserver = new MutationObserver((mutations) => {
            if (isManualClose) return;
            
            mutations.forEach(mut => {
                if (mut.attributeName === 'style') {
                    const style = dropdown.getAttribute('style') || '';
                    if (style.includes('display: none') || style.includes('display:none')) {
                        console.log('%c[Playlist Fix] ⛔ Prevented display:none', 'color: #ff0000');
                        dropdown.style.display = '';
                    }
                }
                
                if (mut.attributeName === 'aria-hidden') {
                    if (dropdown.getAttribute('aria-hidden') === 'true' && !isManualClose) {
                        console.log('%c[Playlist Fix] ⛔ Prevented aria-hidden', 'color: #ff0000');
                        dropdown.setAttribute('aria-hidden', 'false');
                    }
                }
            });
        });
        
        styleObserver.observe(dropdown, { 
            attributes: true, 
            attributeFilter: ['style', 'aria-hidden', 'hidden', 'class']
        });
        observers.push(styleObserver);
        
        // Watch for clicks on playlist items
        const clickHandler = (e) => {
            const playlistItem = e.target.closest(
                'ytd-playlist-add-to-option-renderer, ' +
                'yt-list-item-view-model, ' +
                'tp-yt-paper-item'
            );
            
            if (playlistItem) {
                console.log('%c[Playlist Fix] 📝 Playlist clicked, watching for confirmation...', 'color: #00aaff');
                
                // Watch for the Change button after clicking
                setTimeout(autoClickChangeButton, 200);
                setTimeout(autoClickChangeButton, 400);
                setTimeout(autoClickChangeButton, 700);
                setTimeout(autoClickChangeButton, 1000);
            }
        };
        
        addTrackedHandler(dropdown, 'click', clickHandler, true);
        
        // Manual close function
        function manualClose() {
            console.log('%c[Playlist Fix] 🚪 Closing manually', 'color: #ffaa00');
            isManualClose = true;
            
            cleanup();
            
            // Try multiple ways to close
            if (origClose) {
                origClose();
            } else if (origHide) {
                origHide();
            } else {
                dropdown.style.display = 'none';
                dropdown.setAttribute('aria-hidden', 'true');
            }
            
            setTimeout(() => {
                isManualClose = false;
            }, 500);
        }
        
        // ESC key handler
        const escHandler = (e) => {
            if (e.key === 'Escape' && currentDropdown === dropdown) {
                console.log('%c[Playlist Fix] ⌨️ ESC pressed', 'color: #ffaa00');
                e.stopPropagation();
                e.preventDefault();
                manualClose();
            }
        };
        
        addTrackedHandler(document, 'keydown', escHandler, true);
        
        // NEW: Click-away to close
        setTimeout(() => {
            const clickAwayHandler = (e) => {
                if (isManualClose || !currentDropdown || currentDropdown !== dropdown) return;
                
                // Check if click is outside the dropdown
                if (!dropdown.contains(e.target)) {
                    console.log('%c[Playlist Fix] 👆 Click outside - closing', 'color: #ffaa00');
                    e.stopPropagation();
                    e.preventDefault();
                    manualClose();
                }
            };
            
            addTrackedHandler(document, 'mousedown', clickAwayHandler, true);
        }, 300);
        
        console.log('%c[Playlist Fix] ✅ Patched with Change-clicking & click-away', 'color: #00ff00; font-weight: bold');
    }
    
    // Scan for dropdowns
    function scan() {
        try {
            const dropdowns = document.querySelectorAll('tp-yt-iron-dropdown');
            dropdowns.forEach(patchDropdown);
        } catch(e) {
            console.error('[Playlist Fix] Scan error:', e);
        }
    }
    
    // Initialize function
    function initialize() {
        console.log('%c[Playlist Fix] 🔄 Initializing...', 'color: #00aaff');
        
        if (globalScanInterval) {
            clearInterval(globalScanInterval);
        }
        
        scan();
        globalScanInterval = setInterval(scan, 100);
        
        if (!globalObserver) {
            globalObserver = new MutationObserver((mutations) => {
                let shouldScan = false;
                
                for (const mutation of mutations) {
                    if (mutation.addedNodes.length) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === 1) {
                                const tag = node.tagName;
                                if (tag === 'TP-YT-IRON-DROPDOWN' || 
                                    tag === 'TP-YT-IRON-OVERLAY-BACKDROP' ||
                                    tag === 'YTD-POPUP-CONTAINER') {
                                    shouldScan = true;
                                    break;
                                }
                                
                                if (node.querySelector && node.querySelector('tp-yt-iron-dropdown')) {
                                    shouldScan = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (mutation.type === 'attributes' && 
                        mutation.target.tagName === 'TP-YT-IRON-DROPDOWN') {
                        shouldScan = true;
                    }
                }
                
                if (shouldScan) {
                    scan();
                    setTimeout(scan, 50);
                    setTimeout(scan, 150);
                }
            });
            
            if (document.body) {
                globalObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class', 'aria-hidden', 'hidden']
                });
            }
        }
        
        console.log('%c[Playlist Fix] ✅ Initialized', 'color: #00ff00');
    }
    
    // Watch for YouTube navigation
    function watchNavigation() {
        let lastUrl = location.href;
        
        const navigationObserver = new MutationObserver(() => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                console.log('%c[Playlist Fix] 🔄 YouTube navigation detected', 'color: #00aaff');
                lastUrl = currentUrl;
                
                setTimeout(initialize, 500);
                setTimeout(scan, 1000);
                setTimeout(scan, 2000);
            }
        });
        
        navigationObserver.observe(document.querySelector('title') || document.head, {
            childList: true,
            subtree: true
        });
        
        document.addEventListener('yt-navigate-finish', () => {
            console.log('%c[Playlist Fix] 🔄 yt-navigate-finish event', 'color: #00aaff');
            setTimeout(initialize, 300);
            setTimeout(scan, 800);
        });
        
        document.addEventListener('yt-page-data-updated', () => {
            console.log('%c[Playlist Fix] 🔄 yt-page-data-updated event', 'color: #00aaff');
            setTimeout(scan, 500);
        });
    }
    
    // Watch for Save button clicks
    document.addEventListener('click', (e) => {
        const saveButton = e.target.closest(
            '[aria-label*="Save"], ' +
            '[aria-label*="save"], ' +
            'ytd-button-renderer, ' +
            '#button-shape-like, ' +
            '.save-button'
        );
        
        if (saveButton) {
            console.log('%c[Playlist Fix] 🖱️ Save button clicked', 'color: #00aaff');
            setTimeout(scan, 100);
            setTimeout(scan, 300);
            setTimeout(scan, 500);
        }
    }, true);
    
    // Initial setup
    initialize();
    watchNavigation();
    
    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
        if (globalScanInterval) clearInterval(globalScanInterval);
        if (globalObserver) globalObserver.disconnect();
        cleanup();
    });
    
    console.log('%c[Playlist Fix] 🎬 Ready! Click away or ESC to close. Icons update automatically!', 'color: #00ff00; font-weight: bold');
    
})();
