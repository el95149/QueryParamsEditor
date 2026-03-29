# Unit Tests for Query Parameters Editor

This document describes the unit testing setup for the Firefox extension.

## Test Structure

```
tests/
├── urlTransformation.test.js   # Tests for URL parameter transformation
├── ruleManager.test.js         # Tests for rule management functions
├── popup.test.js               # Tests for popup UI logic
└── integration.test.js         # Integration tests for end-to-end flows

core/
└── ruleManager.js              # Testable rule management module
```

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Test Categories

### 1. URL Transformation Tests (`tests/urlTransformation.test.js`)

Tests for the core URL transformation functions:

- **`normalizeUrl(url, rule)`** - Removes parameters specified in a rule from a URL
- **`wasRedirectedByRule(url, rule)`** - Checks if a URL was redirected by a rule
- **`applyRuleToUrl(url, rule)`** - Applies a rule's parameters to a URL

Example test:
```javascript
it('should add new parameters to URL', () => {
  const url = 'https://example.com/page';
  const rule = { parameters: [{ key: 'sortby', value: 'asc' }] };
  
  const result = applyRuleToUrl(url, rule);
  expect(result).toBe('https://example.com/page?sortby=asc');
});
```

### 2. Rule Management Tests (`tests/ruleManager.test.js`)

Tests for CRUD operations on rules:

- **`addRule(urlPattern, parameters, autoApply)`** - Adds a new rule
- **`updateRule(id, urlPattern, parameters, autoApply)`** - Updates an existing rule
- **`deleteRule(id)`** - Deletes a rule
- **`getRules()`** - Gets all rules

Example test:
```javascript
it('should add a new rule with correct ID', () => {
  const rule = addRule('https://example.com/page', [{ key: 'sortby', value: 'asc' }]);
  expect(rule.id).toBe(1);
});
```

### 3. Popup UI Tests (`tests/popup.test.js`)

Tests for popup UI functionality:

- URL pattern validation
- Parameter validation
- URL parameter manipulation using `URL` and `URLSearchParams`

Example test:
```javascript
it('should validate valid URL pattern', () => {
  expect(() => new URL('https://example.com/page/')).not.toThrow();
});
```

### 4. Integration Tests (`tests/integration.test.js`)

End-to-end tests that verify the interaction between components:

- Rule application flow
- Multiple parameter handling
- Rule updates and deletions
- URL normalization flow

Example test:
```javascript
it('should add rule, apply to URL, and verify transformation', () => {
  const rule = addRule('https://example.com/page/', [{ key: 'sortby', value: 'asc' }]);
  const originalUrl = 'https://example.com/page/?existing=param';
  const newUrl = applyRuleToUrl(originalUrl, rule);
  
  expect(newUrl).toContain('sortby=asc');
  expect(wasRedirectedByRule(newUrl, rule)).toBe(true);
});
```

## Core Module

The `core/ruleManager.js` module provides testable versions of the core functions without Chrome extension API dependencies. This allows testing the business logic in isolation.

Key functions:
- `getRules()`, `setRules()`
- `addRule()`, `updateRule()`, `deleteRule()`
- `normalizeUrl()`, `wasRedirectedByRule()`, `applyRuleToUrl()`
- `setupDynamicRules()`, `clearDynamicRules()`

## Code Coverage

Run with coverage to see which parts of the code are tested:

```bash
npm run test:coverage
```

This generates a coverage report in the terminal and in the `coverage/` directory.

Current coverage:
- **Statements**: 95.65%
- **Branches**: 100%
- **Functions**: 85.71%
- **Lines**: 95.45%

## Continuous Integration

To add tests to your CI/CD pipeline, simply run:

```bash
npm test
```

Or for coverage:

```bash
npm run test:coverage
```
