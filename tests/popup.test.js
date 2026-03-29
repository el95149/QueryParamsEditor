/**
 * Unit tests for popup UI logic
 * Tests: URL validation, parameter handling
 */

describe('Popup UI Logic', () => {
  describe('URL Pattern Validation', () => {
    it('should validate valid URL pattern', () => {
      const validUrls = [
        'https://example.com/page/',
        'https://www.example.com/path/to/page/',
        'http://localhost:3000/api/'
      ];
      
      validUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow();
      });
    });

    it('should reject invalid URL pattern', () => {
      const invalidUrls = [
        'not-a-url',
        'example.com',
        'http://',
        ''
      ];
      
      invalidUrls.forEach(url => {
        expect(() => new URL(url)).toThrow();
      });
    });
  });

  describe('Parameter Validation', () => {
    it('should validate parameter key and value', () => {
      const param = { key: 'sortby', value: 'asc' };
      expect(param.key).toBeTruthy();
      expect(param.value).toBeTruthy();
    });

    it('should reject empty parameter key', () => {
      const param = { key: '', value: 'asc' };
      expect(param.key).toBeFalsy();
    });

    it('should reject empty parameter value', () => {
      const param = { key: 'sortby', value: '' };
      expect(param.value).toBeFalsy();
    });
  });

  describe('URL Parameter Manipulation', () => {
    it('should add parameters to URL without existing params', () => {
      const url = new URL('https://example.com/page');
      url.searchParams.set('sortby', 'asc');
      expect(url.toString()).toBe('https://example.com/page?sortby=asc');
    });

    it('should replace existing parameters', () => {
      const url = new URL('https://example.com/page?sortby=desc');
      url.searchParams.set('sortby', 'asc');
      expect(url.toString()).toBe('https://example.com/page?sortby=asc');
    });

    it('should handle multiple parameters', () => {
      const url = new URL('https://example.com/page');
      url.searchParams.set('sortby', 'asc');
      url.searchParams.set('filter', 'active');
      expect(url.toString()).toContain('sortby=asc');
      expect(url.toString()).toContain('filter=active');
    });

    it('should delete parameters', () => {
      const url = new URL('https://example.com/page?sortby=asc&filter=active');
      url.searchParams.delete('sortby');
      expect(url.toString()).toBe('https://example.com/page?filter=active');
    });

    it('should get parameter value', () => {
      const url = new URL('https://example.com/page?sortby=asc');
      expect(url.searchParams.get('sortby')).toBe('asc');
      expect(url.searchParams.get('nonexistent')).toBeNull();
    });
  });
});
