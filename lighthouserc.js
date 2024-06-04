module.exports = {
  ci: {
    collect: {
      staticDistDir: './source/',
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assertions: {
      // Set the minimum score thresholds here
      'categories:performance': ['error', { "minScore": 0.9 }],
      'categories:accessibility': ['error', { "minScore": 0.9 }],
      'categories:best-practices': ['error', { "minScore": 0.9 }],
      'categories:seo': ['error', { "minScore": 0.9 }],
    },
  },
};
