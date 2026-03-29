/**
 * Core rule management functions for the Firefox extension
 * These functions can be tested independently from the Chrome extension APIs
 */

// Rule storage key
const RULES_STORAGE_KEY = 'rules';

// In-memory rule cache
let rules = [];

// Get rules from in-memory cache
function getRules() {
  return rules;
}

// Set rules in in-memory cache (for testing)
function setRules(newRules) {
  rules = newRules;
}

// Add a new rule
function addRule(urlPattern, parameters, autoApply = false) {
  const id = getNextIdInternal();
  const newRule = {
    id: id,
    urlPattern: urlPattern,
    parameters: parameters,
    autoApply: autoApply
  };
  rules.push(newRule);
  return newRule;
}

// Internal ID generator for testing (no storage dependency)
let internalIdCounter = 1;
function getNextIdInternal() {
  return internalIdCounter++;
}

// Reset ID counter (for testing)
function resetIdCounter() {
  internalIdCounter = 1;
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
    return rules[index];
  }
  return null;
}

// Delete a rule
function deleteRule(id) {
  const index = rules.findIndex(r => r.id === id);
  if (index !== -1) {
    rules.splice(index, 1);
    return true;
  }
  return false;
}

// Normalize URL by removing parameters that would be added by auto-apply rules
function normalizeUrl(url, rule) {
  try {
    const urlObj = new URL(url);
    
    // Remove parameters that are in the rule
    for (const param of rule.parameters) {
      urlObj.searchParams.delete(param.key);
    }
    
    return urlObj.toString();
  } catch (e) {
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
        return false;
      }
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

// Apply a rule to a URL
function applyRuleToUrl(url, rule) {
  try {
    const urlObj = new URL(url);
    
    // Add/replace parameters
    for (const param of rule.parameters) {
      urlObj.searchParams.set(param.key, param.value);
    }
    
    return urlObj.toString();
  } catch (e) {
    return null;
  }
}

// Setup dynamic rules (mock implementation for testing)
function setupDynamicRules(ruleId, urlPattern, parameters) {
  // This would call chrome.declarativeNetRequest.updateDynamicRules in production
  return {
    ruleId,
    urlPattern,
    parameters,
    action: 'redirect',
    urlFilter: urlPattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&') + '*'
  };
}

// Clear dynamic rules (mock implementation for testing)
function clearDynamicRules(ruleId) {
  // This would call chrome.declarativeNetRequest.updateDynamicRules in production
  return { ruleId, action: 'clear' };
}

module.exports = {
  RULES_STORAGE_KEY,
  getRules,
  setRules,
  addRule,
  updateRule,
  deleteRule,
  normalizeUrl,
  wasRedirectedByRule,
  applyRuleToUrl,
  setupDynamicRules,
  clearDynamicRules,
  getNextIdInternal,
  resetIdCounter,
};
