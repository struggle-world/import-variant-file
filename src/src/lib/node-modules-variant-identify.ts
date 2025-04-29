import { promises } from 'node:fs';
import path from 'path';
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";

// 设置 __dirname 文件路径
// const _filename = __filename || process.argv[1];
// const __dirname = path.dirname(_filename);

export async function findExports(packagePath: any) {
    try {
        const packageJsonPath = path.join(packagePath, 'package.json');
        const packageJsonContent = await promises.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonContent);

        let entryFile: any = {};
        if (packageJson.exports) {
            if (typeof packageJson.exports === 'string') {
                entryFile = packageJson.exports;
            } else if (packageJson.exports['.']) {
                entryFile = packageJson.exports['.'];
                if (typeof entryFile !== 'string') {
                    entryFile = entryFile.import || entryFile.require || entryFile.default;
                }
            } else {
                entryFile = Object.values(packageJson.exports);
                if (typeof entryFile !== 'string') {
                    entryFile = entryFile.import || entryFile.require || entryFile.default;
                }
            }
        } else {
            entryFile = packageJson.main || 'index.js';
        }

        if (!entryFile) {
            return;
        }

        const entryFilePath = path.resolve(packagePath, entryFile);
        const entryFileContent = await promises.readFile(entryFilePath, 'utf8');

        const ast = parser.parse(entryFileContent, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
        });

        const exportedVariables: any[] = [];

        traverse(ast, {
            ExportNamedDeclaration(path: { node: { declaration: { type: string; declarations: any[]; id: { name: any; }; }; specifiers: any[]; }; }) {
                if (path.node.declaration) {
                    if (path.node.declaration.type === 'VariableDeclaration') {
                        path.node.declaration.declarations.forEach((declarator: { id: { name: any; }; }) => {
                            exportedVariables.push(declarator.id.name);
                        });
                    } else if (path.node.declaration.type === 'FunctionDeclaration' || path.node.declaration.type === 'ClassDeclaration') {
                        exportedVariables.push(path.node.declaration.id.name);
                    }
                } else if (path.node.specifiers) {
                    path.node.specifiers.forEach((specifier: { exported: { name: any; }; }) => {
                        exportedVariables.push(specifier.exported.name);
                    });
                }
            },
            ExportDefaultDeclaration(path: { node: { declaration: { id: { name: string; }; }; }; }) {
                if (path.node.declaration.id && path.node.declaration.id.name) {
                    exportedVariables.push('default: ' + path.node.declaration.id.name);
                } else {
                    exportedVariables.push('default');
                }
            },
            AssignmentExpression(path: { node: { left: { type: string; object: { type: string; name: string; }; property: { type: string; name: string; }; }; right: { type: string; properties: any[]; }; }; }) {
                if (path.node.left.type === 'MemberExpression' &&
                    path.node.left.object.type === 'Identifier' &&
                    path.node.left.object.name === 'module' &&
                    path.node.left.property.type === 'Identifier' &&
                    path.node.left.property.name === 'exports') {
                    if (path.node.right.type === 'ObjectExpression') {
                        path.node.right.properties.forEach((property: { key: { name: any; }; }) => {
                            exportedVariables.push(property.key.name);
                        });
                    } else {
                        exportedVariables.push('module.exports');
                    }
                } else if (path.node.left.type === 'MemberExpression' &&
                    path.node.left.object.type === 'Identifier' &&
                    path.node.left.object.name === 'exports' &&
                    path.node.left.property.type === 'Identifier') {
                    exportedVariables.push(path.node.left.property.name);
                }
            },
        });

        return exportedVariables;

    } catch (error: any) {
        console.error(`Error processing ${packagePath}: ${error?.message}`);
        return;
    }
}
