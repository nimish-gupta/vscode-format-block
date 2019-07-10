import * as vscode from 'vscode';
import formatBlock from './formatBlock';

const supportedLanguages = [
	'typescript',
	'javascript',
	'typescriptreact',
	'javascriptreact',
	'rust',
];

const getSelectors = (): vscode.DocumentSelector =>
	supportedLanguages.reduce<vscode.DocumentFilter[]>(
		(acc, language) => [
			...acc,
			{ language, scheme: 'file' },
			{ language, scheme: 'untitled' },
		],
		[]
	);

export async function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand(
		'extension.formatBlock',
		() => {
			const { activeTextEditor } = vscode.window;
			if (
				activeTextEditor &&
				supportedLanguages.indexOf(activeTextEditor.document.languageId) !== -1
			) {
				const { document } = activeTextEditor;
				const edit = new vscode.WorkspaceEdit();
				const formattedBlocks = formatBlock(document);
				formattedBlocks.forEach((block) => edit.insert(document.uri, ...block));

				return vscode.workspace.applyEdit(edit);
			}
		}
	);

	context.subscriptions.push(disposable);
	// vscode.languages.registerDocumentFormattingEditProvider(getSelectors(), {
	// 	provideDocumentFormattingEdits(document) {
	// 		const formattedBlocks = formatBlock(document);
	// 		return formattedBlocks.map((block) => vscode.TextEdit.insert(...block));
	// 	},
	// });
}

// this method is called when your extension is deactivated
export function deactivate() {}
