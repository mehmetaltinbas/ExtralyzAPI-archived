import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        extends: ['js/recommended'],
        rules: {
            semi: ['error', 'always'],
            'no-unused-vars': 'off',
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                process: true,
            },
        },
    },
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: { globals: globals.browser },
    },
]);
