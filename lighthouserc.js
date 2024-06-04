module.exports = {
  ci: {
    collect: {
      staticDistDir: './source/',
    },
    assertions: {
      // Set the minimum score thresholds here
      // 'categories:performance': ['error', { "minScore": 0.9 }],
      // 'categories:accessibility': ['error', { "minScore": 0.9 }],
      // 'categories:best-practices': ['error', { "minScore": 0.9 }],
      // 'categories:seo': ['error', { "minScore": 0.9 }],
      "audit-id-1": ["error", {"minScore": 0.9}],
      "audit-id-2": ["error", {"minScore": 0.9}],
      "audit-id-3": ["error", {"minScore": 0.9}],
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
