/**
 * Integration tests for the Firefox extension
 * Tests the interaction between different components
 */

const ruleManager = require('../core/ruleManager');

describe('Integration Tests', () => {
  beforeEach(() => {
    ruleManager.resetIdCounter();
    ruleManager.setRules([]);
  });

  describe('Rule Application Flow', () => {
    it('should add rule, apply to URL, and verify transformation', () => {
      // Step 1: Add a rule
      const rule = ruleManager.addRule(
        'https://www.sklavenitis.gr/apotelesmata-anazitisis/',
        [{ key: 'sortby', value: 'UnitPriceAsc' }]
      );

      expect(rule.id).toBe(1);
      expect(rule.urlPattern).toBe('https://www.sklavenitis.gr/apotelesmata-anazitisis/');

      // Step 2: Apply rule to URL
      const originalUrl = 'https://www.sklavenitis.gr/apotelesmata-anazitisis/?Query=%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%B9%CE%BA%CF%8C%CF%82';
      const newUrl = ruleManager.applyRuleToUrl(originalUrl, rule);

      expect(newUrl).toContain('sortby=UnitPriceAsc');
      expect(newUrl).toContain('Query=%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%B9%CE%BA%CF%8C%CF%82');

      // Step 3: Verify the URL was redirected by the rule
      const wasRedirected = ruleManager.wasRedirectedByRule(newUrl, rule);
      expect(wasRedirected).toBe(true);
    });

    it('should handle multiple parameters in rule', () => {
      // Add rule with multiple parameters
      const rule = ruleManager.addRule(
        'https://example.com/search/',
        [
          { key: 'sortby', value: 'asc' },
          { key: 'filter', value: 'active' },
          { key: 'page', value: '1' }
        ]
      );

      // Apply to URL
      const originalUrl = 'https://example.com/search/?query=test';
      const newUrl = ruleManager.applyRuleToUrl(originalUrl, rule);

      expect(newUrl).toContain('sortby=asc');
      expect(newUrl).toContain('filter=active');
      expect(newUrl).toContain('page=1');
      expect(newUrl).toContain('query=test');

      // Verify all parameters match
      const wasRedirected = ruleManager.wasRedirectedByRule(newUrl, rule);
      expect(wasRedirected).toBe(true);
    });

    it('should update rule and verify changes', () => {
      // Add initial rule
      const rule = ruleManager.addRule(
        'https://example.com/page1',
        [{ key: 'param1', value: 'value1' }]
      );

      // Update rule
      const updatedRule = ruleManager.updateRule(
        rule.id,
        'https://example.com/page2',
        [{ key: 'param2', value: 'value2' }],
        true
      );

      expect(updatedRule.urlPattern).toBe('https://example.com/page2');
      expect(updatedRule.parameters).toEqual([{ key: 'param2', value: 'value2' }]);
      expect(updatedRule.autoApply).toBe(true);

      // Verify old parameters are gone
      const url = 'https://example.com/page2';
      const newUrl = ruleManager.applyRuleToUrl(url, updatedRule);
      expect(newUrl).not.toContain('param1');
      expect(newUrl).toContain('param2=value2');
    });

    it('should delete rule and verify removal', () => {
      // Add multiple rules
      ruleManager.addRule('https://example.com/page1', []);
      ruleManager.addRule('https://example.com/page2', []);
      ruleManager.addRule('https://example.com/page3', []);

      expect(ruleManager.getRules()).toHaveLength(3);

      // Delete middle rule
      const deleted = ruleManager.deleteRule(2);
      expect(deleted).toBe(true);
      expect(ruleManager.getRules()).toHaveLength(2);

      // Verify correct rule was deleted
      const remainingIds = ruleManager.getRules().map(r => r.id);
      expect(remainingIds).toContain(1);
      expect(remainingIds).toContain(3);
      expect(remainingIds).not.toContain(2);
    });
  });

  describe('URL Normalization Flow', () => {
    it('should normalize URL by removing auto-apply parameters', () => {
      const rule = ruleManager.addRule(
        'https://example.com/page',
        [{ key: 'sortby', value: 'asc' }]
      );

      const urlWithParam = 'https://example.com/page?sortby=asc&filter=active';
      const normalized = ruleManager.normalizeUrl(urlWithParam, rule);

      expect(normalized).toBe('https://example.com/page?filter=active');
      expect(normalized).not.toContain('sortby=asc');
    });

    it('should handle URL without matching parameters', () => {
      const rule = ruleManager.addRule(
        'https://example.com/page',
        [{ key: 'sortby', value: 'asc' }]
      );

      const url = 'https://example.com/page?filter=active';
      const normalized = ruleManager.normalizeUrl(url, rule);

      expect(normalized).toBe('https://example.com/page?filter=active');
    });
  });
});
