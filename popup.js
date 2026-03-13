// DOM Elements
const currentUrlEl = document.getElementById('currentUrl');
const rulesListEl = document.getElementById('rulesList');
const addRuleBtn = document.getElementById('addRuleBtn');
const quickAddBtn = document.getElementById('quickAddBtn');
const ruleModal = document.getElementById('ruleModal');
const modalTitle = document.getElementById('modalTitle');
const urlPatternInput = document.getElementById('urlPattern');
const parametersListEl = document.getElementById('parametersList');
const addParamBtn = document.getElementById('addParamBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveRuleBtn = document.getElementById('saveRuleBtn');
const closeBtn = document.querySelector('.close-btn');
const urlInfoEl = document.getElementById('urlInfo');
const paramsPreviewEl = document.getElementById('paramsPreview');
const autoApplyCheckbox = document.getElementById('autoApplyCheckbox');

// State
let currentRules = [];
let editingRuleId = null;
let currentTabUrl = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCurrentTabUrl();
  loadRules();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  addRuleBtn.addEventListener('click', openAddRuleModal);
  quickAddBtn.addEventListener('click', quickAddRule);
  addParamBtn.addEventListener('click', addParameterRow);
  cancelBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  saveRuleBtn.addEventListener('click', saveRule);
  
  // Close modal when clicking outside
  ruleModal.addEventListener('click', (e) => {
    if (e.target === ruleModal) closeModal();
  });
}

// Load current tab URL
function loadCurrentTabUrl() {
  chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB' }, (response) => {
    if (response && response.success) {
      currentTabUrl = response.url;
      currentUrlEl.textContent = currentTabUrl;
      showCurrentParameters();
    } else {
      currentUrlEl.textContent = 'Unable to get current tab URL';
      paramsPreviewEl.innerHTML = '';
    }
  });
}

// Show current URL parameters and preview of changes
function showCurrentParameters() {
  if (!currentTabUrl) {
    paramsPreviewEl.innerHTML = '';
    return;
  }
  
  try {
    const urlObj = new URL(currentTabUrl);
    const currentParams = Array.from(urlObj.searchParams.entries());
    
    if (currentParams.length === 0) {
      paramsPreviewEl.innerHTML = '<p class="info-text">No existing URL parameters.</p>';
      return;
    }
    
    // Display current parameters
    let html = '<p class="info-text">Current URL parameters:</p><ul class="param-list">';
    currentParams.forEach(([key, value]) => {
      html += `<li><code>${escapeHtml(key)}=${escapeHtml(value)}</code></li>`;
    });
    html += '</ul>';
    
    paramsPreviewEl.innerHTML = html;
  } catch (e) {
    paramsPreviewEl.innerHTML = '';
  }
}

// Load rules from background
function loadRules() {
  console.log('[popup.js] Loading rules from background...');
  chrome.runtime.sendMessage({ type: 'GET_RULES' }, (response) => {
    console.log('[popup.js] Response from background:', response);
    if (response && response.rules) {
      currentRules = response.rules;
      console.log('[popup.js] Loaded rules:', currentRules);
      renderRules();
    } else if (chrome.runtime.lastError) {
      console.error('[popup.js] Error:', chrome.runtime.lastError.message);
    }
  });
}

// Render rules list
function renderRules() {
  if (currentRules.length === 0) {
    rulesListEl.innerHTML = '<div class="no-rules">No rules configured yet. Click "Add Rule" to create one.</div>';
    return;
  }
  
   rulesListEl.innerHTML = currentRules.map(rule => `
     <div class="rule-item" data-id="${rule.id}">
       <div class="rule-info">
         <div class="rule-url">${escapeHtml(rule.urlPattern)}</div>
         <div class="rule-params">
           ${rule.parameters.map(p => `${escapeHtml(p.key)}=${escapeHtml(p.value)}`).join(', ')}
         </div>
         <div class="rule-autoapply">
           <label class="autoapply-switch">
             <input type="checkbox" class="autoapply-toggle" data-id="${rule.id}" ${rule.autoApply ? 'checked' : ''}>
             <span class="autoapply-slider"></span>
             <span class="autoapply-label">${rule.autoApply ? 'Auto-Apply' : 'Auto-Apply'}</span>
           </label>
         </div>
       </div>
       <div class="rule-actions">
         <button class="btn apply-btn" data-id="${rule.id}">Apply to Current Tab</button>
         <button class="btn edit-btn" data-id="${rule.id}">Edit</button>
         <button class="btn delete-btn" data-id="${rule.id}">Delete</button>
       </div>
     </div>
   `).join('');
  
   // Add event listeners to buttons
   document.querySelectorAll('.apply-btn').forEach(btn => {
     btn.addEventListener('click', () => applyRule(parseInt(btn.dataset.id)));
   });
   
   document.querySelectorAll('.edit-btn').forEach(btn => {
     btn.addEventListener('click', () => openEditRuleModal(parseInt(btn.dataset.id)));
   });
   
   document.querySelectorAll('.delete-btn').forEach(btn => {
     btn.addEventListener('click', () => deleteRule(parseInt(btn.dataset.id)));
   });
   
   // Add event listeners to autoApply toggles
   document.querySelectorAll('.autoapply-toggle').forEach(toggle => {
     toggle.addEventListener('change', (e) => {
       const ruleId = parseInt(e.target.dataset.id);
       const autoApply = e.target.checked;
       updateRuleAutoApply(ruleId, autoApply);
     });
   });
}

// Open add rule modal
function openAddRuleModal() {
  editingRuleId = null;
  modalTitle.textContent = 'Add Rule';
  urlPatternInput.value = '';
  parametersListEl.innerHTML = '';
  addParameterRow();
  autoApplyCheckbox.checked = false;
  ruleModal.style.display = 'flex';
  urlPatternInput.focus();
}

// Open edit rule modal
function openEditRuleModal(id) {
  const rule = currentRules.find(r => r.id === id);
  if (!rule) return;
  
  editingRuleId = id;
  modalTitle.textContent = 'Edit Rule';
  urlPatternInput.value = rule.urlPattern || '';
  parametersListEl.innerHTML = '';
  rule.parameters.forEach(p => addParameterRow(p.key, p.value));
  autoApplyCheckbox.checked = rule.autoApply || false;
  ruleModal.style.display = 'flex';
  urlPatternInput.focus();
}

// Quick Add Rule - creates a rule using current tab URL and parameters
function quickAddRule() {
  if (!currentTabUrl) {
    alert('Unable to get current tab URL');
    return;
  }
  
  try {
    const urlObj = new URL(currentTabUrl);
    const currentParams = Array.from(urlObj.searchParams.entries());
    
    if (currentParams.length === 0) {
      alert('No URL parameters found to add to the rule');
      return;
    }
    
    // Get URL without query parameters for the pattern
    const urlPattern = urlObj.origin + urlObj.pathname;
    
    editingRuleId = null;
    modalTitle.textContent = 'Quick Add Rule';
    urlPatternInput.value = urlPattern;
    parametersListEl.innerHTML = '';
    
    // Add all current parameters to the rule
    currentParams.forEach(([key, value]) => {
      addParameterRow(key, value);
    });
    
    // Set autoApply checkbox to unchecked by default (user can enable if desired)
    autoApplyCheckbox.checked = false;
    
    ruleModal.style.display = 'flex';
    urlPatternInput.focus();
  } catch (e) {
    alert('Error parsing current URL: ' + e.message);
  }
}

// Close modal
function closeModal() {
  ruleModal.style.display = 'none';
  editingRuleId = null;
}

// Add parameter row
function addParameterRow(key = '', value = '') {
  const paramId = Date.now();
  const row = document.createElement('div');
  row.className = 'param-row';
  row.innerHTML = `
    <input type="text" class="param-key" placeholder="Key" value="${escapeHtml(key)}">
    <input type="text" class="param-value" placeholder="Value" value="${escapeHtml(value)}">
    <button class="remove-param-btn" data-param-id="${paramId}">&times;</button>
  `;
  parametersListEl.appendChild(row);
  
  // Add remove listener
  row.querySelector('.remove-param-btn').addEventListener('click', () => {
    row.remove();
  });
}

// Save rule
function saveRule() {
  const urlPattern = urlPatternInput.value.trim();
  const paramRows = parametersListEl.querySelectorAll('.param-row');
  
  if (!urlPattern) {
    alert('Please enter a URL pattern');
    return;
  }
  
  // Validate URL pattern
  try {
    new URL(urlPattern);
  } catch (e) {
    alert('Invalid URL pattern. Please enter a valid URL (e.g., https://example.com/path/)');
    return;
  }
  
  const parameters = [];
  paramRows.forEach(row => {
    const key = row.querySelector('.param-key').value.trim();
    const value = row.querySelector('.param-value').value.trim();
    if (key && value) {
      parameters.push({ key, value });
    }
  });
  
  if (parameters.length === 0) {
    alert('Please add at least one parameter');
    return;
  }
  
   const message = {
     type: editingRuleId ? 'UPDATE_RULE' : 'ADD_RULE',
     id: editingRuleId,
     urlPattern: urlPattern,
     parameters: parameters,
     autoApply: autoApplyCheckbox.checked
   };
  
  chrome.runtime.sendMessage(message, (response) => {
    if (chrome.runtime.lastError) {
      alert('Connection error: ' + chrome.runtime.lastError.message);
      return;
    }
    if (response && response.success) {
      closeModal();
      loadRules();
    } else {
      alert('Failed to save rule');
      console.log('test');
      console.log('Error response:', response);
    }
  });
}

// Delete rule
function deleteRule(id) {
  if (!confirm('Are you sure you want to delete this rule?')) return;
  
  chrome.runtime.sendMessage({ type: 'DELETE_RULE', id: id }, (response) => {
    if (response && response.success) {
      loadRules();
    } else {
      alert('Failed to delete rule');
    }
  });
}

// Apply rule to current tab
// NOTE: When a rule is applied, the parameters in the rule will REPLACE existing parameters
// with the same key, and ADD new parameters that don't exist in the URL.
// For example, if the URL has ?a=1&b=2 and the rule has {a: "new", c: "3"},
// the result will be ?a=new&b=2&c=3 (parameter 'a' is replaced, 'b' stays, 'c' is added).
function applyRule(id) {
  chrome.runtime.sendMessage({ type: 'APPLY_RULE', ruleId: id }, (response) => {
    if (response && response.success) {
      // URL will be updated by the background script
      console.log('Rule applied successfully. New URL:', response.newUrl);
    } else {
      alert(response?.error || 'Failed to apply rule');
    }
  });
}

// Update rule autoApply setting
function updateRuleAutoApply(ruleId, autoApply) {
  chrome.runtime.sendMessage({ 
    type: 'UPDATE_RULE_AUTOAPPLY', 
    id: ruleId,
    autoApply: autoApply
  }, (response) => {
    if (response && response.success) {
      console.log('Auto-apply updated for rule', ruleId, ':', autoApply);
    } else {
      alert('Failed to update auto-apply setting');
      // Revert the toggle if update failed
      const toggle = document.querySelector(`.autoapply-toggle[data-id="${ruleId}"]`);
      if (toggle) toggle.checked = !autoApply;
    }
  });
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
