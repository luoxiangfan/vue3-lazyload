import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ignores: [
      '/dist/**/*',
      "node_modules/*",
      "/lib/*",
      "/es/*",
      "/_site/*",
      "/example/*",
      "**/*.spec.*",
      "**/style/",
      "*.html",
      "shims-vue.d.ts",
      "/components/test/*"
    ],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest'
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2017
      }
    }
  },
  js.configs.recommended
]
