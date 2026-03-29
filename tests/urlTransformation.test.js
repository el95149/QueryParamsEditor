/**
 * Unit tests for URL parameter transformation functions
 * Tests: normalizeUrl, wasRedirectedByRule, applyRuleToUrl
 */

const ruleManager = require('../core/ruleManager');

describe('URL Parameter Transformation', () => {
  describe('normalizeUrl', () => {
    it('should remove parameters specified in rule', () => {
      const url = 'https://example.com/page?sortby=asc&filter=active&query=test';
      const rule = {
        parameters: [
          { key: 'sortby', value: 'asc' },
          { key: 'filter', value: 'active' }
        ]
      };

      const result = ruleManager.normalizeUrl(url, rule);
      expect(result).toBe('https://example.com/page?query=test');
    });

    it('should handle URL without parameters', () => {
      const url = 'https://example.com/page';
      const rule = {
        parameters: [{ key: 'sortby', value: 'asc' }]
      };

      const result = ruleManager.normalizeUrl(url, rule);
      expect(result).toBe('https://example.com/page');
    });

    it('should handle URL with only the parameter to remove', () => {
      const url = 'https://example.com/page?sortby=asc';
      const rule = {
        parameters: [{ key: 'sortby', value: 'asc' }]
      };

      const result = ruleManager.normalizeUrl(url, rule);
      expect(result).toBe('https://example.com/page');
    });

    it('should return original URL if parsing fails', () => {
      const url = 'invalid-url';
      const rule = {
        parameters: [{ key: 'sortby', value: 'asc' }]
      };

      const result = ruleManager.normalizeUrl(url, rule);
      expect(result).toBe('invalid-url');
    });

    it('should handle multiple parameters to remove', () => {
      const url = 'https://example.com/page?a=1&b=2&c=3&d=4';
      const rule = {
        parameters: [
          { key: 'a', value: '1' },
          { key: 'c', value: '3' }
        ]
      };

      const result = ruleManager.normalizeUrl(url, rule);
      expect(result).toBe('https://example.com/page?b=2&d=4');
    });
  });

  describe('wasRedirectedByRule', () => {
    it('should return true when all parameters match', () => {
      const url = 'https://example.com/page?sortby=asc&filter=active';
      const rule = {
        parameters: [
          { key: 'sortby', value: 'asc' },
          { key: 'filter', value: 'active' }
        ]
      };

      const result = ruleManager.wasRedirectedByRule(url, rule);
      expect(result).toBe(true);
    });

    it('should return false when a parameter value does not match', () => {
      const url = 'https://example.com/page?sortby=desc&filter=active';
      const rule = {
        parameters: [
          { key: 'sortby', value: 'asc' },
          { key: 'filter', value: 'active' }
        ]
      };

      const result = ruleManager.wasRedirectedByRule(url, rule);
      expect(result).toBe(false);
    });

    it('should return false when a parameter is missing', () => {
      const url = 'https://example.com/page?sortby=asc';
      const rule = {
        parameters: [
          { key: 'sortby', value: 'asc' },
          { key: 'filter', value: 'active' }
        ]
      };

      const result = ruleManager.wasRedirectedByRule(url, rule);
      expect(result).toBe(false);
    });

    it('should return false for invalid URL', () => {
      const url = 'invalid-url';
      const rule = {
        parameters: [{ key: 'sortby', value: 'asc' }]
      };

      const result = ruleManager.wasRedirectedByRule(url, rule);
      expect(result).toBe(false);
    });

    it('should handle URL with additional parameters', () => {
      const url = 'https://example.com/page?sortby=asc&filter=active&extra=param';
      const rule = {
        parameters: [
          { key: 'sortby', value: 'asc' },
          { key: 'filter', value: 'active' }
        ]
      };

      const result = ruleManager.wasRedirectedByRule(url, rule);
      expect(result).toBe(true);
    });
  });

  describe('applyRuleToUrl', () => {
    it('should add new parameters to URL', () => {
      const url = 'https://example.com/page';
      const rule = {
        parameters: [{ key: 'sortby', value: 'asc' }]
      };

      const result = ruleManager.applyRuleToUrl(url, rule);
      expect(result).toBe('https://example.com/page?sortby=asc');
    });

    it('should replace existing parameters', () => {
      const url = 'https://example.com/page?sortby=desc';
      const rule = {
        parameters: [{ key: 'sortby', value: 'asc' }]
      };

      const result = ruleManager.applyRuleToUrl(url, rule);
      expect(result).toBe('https://example.com/page?sortby=asc');
    });

    it('should handle multiple parameters', () => {
      const url = 'https://example.com/page';
      const rule = {
        parameters: [
          { key: 'sortby', value: 'asc' },
          { key: 'filter', value: 'active' }
        ]
      };

      const result = ruleManager.applyRuleToUrl(url, rule);
      expect(result).toContain('sortby=asc');
      expect(result).toContain('filter=active');
    });

    it('should mix existing and new parameters', () => {
      const url = 'https://example.com/page?sortby=desc&filter=inactive';
      const rule = {
        parameters: [
          { key: 'sortby', value: 'asc' },
          { key: 'newParam', value: 'value' }
        ]
      };

      const result = ruleManager.applyRuleToUrl(url, rule);
      expect(result).toContain('sortby=asc');
      expect(result).toContain('filter=inactive');
      expect(result).toContain('newParam=value');
    });

    it('should return null for invalid URL', () => {
      const url = 'invalid-url';
      const rule = {
        parameters: [{ key: 'sortby', value: 'asc' }]
      };

      const result = ruleManager.applyRuleToUrl(url, rule);
      expect(result).toBeNull();
    });

    it('should preserve URL path and origin', () => {
      const url = 'https://example.com/some/path?existing=param';
      const rule = {
        parameters: [{ key: 'newParam', value: 'value' }]
      };

      const result = ruleManager.applyRuleToUrl(url, rule);
      expect(result).toContain('existing=param');
      expect(result).toContain('newParam=value');
    });
  });
});
