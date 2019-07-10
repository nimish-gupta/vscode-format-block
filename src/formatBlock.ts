import * as vscode from 'vscode';
type TInterfaceBlock = [vscode.Position, string];

interface IPosition {
	[key: number]: { start: number; end?: number };
}

const formatBlock = (document: vscode.TextDocument): TInterfaceBlock[] => {
	const positions: IPosition = {};
	const stack = [];
	const totalLines = document.lineCount;

	for (let i = 0; i < totalLines; i += 1) {
		const line = document.lineAt(i).text;

		if (line.indexOf('{') !== -1) {
			positions[i] = { start: i };
			stack.push(i);
		}

		if (line.indexOf('}') !== -1) {
			const lastIndex = stack.length - 1;
			const lastPosition = positions[stack[lastIndex]];
			const lastEntryAsOpenBracket =
				stack[lastIndex] !== undefined && lastPosition.end === undefined;

			if (lastEntryAsOpenBracket) {
				lastPosition.end = i;
				stack.pop();
			}
		}
	}

	const firstLine = document.lineAt(0);
	return [[firstLine.range.start, '42\n']];
};

export default formatBlock;
