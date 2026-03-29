/**
 * Unit tests for rule management functions
 * Tests: addRule, updateRule, deleteRule, getRules
 */

const ruleManager = require('../core/ruleManager');

describe('Rule Management', () => {
  beforeEach(() => {
    // Reset the rule manager state before each test
    ruleManager.resetIdCounter();
    ruleManager.setRules([]);
  });

  describe('addRule', () => {
    it('should add a new rule with correct ID', () => {
      const urlPattern = 'https://example.com/page';
      const parameters = [{ key: 'sortby', value: 'asc' }];
      
      const rule = ruleManager.addRule(urlPattern, parameters);
      
      expect(rule).toEqual({
        id: 1,
        urlPattern: 'https://example.com/page',
        parameters: [{ key: 'sortby', value: 'asc' }],
        autoApply: false
      });
    });

    it('should increment ID for each new rule', () => {
      ruleManager.addRule('https://example.com/page1', []);
      ruleManager.addRule('https://example.com/page2', []);
      ruleManager.addRule('https://example.com/page3', []);
      
      const rules = ruleManager.getRules();
      expect(rules[0].id).toBe(1);
      expect(rules[1].id).toBe(2);
      expect(rules[2].id).toBe(3);
    });

    it('should set autoApply to false by default', () => {
      const rule = ruleManager.addRule('https://example.com/page', []);
      expect(rule.autoApply).toBe(false);
    });

    it('should set autoApply when provided', () => {
      const rule = ruleManager.addRule('https://example.com/page', [], true);
      expect(rule.autoApply).toBe(true);
    });

    it('should store the rule in the rules array', () => {
      ruleManager.addRule('https://example.com/page', [{ key: 'sortby', value: 'asc' }]);
      
      const rules = ruleManager.getRules();
      expect(rules).toHaveLength(1);
      expect(rules[0].urlPattern).toBe('https://example.com/page');
    });
  });

  describe('updateRule', () => {
    it('should update an existing rule', () => {
      const rule = ruleManager.addRule('https://example.com/page1', [{ key: 'sortby', value: 'asc' }]);
      
      const updatedRule = ruleManager.updateRule(rule.id, 'https://example.com/page2', [{ key: 'filter', value: 'active' }], true);
      
      expect(updatedRule).toEqual({
        id: 1,
        urlPattern: 'https://example.com/page2',
        parameters: [{ key: 'filter', value: 'active' }],
        autoApply: true
      });
    });

    it('should return null for non-existent rule', () => {
      const result = ruleManager.updateRule(999, 'https://example.com/page', []);
      expect(result).toBeNull();
    });

    it('should preserve the rule ID during update', () => {
      const rule = ruleManager.addRule('https://example.com/page', []);
      expect(rule.id).toBe(1);
      
      ruleManager.updateRule(1, 'https://example.com/newpage', []);
      const rules = ruleManager.getRules();
      expect(rules[0].id).toBe(1);
    });
  });

  describe('deleteRule', () => {
    it('should delete an existing rule', () => {
      const rule = ruleManager.addRule('https://example.com/page', []);
      
      const result = ruleManager.deleteRule(rule.id);
      
      expect(result).toBe(true);
      expect(ruleManager.getRules()).toHaveLength(0);
    });

    it('should return false for non-existent rule', () => {
      const result = ruleManager.deleteRule(999);
      expect(result).toBe(false);
    });

    it('should not affect other rules when deleting', () => {
      ruleManager.addRule('https://example.com/page1', []);
      ruleManager.addRule('https://example.com/page2', []);
      ruleManager.addRule('https://example.com/page3', []);
      
      ruleManager.deleteRule(2);
      
      const rules = ruleManager.getRules();
      expect(rules).toHaveLength(2);
      expect(rules[0].id).toBe(1);
      expect(rules[1].id).toBe(3);
    });
  });

  describe('getRules', () => {
    it('should return empty array when no rules exist', () => {
      expect(ruleManager.getRules()).toEqual([]);
    });

    it('should return all added rules', () => {
      ruleManager.addRule('https://example.com/page1', [{ key: 'a', value: '1' }]);
      ruleManager.addRule('https://example.com/page2', [{ key: 'b', value: '2' }]);
      
      const rules = ruleManager.getRules();
      expect(rules).toHaveLength(2);
      expect(rules[0].urlPattern).toBe('https://example.com/page1');
      expect(rules[1].urlPattern).toBe('https://example.com/page2');
    });
  });

  describe('setRules', () => {
    it('should replace the rules array', () => {
      ruleManager.addRule('https://example.com/page1', []);
      expect(ruleManager.getRules()).toHaveLength(1);
      
      ruleManager.setRules([
        { id: 1, urlPattern: 'https://example.com/new', parameters: [], autoApply: false }
      ]);
      
      expect(ruleManager.getRules()).toHaveLength(1);
      expect(ruleManager.getRules()[0].urlPattern).toBe('https://example.com/new');
    });
  });
});
