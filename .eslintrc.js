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
    'plugin:security/recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  globals: {
    // TODO: Should the following setting be moved to a .eslintrc file in the lib/ folder?
    //       Because: We don't want NodeJS types used in the React client side code.
    NodeJS: "readonly",
  },
  overrides: [{
    files: ['test/**/*.ts', 'test/**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 0,
    },
  }],
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions:  {
    ecmaVersion:  2018,  // Allows for the parsing of modern ECMAScript features
    sourceType:  'module',  // Allows for the use of imports
  },
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
    'no-param-reassign': [2, {
      'ignorePropertyModificationsFor': ['draft']
    }],
    'no-shadow': [2, {'allow': ['Location']}],
    'no-underscore-dangle': 0,
    'react/jsx-curly-brace-presence': 0, // TODO: Enable this once 2883 conversion done
    'react/jsx-filename-extension': 0,
    'react/no-unused-state': 0,
    'react/static-property-placement': 0,
    'security/detect-object-injection': 0,
    // These carried over from the plant-image-lambda project to accelerate
    // the linting
    // TODO: Remove these https://github.com/guyellis/plant/issues/3144
    "@typescript-eslint/explicit-function-return-type": [0],
    '@typescript-eslint/no-explicit-any': [0],
    '@typescript-eslint/ban-ts-ignore': [0],
    'import/prefer-default-export': [0],
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      // use <root>/tsconfig.json
      typescript: {
        // always try to resolve types under `<roo/>@types`
        // directory even it doesn't contain any source code,
        // like `@types/unist`
        "alwaysTryTypes": true
      },
    },
  },
}
