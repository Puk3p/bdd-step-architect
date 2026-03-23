import { defineConfig } from '@vscode/test-cli';

const config = {
    files: 'out/test/**/*.test.js',
    launchArgs: ['--disable-extensions'],
};

if (!process.env.CI) {
    config.useInstallation = {
        fromPath: process.env.VSCODE_PATH || '/Applications/Visual Studio Code.app/Contents/MacOS/Electron',
    };
}

export default defineConfig(config);
