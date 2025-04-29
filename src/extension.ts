// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { customSelect, findSymbols } from './src/lib/file-select';
import { main } from './src/lib/node-modules-variant-identify.js';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "import-variant-file" is now active!');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('import-variant-file.helloWorld', async () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
			if (workspaceFolder) {
				vscode.window.showInformationMessage(`当前文档所在项目路径：${workspaceFolder.uri.fsPath}`);
				console.log(`当前文档所在项目路径：${workspaceFolder.uri.fsPath}`);

				// const searchTerm = await vscode.window.showInputBox({
				// 	prompt: '输入要搜索的符号名称'
				// });
				// if (searchTerm) {
				// 	findSymbols(searchTerm);
				// }
				vscode.window.showInformationMessage('开始查询当前项目的node_modules下的所有导出变量');
				await main(workspaceFolder.uri.fsPath).catch(err => { console.log(err) });


				// 获取当前的项目的不同配置，根据配置获取alias
				// 查询并维护一个表格来处理当前文件夹下的所有导出变量、文件、node_modules导出变量等
				// 调用插件来匹配变量名称以及文件名称，再选择导出的文件结合alias以及当前打开的文件来进行插入。
				// 这里可以使用vscode.workspace.fs来获取文件夹下的所有文件。
				// 通过tsx来解析import语句进行插入当前文件
				// vscode.workspace.fs.readDirectory(workspaceFolder.uri).then(files => {
				// 	files.forEach(file => {
				// 		console.log(file);
				// 	});
				// });
				// vscode.workspace.fs.readFile(workspaceFolder.uri).then(file => {
				// 	console.log(file);
				// });		
				// vscode.workspace.fs.stat(workspaceFolder.uri).then(file => {
				// 	console.log(file);
				// });
				// vscode.workspace.fs.createFile(workspaceFolder.uri).then(file => {
				// 	console.log(file);
				// });
				// vscode.workspace.fs.delete(workspaceFolder.uri).then(file => {
				// 	console.log(file);
				// });
				// vscode.workspace.fs.rename(workspaceFolder.uri).then(file => {
				// 	console.log(file);
				// });
				// vscode.workspace.fs.writeFile(workspaceFolder.uri).then(file => {
				// 	console.log(file);
				// });
				// vscode.workspace.fs.copy(workspaceFolder.uri).then(file => {
				// 	console.log(file);		
				// });
				// The code you place here will be executed every time your command is executed
				// Display a message box to the user
				vscode.window.showInformationMessage(`Hello World from ${editor} import-variant-file!`)
			} else {
				vscode.window.showInformationMessage('未能确定当前文档的工作区。');
			}
		} else {
			vscode.window.showInformationMessage('没有激活的编辑器。');
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

