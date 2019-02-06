module.exports = {
  'env': {
    'browser': true,
    'es6': true,
    'jest': true,
    'jest/globals': true,
    'node': true
  },
  'extends': [
    'airbnb',
    'plugin:security/recommended'
  ],
  'parser': 'babel-eslint',
  'plugins': [
    'security',
    'jest'
  ],
  'rules': {
    'function-paren-newline': [0],
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'jsx-a11y/anchor-is-valid': 0,
    'no-shadow': [2, {'allow': ['Location']}],
    'no-underscore-dangle': 0,
    'react/no-unused-state': 0,
    'security/detect-object-injection': 0,
    'no-param-reassign': [2, {
      'ignorePropertyModificationsFor': ['draft']
    }]
  }
}