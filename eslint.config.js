import config from '@tada5hi/eslint-config';

export default [
    ...config,
    {
        ignores: ['dist/**'],
    },
];
