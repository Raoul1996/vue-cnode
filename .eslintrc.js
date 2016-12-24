module.exports = {
  root: true,
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module"
  },
  extends: "airbnb-base",
  // required to lint *.vue files
  plugins: [
    "html"
  ],
  // check if imports actually resolve
  settings: {
    "import/resolver": {
      "webpack": {
        "config": "build/webpack.base.conf.js"
      }
    }
  },
  env: {
    "browser": true,
    "node": true
  },
  // add your custom rules here
  rules: {
    // don"t require .vue extension when importing
    "import/extensions": ["error", "always", {
      "js": "never",
      "vue": "never"
    }],
    // allow debugger during development
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,

    "comma-dangle": ["error", {
      "arrays": "never",
      "objects": "never",
      "imports": "never",
      "exports": "never",
      "functions": "never",
    }],

    "padded-blocks": ["error", "never"],

    // http://eslint.cn/docs/rules/no-param-reassign
    "no-param-reassign": "off",

    // http://eslint.cn/docs/rules/no-unused-expressions
    "no-unused-expressions": ["error", { "allowShortCircuit": true, "allowTernary": false }],
    // http://eslint.cn/docs/rules/no-mixed-operators
    "no-mixed-operators": [
      "error",
      {
        "groups": [
          ["+", "-", "*", "/", "%", "**"],
          ["&", "|", "^", "~", "<<", ">>", ">>>"],
          ["==", "!=", "===", "!==", ">", ">=", "<", "<="],
          ["&&", "||"],
          ["in", "instanceof"]
        ],
        "allowSamePrecedence": true
      }
    ],
    // http://eslint.cn/docs/rules/no-plusplus
    "no-plusplus": "off",
    // http://eslint.cn/docs/rules/new-cap
    "new-cap": ["error", { "capIsNewExceptions": ["Message", "Snap"] }],

    // http://eslint.cn/docs/rules/quote-props
    "quote-props": "off"
  }
}
