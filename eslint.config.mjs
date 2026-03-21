import typescriptEslint from 'typescript-eslint';

export default [
    {
        files: ['**/*.ts'],
    },
    {
        plugins: {
            '@typescript-eslint': typescriptEslint.plugin,
        },

        languageOptions: {
            parser: typescriptEslint.parser,
            ecmaVersion: 2022,
            sourceType: 'module',
        },

        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'import',
                    format: ['camelCase', 'PascalCase'],
                },
            ],

            curly: 'error',
            eqeqeq: 'error',
            'no-throw-literal': 'error',
            semi: 'error',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-console': ['error', { allow: ['log', 'warn', 'error'] }],
            'no-debugger': 'error',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'prefer-const': 'error',
            'no-var': 'error',
            'no-duplicate-imports': 'error',
        },
    },
];
