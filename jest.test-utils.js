/**
 * Test utilities for the Firefox extension
 * 
 * This file provides additional helper functions that complement the
 * global mocks set up in jest.setup.js
 */

// Helper to set up storage mock responses
function setupStorageMock(responses) {
  global.chrome.storage.local.get.mockImplementation((keys, callback) => {
    const result = {};
    if (typeof keys === 'string') {
      result[keys] = responses[keys];
    } else if (Array.isArray(keys)) {
      keys.forEach(key => {
        result[key] = responses[key];
      });
    }
    callback(result);
  });
  
  global.chrome.storage.local.set.mockImplementation((data, callback) => {
    if (callback) callback();
  });
}

// Helper to create a URL object
function createUrl(urlString) {
  return new URL(urlString);
}

// Helper to simulate message listener callback
function simulateMessage(message, sendResponseCallback) {
  const listeners = global.chrome.runtime.onMessage.addListener.mock.calls[0]?.[0];
  if (listeners) {
    const result = listeners(message, {}, sendResponseCallback);
    return result;
  }
  return false;
}

module.exports = {
  setupStorageMock,
  createUrl,
  simulateMessage,
};
