import * as vscode from 'vscode';
type TInterfaceBlock = [vscode.Position, string];

interface IPos {
	start: number;
	end?: number;
}

interface IPosition {
	[key: number]: IPos;
}

const getPosition = (document: vscode.TextDocument): [IPos[], IPos[]] => {
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

	const array = Object.keys(positions)
		.map((pos) => positions[parseInt(pos, 10)])
		.filter((pos) => pos.end !== undefined);

	return [
		array
			.map((pos) => Object.assign({}, pos))
			.sort((a, b) => (a.start <= b.start ? -1 : 1)),
		array
			.map((pos) => Object.assign({}, pos))
			.sort((a, b) => (a.end! <= b.end! ? -1 : 1)),
	];
};

const formatBlock = (document: vscode.TextDocument): TInterfaceBlock[] => {
	const [startSortPositions, endSortPositions] = getPosition(document);

	const startInsertions = startSortPositions.reduce<TInterfaceBlock[]>(
		(acc, pos, index) => {
			const data: TInterfaceBlock[] = [];
			const prevPosition = startSortPositions[index - 1];
			const prevOpenBrace =
				pos.start === 0 ||
				(prevPosition !== undefined && pos.start - prevPosition.start < 2);

			if (!prevOpenBrace) {
				const line = document.lineAt(pos.start - 1);

				if (line.text !== '') {
					data.push([line.range.end, '\n']);
				}
			}

			return acc.concat(data);
		},
		[]
	);

	const endInsertions = endSortPositions.reduce<TInterfaceBlock[]>(
		(acc, pos, index) => {
			const data: TInterfaceBlock[] = [];
			const nextPosition = endSortPositions[index + 1];

			const nextCloseBrace =
				pos.end === document.lineCount - 1 ||
				(nextPosition !== undefined && nextPosition.end! - pos.end! < 2);

			if (!nextCloseBrace) {
				const line = document.lineAt(pos.end! + 1);

				if (line.text !== '') {
					data.push([line.range.start, '\n']);
				}
			}

			return acc.concat(data);
		},
		[]
	);

	return [...startInsertions, ...endInsertions];
};

export default formatBlock;
