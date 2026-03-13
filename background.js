// Rule storage key
const RULES_STORAGE_KEY = 'rules';

// In-memory rule cache
let rules = [];

// Track tabs that have had auto-apply applied to avoid infinite loops
const autoAppliedTabs = new Set();

// Track the last URL for each tab to detect URL changes
const lastTabUrls = new Map();

// Load rules from storage on startup
let storageLoaded = false;
let pendingGetRulesCallbacks = [];

function loadRules() {
  console.log('[loadRules] Loading rules from storage...');
  chrome.storage.local.get([RULES_STORAGE_KEY], (result) => {
    console.log('[loadRules] Storage result:', result);
    console.log('[loadRules] Storage result keys:', Object.keys(result));
    console.log('[loadRules] RULES_STORAGE_KEY:', RULES_STORAGE_KEY);
    console.log('[loadRules] result[RULES_STORAGE_KEY]:', result[RULES_STORAGE_KEY]);
    if (chrome.runtime.lastError) {
      console.error('[loadRules] Error reading from storage:', chrome.runtime.lastError.message);
      rules = [];
    } else {
      rules = result[RULES_STORAGE_KEY] || [];
      console.log('[loadRules] Loaded rules:', rules);
    }
    storageLoaded = true;
    // Process any pending GET_RULES requests
    pendingGetRulesCallbacks.forEach(callback => callback(rules));
    pendingGetRulesCallbacks = [];
  });
}

// Get rules with storage load wait
function getRulesWithLoad() {
  return new Promise((resolve) => {
    if (storageLoaded) {
      console.log('[getRulesWithLoad] Storage already loaded, returning rules:', rules);
      resolve(rules);
    } else {
      console.log('[getRulesWithLoad] Storage not loaded yet, adding to pending callbacks');
      pendingGetRulesCallbacks.push(resolve);
    }
  });
}

// Save rules to storage
function saveRules() {
  console.log('[saveRules] Saving rules:', rules);
  chrome.storage.local.set({ [RULES_STORAGE_KEY]: rules }, () => {
    console.log('[saveRules] Rules saved successfully');
    // Verify the save by reading back
    chrome.storage.local.get([RULES_STORAGE_KEY], (result) => {
      console.log('[saveRules] Verification - Storage result:', result);
      console.log('[saveRules] Verification - result[RULES_STORAGE_KEY]:', result[RULES_STORAGE_KEY]);
    });
  });
}

// Get next rule ID
function getNextId() {
  return new Promise((resolve, reject) => {
    console.log('[getNextId] Getting next rule ID...');
    chrome.storage.local.get(['nextRuleId'], (result) => {
      console.log('[getNextId] Storage result:', result);
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      const id = (result && result.nextRuleId) ? result.nextRuleId : 1;
      console.log('[getNextId] Next ID:', id);
      chrome.storage.local.set({ nextRuleId: id + 1 }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(id);
      });
    });
  });
}

// Add a new rule
async function addRule(urlPattern, parameters, autoApply = false) {
  const id = await getNextId();
  const newRule = {
    id: id,
    urlPattern: urlPattern,
    parameters: parameters,
    autoApply: autoApply
  };
  rules.push(newRule);
  saveRules();
  return newRule;
}

// Update an existing rule
function updateRule(id, urlPattern, parameters, autoApply = false) {
  const index = rules.findIndex(r => r.id === id);
  if (index !== -1) {
    rules[index] = {
      id: id,
      urlPattern: urlPattern,
      parameters: parameters,
      autoApply: autoApply
    };
    saveRules();
    return rules[index];
  }
  return null;
}

// Delete a rule
function deleteRule(id) {
  const index = rules.findIndex(r => r.id === id);
  if (index !== -1) {
    rules.splice(index, 1);
    saveRules();
    return true;
  }
  return false;
}

// Get all rules
function getRules() {
  return rules;
}

// Normalize URL by removing parameters that would be added by auto-apply rules
function normalizeUrl(url, rule) {
  try {
    const urlObj = new URL(url);
    
    // Remove parameters that are in the rule
    for (const param of rule.parameters) {
      console.log(`[normalizeUrl] Removing param: ${param.key} from URL: ${url}`);
      urlObj.searchParams.delete(param.key);
    }
    
    const normalized = urlObj.toString();
    console.log(`[normalizeUrl] Original: ${url}`);
    console.log(`[normalizeUrl] Normalized: ${normalized}`);
    return normalized;
  } catch (e) {
    console.error(`[normalizeUrl] Error: ${e.message}`);
    return url;
  }
}

// Check if URL was redirected by our rule by comparing parameter values
function wasRedirectedByRule(url, rule) {
  try {
    const urlObj = new URL(url);
    
    // Check if all rule parameters have the same values as in the URL
    for (const param of rule.parameters) {
      const urlValue = urlObj.searchParams.get(param.key);
      if (urlValue !== param.value) {
        console.log(`[wasRedirectedByRule] Parameter ${param.key} mismatch: rule has "${param.value}", URL has "${urlValue}"`);
        return false;
      }
    }
    
    console.log(`[wasRedirectedByRule] All parameters match rule values`);
    return true;
  } catch (e) {
    console.error(`[wasRedirectedByRule] Error: ${e.message}`);
    return false;
  }
}

// Apply a rule to a URL
function applyRuleToUrl(url, rule) {
  try {
    const urlObj = new URL(url);
    
    console.log(`[applyRuleToUrl] Original URL: ${url}`);
    console.log(`[applyRuleToUrl] Rule parameters:`, rule.parameters);
    
    // Add/replace parameters
    for (const param of rule.parameters) {
      console.log(`[applyRuleToUrl] Setting param: ${param.key}=${param.value}`);
      urlObj.searchParams.set(param.key, param.value);
    }
    
    const newUrl = urlObj.toString();
    console.log(`[applyRuleToUrl] New URL: ${newUrl}`);
    return newUrl;
  } catch (e) {
    console.error(`[applyRuleToUrl] Error: ${e.message}`);
    return null;
  }
}

// Set up dynamic rules for URL transformation
function setupDynamicRules(ruleId, urlPattern, parameters) {
  const rule = {
    id: ruleId,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        transform: {
          queryTransform: {
            addOrReplaceParams: parameters.map(p => ({ key: p.key, value: p.value }))
          }
        }
      }
    },
    condition: {
      urlFilter: urlPattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&') + '*',
      resourceTypes: ['main_frame']
    }
  };
  
  // Remove existing rule with same ID if present
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [ruleId],
    addRules: [rule]
  });
}

// Clear dynamic rules for a rule ID
function clearDynamicRules(ruleId) {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [ruleId]
  });
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_RULES':
      (async () => {
        const rules = await getRulesWithLoad();
        console.log('[GET_RULES] Returning rules:', rules);
        sendResponse({ rules: rules });
      })();
      return true;
      
    case 'ADD_RULE':
      (async () => {
        try {
          const newRule = await addRule(message.urlPattern, message.parameters, message.autoApply);
          setupDynamicRules(newRule.id, newRule.urlPattern, newRule.parameters);
          sendResponse({ success: true, rule: newRule });
        } catch (error) {
          console.error('Error adding rule:', error);
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
      
    case 'UPDATE_RULE':
      const updatedRule = updateRule(message.id, message.urlPattern, message.parameters, message.autoApply);
      if (updatedRule) {
        setupDynamicRules(updatedRule.id, updatedRule.urlPattern, updatedRule.parameters);
      }
      sendResponse({ success: !!updatedRule, rule: updatedRule });
      return true;
      
    case 'DELETE_RULE':
      const deleted = deleteRule(message.id);
      clearDynamicRules(message.id);
      sendResponse({ success: deleted });
      return true;
      
    case 'APPLY_RULE':
      // Get current tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          const tab = tabs[0];
          const rule = rules.find(r => r.id === message.ruleId);
          
          if (rule && tab.url) {
            // Check if current tab URL matches the rule's URL pattern
            if (!tab.url.startsWith(rule.urlPattern)) {
              sendResponse({ 
                success: false, 
                error: `URL does not match rule pattern. Expected to start with: ${rule.urlPattern}` 
              });
              return true;
            }
            
            const newUrl = applyRuleToUrl(tab.url, rule);
            if (newUrl) {
              chrome.tabs.update(tab.id, { url: newUrl });
              sendResponse({ success: true, newUrl: newUrl });
              return true;
            }
          }
          // Add specific error handling for restricted pages
          if (tab.url && !tab.url.startsWith('http')) {
            sendResponse({ success: false, error: 'Cannot modify URL on this page type' });
            return true;
          }
          sendResponse({ success: false, error: 'Could not apply rule' });
          return true;
        }
        sendResponse({ success: false, error: 'No active tab found' });
        return true;
      });
      return true;
      
    case 'GET_CURRENT_TAB':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        sendResponse({ 
          success: tabs.length > 0, 
          url: tabs.length > 0 ? tabs[0].url : null 
        });
      });
      return true;
      
    case 'UPDATE_RULE_AUTOAPPLY':
      const ruleToUpdate = rules.find(r => r.id === message.id);
      if (ruleToUpdate) {
        const wasAutoApply = ruleToUpdate.autoApply;
        ruleToUpdate.autoApply = message.autoApply;
        saveRules();
        // Update dynamic rules based on autoApply status
        if (ruleToUpdate.autoApply) {
          setupDynamicRules(ruleToUpdate.id, ruleToUpdate.urlPattern, ruleToUpdate.parameters);
        } else {
          clearDynamicRules(ruleToUpdate.id);
        }
        // Clear auto-apply tracking for tabs matching this rule when auto-apply is toggled
        // This allows re-enabling auto-apply to work on matching tabs
        if (message.autoApply !== wasAutoApply) {
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              if (tab.url && tab.url.startsWith(ruleToUpdate.urlPattern)) {
                autoAppliedTabs.delete(tab.id);
              }
            });
          });
        }
        sendResponse({ success: true, rule: ruleToUpdate });
      } else {
        sendResponse({ success: false, error: 'Rule not found' });
      }
      return true;
      
    case 'QUICK_ADD_RULE':
      (async () => {
        try {
          const newRule = await addRule(message.urlPattern, message.parameters, message.autoApply);
          setupDynamicRules(newRule.id, newRule.urlPattern, newRule.parameters);
          sendResponse({ success: true, rule: newRule });
        } catch (error) {
          console.error('Error adding quick add rule:', error);
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
  }
  
  return false;
});

// Listen for tab updates to auto-apply rules
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only process when tab is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    console.log(`[onUpdated] Tab ${tabId} updated. URL: ${tab.url}`);
    console.log(`[onUpdated] Auto-applied tabs:`, Array.from(autoAppliedTabs));
    
    // Check if the URL has changed significantly (different path or query)
    const lastUrl = lastTabUrls.get(tabId);
    if (lastUrl && lastUrl !== tab.url) {
      console.log(`[onUpdated] URL changed from: ${lastUrl}`);
      
      // Check if the URL change is caused by our own redirect
      // by comparing parameter values (not just normalized URLs)
      let isOwnRedirect = false;
      for (const rule of rules) {
        if (rule.autoApply && tab.url.startsWith(rule.urlPattern)) {
          console.log(`[onUpdated] Found matching auto-apply rule:`, rule);
          
          // Check if the current URL has the same parameter values as the rule would set
          const isRedirectedByRule = wasRedirectedByRule(tab.url, rule);
          console.log(`[onUpdated] wasRedirectedByRule: ${isRedirectedByRule}`);
          
          if (isRedirectedByRule) {
            console.log(`[onUpdated] Detected as own redirect`);
            isOwnRedirect = true;
            break;
          }
        }
      }
      
      // Clear the auto-apply tracking if the URL changed significantly and it's not our own redirect
      if (!isOwnRedirect) {
        console.log(`[onUpdated] Not own redirect, clearing autoAppliedTabs`);
        autoAppliedTabs.delete(tabId);
      } else {
        console.log(`[onUpdated] Is own redirect, keeping autoAppliedTabs`);
      }
    }
    
    // Update the last URL for this tab
    lastTabUrls.set(tabId, tab.url);
    
    // Skip if this tab has already had auto-apply applied
    if (autoAppliedTabs.has(tabId)) {
      console.log(`[onUpdated] Tab ${tabId} already auto-applied, skipping`);
      return;
    }
    
    // Find all auto-apply rules that match the current URL
    const matchingRules = rules.filter(rule => 
      rule.autoApply && tab.url.startsWith(rule.urlPattern)
    );
    
    console.log(`[onUpdated] Matching rules:`, matchingRules);
    
    if (matchingRules.length > 0) {
      // Apply the first matching rule
      const rule = matchingRules[0];
      const newUrl = applyRuleToUrl(tab.url, rule);
      
      if (newUrl) {
        console.log(`[onUpdated] Applying rule ${rule.id}, new URL: ${newUrl}`);
        chrome.tabs.update(tabId, { url: newUrl });
        // Mark this tab as having had auto-apply applied
        autoAppliedTabs.add(tabId);
        console.log(`[onUpdated] Added tab ${tabId} to autoAppliedTabs`);
      }
    }
  }
});

// Listen for tab removal to clean up tracking
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // Clear the auto-apply tracking and last URL for the removed tab
  autoAppliedTabs.delete(tabId);
  lastTabUrls.delete(tabId);
});

// Initialize
loadRules();
