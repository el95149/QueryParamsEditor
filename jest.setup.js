// Mock Chrome extension APIs for testing
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  declarativeNetRequest: {
    updateDynamicRules: jest.fn(),
  },
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
  },
  tabs: {
    query: jest.fn(),
    update: jest.fn(),
    onUpdated: {
      addListener: jest.fn(),
    },
    onRemoved: {
      addListener: jest.fn(),
    },
  },
};

// Mock chrome.runtime.lastError
Object.defineProperty(global.chrome.runtime, 'lastError', {
  value: null,
  writable: true,
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Helper to reset all mocks
function resetMocks() {
  jest.clearAllMocks();
}

module.exports = { resetMocks };
