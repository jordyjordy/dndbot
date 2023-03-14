import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

export default [
    {
        input: "src/index.ts",
        output: {
            file: 'index.js',
            format: "cjs",
            sourcemap: false,
        },
        watch: {
            buildDelay: 500,
        },
        plugins: [
            typescript({ tsconfig: "./rolluptsconfig.json" }),
            commonjs({
                ignoreGlobal: false,
                include: ['node_modules/**', '../../node_modules/**'],
            }),
            resolve({
                browser: true,
                jsnext: true,
                main: true,
                exportConditions: ['default', 'module', 'require', 'import'],
                ignoreGlobal: false,
                resolveOnly: [/.*/],
                modulePaths: ['./node_modules', '../../node_modules'],
                include: ['node_modules/**', '../../node_modules/**'],
            }),
            json(),
        ],
        external: ["react", "react-dom"]
    }
];