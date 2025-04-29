import * as vscode from 'vscode';

const getSelectParams = (filePath: string) => {
    // 
}

// 获取alias
// 

// 自定义下拉选项
export function customSelect() {
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = [
        { label: '选项 1', description: '文件：' },
        { label: '选项 2', description: '模块：' }
    ];
    quickPick.onDidChangeSelection(selection => {
        if (selection[0]) {
            vscode.window.showInformationMessage(`你选择了: ${selection[0].label}`);
            quickPick.hide();
        }
    });
    quickPick.show();
}
// 快速下拉框
export async function quickSelect() {
    const languages = ['JavaScript         window.dddd.ppp', 'TypeScript', 'Rust'];
    const lang = await vscode.window.showQuickPick(languages, { placeHolder: '请选择语言' });
    if (!lang) { return; }
    if (lang) {
        vscode.window.showInformationMessage(`选择了 ${lang}`);
    }
}

export async function findSymbols(query: string) {
    // 执行工作区符号搜索命令
    const symbols: vscode.SymbolInformation[] = await vscode.commands.executeCommand(
        'vscode.executeWorkspaceSymbolProvider',
        query
    );

    if (symbols.length > 0) {
        console.log(`找到与 "${query}" 相关的符号:`);
        symbols.forEach(symbol => {
            console.log(`  名称: ${symbol.name}, 种类: ${vscode.SymbolKind[symbol.kind]}, 容器: ${symbol.containerName || '无'}, 位置: ${symbol.location.uri.fsPath}:${symbol.location.range.start.line + 1}`);
            // 你可以通过 symbol.location 跳转到符号定义的位置
            // 例如：vscode.window.showTextDocument(symbol.location.uri, { selection: symbol.location.range });
        });

        // 示例：跳转到第一个匹配的符号位置
        // if (symbols.length > 0) {
        //     const firstSymbol = symbols[0];
        //     vscode.window.showTextDocument(firstSymbol.location.uri, { selection: firstSymbol.location.range });
        // }

    } else {
        console.log(`未找到与 "${query}" 相关的符号。`);
    }
}