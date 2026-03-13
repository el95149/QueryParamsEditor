# Phase 4 Testing Plan - Query Parameters Editor

## Overview

This document outlines the comprehensive testing plan for Phase 4 of the Firefox Query Parameters Editor extension. The testing plan covers core functionality, edge cases, error handling, and UI/UX tests.

---

## Test Environment Setup

### Prerequisites
- Firefox browser (latest stable version)
- Firefox Developer Edition or Nightly (for extension debugging)
- Extension loaded in `about:debugging#/runtime/this-firefox`

### Test URLs
- Primary test URL: `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
- Secondary test URL: `https://example.com/test/`
- Restricted page: `about:blank`, `chrome://extensions/`

---

## Loading the Extension in Firefox (Development Mode)

### Step 1: Prepare Extension Files

1. Ensure all extension files are in a single directory:
   ```
   QueryParamsEditor/
   ├── manifest.json
   ├── background.js
   ├── popup.html
   ├── popup.js
   └── styles.css
   ```

2. Verify `manifest.json` has the correct structure:
   ```json
   {
     "manifest_version": 3,
     "name": "Query Parameters Editor",
     "version": "1.0.0",
     "description": "Add/override GET URL parameters for configured URL patterns",
     "permissions": [
       "declarativeNetRequest",
       "declarativeNetRequestWithHostAccess",
       "storage",
       "tabs"
     ],
     "host_permissions": ["<all_urls>"],
     "action": {
       "default_popup": "popup.html"
     },
     "background": {
       "service_worker": "background.js"
     }
   }
   ```

### Step 2: Load Extension in Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`

2. Click **"Load Temporary Add-on..."** button

3. Navigate to your extension directory and select **`manifest.json`**

4. The extension should now appear in the list of loaded extensions

### Step 3: Verify Extension is Loaded

1. Check that the extension icon appears in the Firefox toolbar

2. Click the extension icon to open the popup

3. Verify the popup displays the current tab URL

4. Check the browser console for the message: `Rules loaded: []`

### Step 4: Debugging

#### View Background Script Console
1. In `about:debugging`, click on your extension
2. Click **"Inspect"** under the "Background Service Worker" section
3. This opens the Developer Tools for the background script
4. You can view console logs and debug issues

#### View Popup Console
1. Open the extension popup
2. Right-click anywhere in the popup
3. Select **"Inspect Element"**
4. This opens the Developer Tools for the popup

#### Common Debugging Tasks

**Check if rules are loaded:**
```javascript
// In background script console
console.log('Rules:', chrome.storage.sync.get('rules'));
```

**Check for errors:**
```javascript
// Look for error messages in the console
// Common errors:
// - "Cannot modify URL on this page type" - for restricted pages
// - "Connection error: ..." - for communication issues
```

**Test rule application:**
```javascript
// In background script console
chrome.declarativeNetRequest.getDynamicRules((rules) => {
  console.log('Dynamic rules:', rules);
});
```

### Step 5: Testing

1. Navigate to `https://www.sklavenitis.gr/apotelesmata-anazitisis/`

2. Open the extension popup

3. Follow the testing steps in the **Core Functionality Tests** section

4. Check the browser console for any errors during testing

### Step 6: Reloading the Extension

When you make changes to the extension code:

1. Click the **"Reload"** button next to your extension in `about:debugging`

2. Or click **"Unload"** and then **"Load Temporary Add-on..."** again

3. Refresh any open tabs to apply changes

### Step 7: Uninstalling the Extension

1. Click the **"Unload"** button next to your extension in `about:debugging`

2. Or click the **"Remove"** button in the Firefox Add-ons manager

---

## Test Execution Checklist

---

## 1. Core Functionality Tests

### Test 1.1: Basic Rule Creation and Application

**Objective:** Verify that a rule can be created and applied to a URL.

**Steps:**
1. Open the extension popup on `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
2. Click "Add Rule" button
3. Enter URL pattern: `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
4. Add parameter: `sortby=UnitPriceAsc`
5. Click "Save Rule"
6. Verify rule appears in the rules list
7. Click "Apply to Current Tab" button
8. Verify URL is updated with the new parameter

**Expected Result:**
- Rule is saved successfully
- URL is redirected to: `https://www.sklavenitis.gr/apotelesmata-anazitisis/?sortby=UnitPriceAsc&Query=...`
- Original parameters are preserved

**Test Data:**
- Original URL: `https://www.sklavenitis.gr/apotelesmata-anazitisis/?Query=%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%B9%CE%BA%CF%8C%CF%82`
- Expected URL: `https://www.sklavenitis.gr/apotelesmata-anazitisis/?sortby=UnitPriceAsc&Query=%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%B9%CE%BA%CF%8C%CF%82`

---

### Test 1.2: Multiple Parameters

**Objective:** Verify that multiple parameters can be added and applied.

**Steps:**
1. Click "Add Rule" button
2. Enter URL pattern: `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
3. Add parameters:
   - `sortby=UnitPriceAsc`
   - `page=2`
   - `itemsPerPage=20`
4. Click "Save Rule"
5. Click "Apply to Current Tab" button
6. Verify all parameters are applied

**Expected Result:**
- All three parameters are added to the URL
- URL format: `https://www.sklavenitis.gr/apotelesmata-anazitisis/?sortby=UnitPriceAsc&page=2&itemsPerPage=20&Query=...`

---

### Test 1.3: Parameter Replacement

**Objective:** Verify that existing parameters are replaced when applying a rule.

**Steps:**
1. Navigate to: `https://www.sklavenitis.gr/apotelesmata-anazitisis/?sortby=UnitPriceDesc&page=1`
2. Create a rule with:
   - URL pattern: `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
   - Parameters: `sortby=UnitPriceAsc`, `page=2`
3. Apply the rule
4. Verify parameters are replaced

**Expected Result:**
- `sortby` changes from `UnitPriceDesc` to `UnitPriceAsc`
- `page` changes from `1` to `2`
- Other parameters (if any) are preserved

---

### Test 1.4: Rule Persistence Across Restart

**Objective:** Verify that rules persist after browser restart.

**Steps:**
1. Create a rule with:
   - URL pattern: `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
   - Parameters: `sortby=UnitPriceAsc`
2. Verify rule appears in the list
3. Close Firefox completely
4. Restart Firefox
5. Open the extension popup
6. Verify rule is still present

**Expected Result:**
- Rule is loaded from storage on startup
- Rule can be applied after restart

**Verification:**
- Check browser console for: `Rules loaded: [...]`
- Verify rule count matches before restart

---

### Test 1.5: Rule Deletion

**Objective:** Verify that rules can be deleted and are removed from storage.

**Steps:**
1. Create a rule
2. Verify rule appears in the list
3. Click "Delete" button
4. Confirm deletion
5. Verify rule is removed from the list
6. Restart Firefox
7. Verify rule is not present after restart

**Expected Result:**
- Rule is removed from the list immediately
- Rule is not present after browser restart

---

### Test 1.6: Rule Editing

**Objective:** Verify that existing rules can be edited.

**Steps:**
1. Create a rule with:
   - URL pattern: `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
   - Parameters: `sortby=UnitPriceAsc`
2. Click "Edit" button on the rule
3. Change URL pattern to: `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
4. Change parameter to: `sortby=UnitPriceDesc`
5. Save the rule
6. Verify rule is updated in the list

**Expected Result:**
- Rule is updated with new values
- Dynamic rule is updated in the background script

---

## 2. Edge Case Tests

### Test 2.1: Empty Parameter Values

**Objective:** Verify that empty parameter values are handled correctly.

**Steps:**
1. Click "Add Rule" button
2. Enter URL pattern: `https://example.com/test/`
3. Add parameter with empty key: `=value`
4. Add parameter with empty value: `key=`
5. Add parameter with both empty: `=`
6. Try to save the rule

**Expected Result:**
- Rule should not be saved
- Error message: "Please enter a valid URL pattern" or "Please add at least one parameter"
- Empty keys or values are rejected

**Test Cases:**
- Key: "", Value: "test" → Should fail
- Key: "test", Value: "" → Should fail
- Key: "", Value: "" → Should fail

---

### Test 2.2: Special Characters in Parameters

**Objective:** Verify that special characters are properly encoded.

**Steps:**
1. Click "Add Rule" button
2. Enter URL pattern: `https://example.com/test/`
3. Add parameters with special characters:
   - `search=hello world`
   - `query=hello&world`
   - `name=John's Product`
   - `url=https://example.com`
4. Save the rule
5. Apply the rule
6. Verify URL encoding

**Expected Result:**
- Special characters are URL-encoded
- `hello world` → `hello+world` or `hello%20world`
- `hello&world` → `hello%26world`
- `John's Product` → `John's%20Product`
- `https://example.com` → `https%3A%2F%2Fexample.com`

---

### Test 2.3: Invalid URL Patterns

**Objective:** Verify that invalid URL patterns are rejected.

**Steps:**
1. Click "Add Rule" button
2. Try entering invalid URL patterns:
   - `not-a-url`
   - `http://`
   - `https://`
   - `example.com`
   - `https://example.com`
3. Try to save each pattern

**Expected Result:**
- All invalid patterns are rejected
- Error message: "Invalid URL pattern. Please enter a valid URL (e.g., https://example.com/path/)"
- Only valid URLs with protocol are accepted

**Test Cases:**
- `not-a-url` → Should fail
- `http://` → Should fail
- `https://` → Should fail
- `example.com` → Should fail
- `https://example.com` → Should pass (no trailing slash)

---

### Test 2.4: Restricted Pages

**Objective:** Verify that rules cannot be applied to restricted pages.

**Steps:**
1. Navigate to `about:blank`
2. Open the extension popup
3. Create a rule
4. Try to apply the rule
5. Verify error message

**Expected Result:**
- Rule cannot be applied
- Error message: "Cannot modify URL on this page type"
- No URL transformation occurs

**Test Pages:**
- `about:blank`
- `about:debugging`
- `chrome://extensions/`
- `file:///path/to/file.html`

---

### Test 2.5: URL with No Query Parameters

**Objective:** Verify that rules work correctly when URL has no existing parameters.

**Steps:**
1. Navigate to: `https://www.sklavenitis.gr/apotelesmata-anazitisis/` (without query params)
2. Create a rule with:
   - URL pattern: `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
   - Parameters: `sortby=UnitPriceAsc`
3. Apply the rule
4. Verify URL is updated correctly

**Expected Result:**
- URL becomes: `https://www.sklavenitis.gr/apotelesmata-anazitisis/?sortby=UnitPriceAsc`
- No existing parameters to preserve

---

### Test 2.6: URL with Existing Query Parameters

**Objective:** Verify that existing parameters are displayed and preserved.

**Steps:**
1. Navigate to: `https://www.sklavenitis.gr/apotelesmata-anazitisis/?Query=test&sortby=UnitPriceDesc`
2. Open the extension popup
3. Verify current parameters are displayed
4. Create a rule with:
   - URL pattern: `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
   - Parameters: `page=2`
5. Apply the rule
6. Verify existing parameters are preserved

**Expected Result:**
- Current parameters are displayed in the popup
- `Query=test` and `sortby=UnitPriceDesc` are preserved
- `page=2` is added
- Result: `?Query=test&sortby=UnitPriceDesc&page=2`

---

### Test 2.7: Duplicate Parameters

**Objective:** Verify that duplicate parameters are handled correctly.

**Steps:**
1. Navigate to: `https://www.sklavenitis.gr/apotelesmata-anazitisis/?sortby=UnitPriceDesc`
2. Create a rule with:
   - URL pattern: `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
   - Parameters: `sortby=UnitPriceAsc`
3. Apply the rule
4. Verify parameter is replaced

**Expected Result:**
- `sortby=UnitPriceDesc` is replaced with `sortby=UnitPriceAsc`
- Only one `sortby` parameter exists

---

## 3. Error Handling Tests

### Test 3.1: Network Errors

**Objective:** Verify that network errors are handled gracefully.

**Steps:**
1. Disconnect from the internet
2. Try to create a rule
3. Verify error message
4. Reconnect to the internet
5. Try to create a rule again

**Expected Result:**
- Error message: "Connection error: ..."
- Rule is not saved
- UI remains responsive
- After reconnection, rules can be created normally

---

### Test 3.2: Rule ID Reuse

**Objective:** Verify that rule IDs are properly managed and reused.

**Steps:**
1. Create 5 rules
2. Delete rule with ID 3
3. Create a new rule
4. Verify new rule ID is 3 (reused)
5. Verify all rules are functional

**Expected Result:**
- Rule ID 3 is reused
- All rules have unique IDs
- No conflicts occur

**Verification:**
- Check browser console for rule IDs
- Verify dynamic rules are updated correctly

---

### Test 3.3: Rule Limit (3000+ Rules)

**Objective:** Verify behavior with a large number of rules.

**Steps:**
1. Create 3000+ rules (automated script)
2. Verify performance
3. Try to create one more rule
4. Verify error handling

**Expected Result:**
- Performance degrades gracefully
- Rule limit is enforced by Firefox (3000 rules per extension)
- Error message if limit is exceeded

**Note:** Firefox has a limit of 3000 rules per extension. This test verifies graceful degradation.

---

### Test 3.4: Invalid Rule ID

**Objective:** Verify behavior when applying a rule with an invalid ID.

**Steps:**
1. Create a rule
2. Delete the rule
3. Try to apply the deleted rule (using the same ID)

**Expected Result:**
- Error message: "Could not apply rule"
- No URL transformation occurs

---

### Test 3.5: Missing Tab

**Objective:** Verify behavior when no active tab is found.

**Steps:**
1. Open the extension popup
2. Close all tabs
3. Try to apply a rule

**Expected Result:**
- Error message: "No active tab found"
- No URL transformation occurs

---

## 4. UI/UX Tests

### Test 4.1: Modal Close Behavior

**Objective:** Verify that the modal closes correctly in all scenarios.

**Steps:**
1. Click "Add Rule" button
2. Verify modal opens
3. Click "X" button
4. Verify modal closes
5. Click "Cancel" button
6. Verify modal closes
7. Click outside the modal
8. Verify modal closes

**Expected Result:**
- Modal closes in all scenarios
- No rules are saved when modal is closed without saving
- Form is reset when modal is closed

---

### Test 4.2: Loading States

**Objective:** Verify that loading states are displayed during operations.

**Steps:**
1. Create a rule
2. Verify "Saving..." state
3. Apply a rule
4. Verify "Applying..." state
5. Delete a rule
6. Verify "Deleting..." state

**Expected Result:**
- Loading states are displayed
- UI is disabled during operations
- Loading states are removed after completion

---

### Test 4.3: Error Messages

**Objective:** Verify that error messages are clear and helpful.

**Steps:**
1. Try to save a rule with invalid URL
2. Verify error message
3. Try to save a rule with empty parameters
4. Verify error message
5. Try to apply a rule on a restricted page
6. Verify error message

**Expected Result:**
- Error messages are clear and helpful
- Error messages are displayed in an alert or modal
- No technical jargon in error messages

**Error Messages:**
- "Invalid URL pattern. Please enter a valid URL (e.g., https://example.com/path/)"
- "Please enter a URL pattern"
- "Please add at least one parameter"
- "Cannot modify URL on this page type"
- "Connection error: ..."

---

### Test 4.4: Button States

**Objective:** Verify that button states are correct.

**Steps:**
1. Open the extension popup
2. Verify "Add Rule" button is enabled
3. Click "Add Rule"
4. Verify "Save Rule" button is enabled
5. Verify "Cancel" button is enabled
6. Try to save an invalid rule
7. Verify "Save Rule" button remains enabled

**Expected Result:**
- Buttons are enabled/disabled correctly
- No disabled states for critical actions

---

### Test 4.5: Parameter Row Management

**Objective:** Verify that parameter rows can be added and removed.

**Steps:**
1. Click "Add Rule" button
2. Verify one parameter row is present
3. Click "Add Parameter" button
4. Verify a new row is added
5. Click "×" button on a row
6. Verify the row is removed
7. Try to save with no parameters
8. Verify error message

**Expected Result:**
- Parameter rows can be added and removed
- At least one parameter is required
- Form validation works correctly

---

### Test 4.6: Current URL Display

**Objective:** Verify that the current URL is displayed correctly.

**Steps:**
1. Navigate to a URL
2. Open the extension popup
3. Verify URL is displayed
4. Navigate to a different URL
5. Open the extension popup
6. Verify URL is updated

**Expected Result:**
- Current URL is displayed correctly
- URL is updated when navigating to a different page

---

## 5. Performance Tests

### Test 5.1: Rule Loading Time

**Objective:** Verify that rules load quickly on startup.

**Steps:**
1. Create 100 rules
2. Restart Firefox
3. Measure time to load rules
4. Verify time is acceptable (< 1 second)

**Expected Result:**
- Rules load within 1 second
- UI is responsive during loading

---

### Test 5.2: Rule Application Time

**Objective:** Verify that rule application is fast.

**Steps:**
1. Create a rule
2. Apply the rule
3. Measure time to redirect
4. Verify time is acceptable (< 500ms)

**Expected Result:**
- Rule is applied within 500ms
- No noticeable delay

---

## 6. Regression Tests

### Test 6.1: Existing Rules After Update

**Objective:** Verify that existing rules work after an extension update.

**Steps:**
1. Create several rules
2. Update the extension (new version)
3. Verify rules are still present
4. Verify rules can be applied

**Expected Result:**
- Rules are preserved after update
- Rules work correctly after update

---

### Test 6.2: Storage Migration

**Objective:** Verify that storage is migrated correctly if schema changes.

**Steps:**
1. Create rules with old schema (if applicable)
2. Update the extension
3. Verify rules are migrated correctly
4. Verify rules can be applied

**Expected Result:**
- Rules are migrated correctly
- No data loss

---

## 7. Browser Compatibility Tests

### Test 7.1: Firefox Version Compatibility

**Objective:** Verify that the extension works across Firefox versions.

**Steps:**
1. Test on Firefox Stable
2. Test on Firefox Developer Edition
3. Test on Firefox Nightly
4. Verify all tests pass

**Expected Result:**
- Extension works on all supported Firefox versions
- No version-specific issues

---

### Test 7.2: Platform Compatibility

**Objective:** Verify that the extension works on different platforms.

**Steps:**
1. Test on Linux
2. Test on Windows
3. Test on macOS
4. Verify all tests pass

**Expected Result:**
- Extension works on all supported platforms
- No platform-specific issues

---

## 8. Security Tests

### Test 8.1: XSS Prevention

**Objective:** Verify that the extension is protected against XSS attacks.

**Steps:**
1. Try to inject JavaScript in URL pattern
2. Try to inject JavaScript in parameter keys
3. Try to inject JavaScript in parameter values
4. Verify no script execution

**Expected Result:**
- No script execution occurs
- HTML is properly escaped
- No XSS vulnerabilities

---

### Test 8.2: URL Validation

**Objective:** Verify that URL validation prevents malicious URLs.

**Steps:**
1. Try to enter a data URL
2. Try to enter a javascript URL
3. Try to enter a blob URL
4. Verify URLs are rejected

**Expected Result:**
- Malicious URLs are rejected
- Only valid HTTP/HTTPS URLs are accepted

---

## 9. Accessibility Tests

### Test 9.1: Keyboard Navigation

**Objective:** Verify that the extension is accessible via keyboard.

**Steps:**
1. Navigate the popup using Tab key
2. Verify focus order is logical
3. Verify all buttons are accessible
4. Verify modal can be closed with Escape key

**Expected Result:**
- All functionality is accessible via keyboard
- Focus order is logical
- Escape key closes the modal

---

### Test 9.2: Screen Reader Support

**Objective:** Verify that the extension is accessible to screen readers.

**Steps:**
1. Open the extension with a screen reader
2. Verify all elements are announced correctly
3. Verify button labels are clear

**Expected Result:**
- All elements are announced correctly
- Button labels are clear and descriptive

---

## 10. Integration Tests

### Test 10.1: End-to-End Workflow

**Objective:** Verify that the complete workflow works correctly.

**Steps:**
1. Navigate to `https://www.sklavenitis.gr/apotelesmata-anazitisis/`
2. Open the extension popup
3. Verify current URL is displayed
4. Create a rule with multiple parameters
5. Apply the rule
6. Verify URL is updated correctly
7. Edit the rule
8. Verify rule is updated
9. Delete the rule
10. Verify rule is deleted
11. Restart Firefox
12. Verify no rules are present

**Expected Result:**
- Complete workflow works correctly
- No errors occur
- State is managed correctly

---

### Test 10.2: Multiple Rules

**Objective:** Verify that multiple rules can be created and applied.

**Steps:**
1. Create 3 rules with different URL patterns
2. Apply each rule to the current tab
3. Verify each rule works correctly
4. Delete each rule
5. Verify each rule is deleted

**Expected Result:**
- Multiple rules can be created
- Each rule works independently
- Rules do not interfere with each other

---

## Test Execution Checklist

### Pre-Execution
- [ ] Firefox browser installed
- [ ] Extension loaded in `about:debugging`
- [ ] Test URLs accessible
- [ ] Test data prepared

### Core Functionality
- [ ] Test 1.1: Basic Rule Creation and Application
- [ ] Test 1.2: Multiple Parameters
- [ ] Test 1.3: Parameter Replacement
- [ ] Test 1.4: Rule Persistence Across Restart
- [ ] Test 1.5: Rule Deletion
- [ ] Test 1.6: Rule Editing

### Edge Cases
- [ ] Test 2.1: Empty Parameter Values
- [ ] Test 2.2: Special Characters in Parameters
- [ ] Test 2.3: Invalid URL Patterns
- [ ] Test 2.4: Restricted Pages
- [ ] Test 2.5: URL with No Query Parameters
- [ ] Test 2.6: URL with Existing Query Parameters
- [ ] Test 2.7: Duplicate Parameters

### Error Handling
- [ ] Test 3.1: Network Errors
- [ ] Test 3.2: Rule ID Reuse
- [ ] Test 3.3: Rule Limit (3000+ Rules)
- [ ] Test 3.4: Invalid Rule ID
- [ ] Test 3.5: Missing Tab

### UI/UX
- [ ] Test 4.1: Modal Close Behavior
- [ ] Test 4.2: Loading States
- [ ] Test 4.3: Error Messages
- [ ] Test 4.4: Button States
- [ ] Test 4.5: Parameter Row Management
- [ ] Test 4.6: Current URL Display

### Performance
- [ ] Test 5.1: Rule Loading Time
- [ ] Test 5.2: Rule Application Time

### Regression
- [ ] Test 6.1: Existing Rules After Update
- [ ] Test 6.2: Storage Migration

### Browser Compatibility
- [ ] Test 7.1: Firefox Version Compatibility
- [ ] Test 7.2: Platform Compatibility

### Security
- [ ] Test 8.1: XSS Prevention
- [ ] Test 8.2: URL Validation

### Accessibility
- [ ] Test 9.1: Keyboard Navigation
- [ ] Test 9.2: Screen Reader Support

### Integration
- [ ] Test 10.1: End-to-End Workflow
- [ ] Test 10.2: Multiple Rules

---

## Test Results Template

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Basic Rule Creation and Application | Pass/Fail | ... |
| 1.2 | Multiple Parameters | Pass/Fail | ... |
| ... | ... | ... | ... |

---

## Known Issues and Limitations

1. **Rule Limit:** Firefox has a limit of 3000 rules per extension. This is a browser limitation and cannot be worked around.

2. **Performance:** With a large number of rules, performance may degrade. This is expected behavior.

3. **Restricted Pages:** Rules cannot be applied to restricted pages (about:*, chrome://, file://). This is a security feature.

4. **URL Encoding:** Special characters are URL-encoded automatically. This is expected behavior.

---

## Conclusion

This testing plan provides a comprehensive coverage of the extension's functionality, edge cases, error handling, and UI/UX. All tests should be executed before releasing the extension to production.
