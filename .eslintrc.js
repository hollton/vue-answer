// http://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        phantomjs: true,
        mocha: true
    },
    // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
    extends: 'eslint:recommended', //'standard',//
    // required to lint *.vue files
    plugins: [
        'html'
    ],
    globals: {
        "__config": true,
        "ucManager": true,
        "JsMAF": true
    },
    // add your custom rules here
    'rules': {
        //不允许在一个作用域内多次定义同名属性。并且不允许给全局对象的内建属性赋值
        "no-redeclare": [2, {
            "builtinGlobals": true
        }],
        // 允许变量未初始化
        "no-undef": 1,
        "no-multiple-empty-lines": 1,
        // 不允声明undefined
        "no-undefined": 1,
        "eqeqeq": [1, "smart"],
        // 文件末尾可以没有空行
        "eol-last": 0,
        // 可以使用非驼峰
        "camelcase": 0,
        // 注释可以没有空格
        "spaced-comment": 0,
        "space-before-function-paren": 0,
        //不允许非必要的括号
        "no-extra-parens": [1, "all"],
        //必须都要有花括号
        "curly": [2, "all"],
        //建议去掉没用的bind()
        "no-extra-bind": 1,
        //不允许使用八进制数字
        "no-octal": 2,
        //不允许使用八进制的转义字符串（请用\u....）
        "no-octal-escape": 2,
        //避免八进制字符串转换问题，parseInt必须传第二个参数
        "radix": 2,
        //为避免二义性，变量名或函数名不要定义为 NaN、Infinity、undefined、eval
        "no-shadow-restricted-names": 1,
        //window风格的换行
        "linebreak-style": [0, "windows"],
        // 字符串用最外层用单引号
        "quotes": [1, "single"],
        // 必须要加分号,一个块中的最后一个分号可不加
        "semi": [1, "always", { "omitLastInOneLineBlock": true }],
        "no-extra-semi": 2,
        "no-console": process.env.NODE_ENV === 'production' ? 2 : 0,
        "no-unused-vars": 1,
        //缩进用4个空格, case缩进
        "indent": [1, 4, { "SwitchCase": 1 }],
        // allow paren-less arrow functions
        'arrow-parens': 0,
        // allow async-await
        'generator-star-spacing': 0,
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
    }
}