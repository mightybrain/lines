// Отрисовка игрового поля
let canvas = document.getElementById('lines');
let context = canvas.getContext('2d');


//--------------------------------------------------------


// Конфигурация
const config = {
	outerOffsetY: 136,
	outerOffsetX: 60,
	innerOffset: 10,
	cellSize: 56,
	cellInnerOffset: 7,
	fieldSize: 9,
	delimiterSize: 4,
	spawnBallAtTime: 3,
	minSequenceLength: 5,
	ballSpeed: 0.2,
	scorePerBall: 1,
	ballGradientOffset: 14,
}


//--------------------------------------------------------


// Игровое поле
let field = buildField();

function buildField() {
	let field = [];
	for (let i = 0; i < config.fieldSize; i++) {
		let row = [];
		for (let j = 0; j < config.fieldSize; j++) {
			row.push('-');
		}
		field.push(row);
	}
	return field;
}

function getFreePositions() {
	let freePositions = [];
	field.forEach((row, y) => {
		row.forEach((position, x) => {
			if (position !== '-') {
				return;
			}
			freePositions.push({ x, y });
		})
	})
	return freePositions;
}

//--------------------------------------------------------


// Счет
let score = 0;

function increaseScore(ballsCounter) {
	score += ballsCounter * config.scorePerBall;
}


//--------------------------------------------------------


// Шары
const balls = {
	bl: ['#E5E8FF', '#5163FF', '#2A359C'],
	br: ['#FFEBE5', '#F29048', '#8E441B'],
	gr: ['#E5FFE9', '#51CE46', '#197E2F'],
	pnk: ['#FFE5FC', '#EC39FC', '#B2229B'],
	rd: ['#FFCAB9', '#E74724', '#991F1F'],
	sea: ['#E5FFF9', '#51E0FF', '#2391B4'],
	yel: ['#FFF9E5', '#FCDD39', '#B1881E'],
}

const ballsKeys = Object.keys(balls);

class ActiveBall {
	constructor(key, colors, position) {
		this.key = key;
		this.colors = colors;
		this.position = position;
		this.path = null;
	}
}

let activeBall = null;


//--------------------------------------------------------


// Игровой цикл
function startGame() {
	spawnBalls();
	gameLoop();
}

function gameLoop() {
	updateGame();
	drawGame();
	requestAnimationFrame(gameLoop);
}


//--------------------------------------------------------


// Обновление игрового поля
function updateGame() {
	if (activeBall !== null && activeBall.path !== null) {
		updateActiveBallPosition();
	}
}


function updateActiveBallPosition() {
	let targetPosition = activeBall.path[0];
	const direction = {
		x: (targetPosition.x - activeBall.position.x).toFixed(1),
		y: (targetPosition.y - activeBall.position.y).toFixed(1)
	}
	for (let axis in direction) {
		if (Math.abs(direction[axis]) <= config.ballSpeed) {
			activeBall.position[axis] = targetPosition[axis];
		} else {
			activeBall.position[axis] += direction[axis] * config.ballSpeed;
		}	
	}

	if (positionsAreEqual(activeBall.position, targetPosition)) {
		activeBall.path = activeBall.path.slice(1);
	}
	if (activeBall.path.length === 0) {
		markPosition(activeBall.position, activeBall.key);
		const clearedSequence = clearSequences([activeBall.position]);
		activeBall.path = null;
		activeBall = null;
		if (clearedSequence.length === 0) {
			spawnBalls();
		}
	}
}

//--------------------------------------------------------


function drawGame() {
	drawField();
	drawBalls();
	if (activeBall !== null) {
		drawActiveBall();
	}
	drawPreparedBalls();
	drawScore();
}

function drawField() {
	context.fillStyle = '#4DAF34';
	context.fillRect(0, 0, 676, 752);

	const fieldSize = config.cellSize * config.fieldSize + (config.fieldSize - 1) * config.delimiterSize + config.innerOffset * 2;
	context.fillStyle = '#1D3753';
	drawRoundedRect(context, config.outerOffsetX, config.outerOffsetY, fieldSize, fieldSize, 25);

	context.fillStyle = '#203E60';
	field.forEach((row, rowIndex) => {
		row.forEach((cell, cellIndex) => {
			const x = config.outerOffsetX + config.innerOffset + cellIndex * config.cellSize + cellIndex * config.delimiterSize;
			const y = config.outerOffsetY + config.innerOffset + rowIndex * config.cellSize + rowIndex * config.delimiterSize;
			drawRoundedRect(context, x, y, config.cellSize, config.cellSize, 20);
		})
	})

	if (activeBall) {
		context.fillStyle = '#335070';
		const x = config.outerOffsetX + config.innerOffset + activeBall.position.x * config.cellSize + activeBall.position.x * config.delimiterSize;
		const y = config.outerOffsetY + config.innerOffset + activeBall.position.y * config.cellSize + activeBall.position.y * config.delimiterSize;
		drawRoundedRect(context, x, y, config.cellSize, config.cellSize, 20);
	}
}

function drawBalls() {
	field.forEach((row, y) => {
		row.forEach((positionKey, x) => {
			if (positionKey === '-' || positionKey === 'x' || positionKey === 'a') {
				return;
			}
			drawBall(balls[positionKey], { x, y });
		})
	})
}

function drawActiveBall() {
	drawBall(activeBall.colors, activeBall.position);
}

function drawBall(colors, position) {
	const x = config.outerOffsetX + config.innerOffset + position.x * config.cellSize + position.x * config.delimiterSize + config.cellInnerOffset;
	const y = config.outerOffsetY + config.innerOffset + position.y * config.cellSize + position.y * config.delimiterSize + config.cellInnerOffset;

	let gradient = context.createRadialGradient(x + config.ballGradientOffset, y + config.ballGradientOffset, 0, x + config.ballGradientOffset, y + config.ballGradientOffset, 30)
	gradient.addColorStop(0, colors[0]);
	gradient.addColorStop(.5, colors[1]);
	gradient.addColorStop(1, colors[2]);
	context.fillStyle = gradient;
	drawRoundedRect(context, x, y, 42, 42, 21);
}

function drawPreparedBalls() {
	nextPreparedColors.forEach((key, index) => {
		let x = config.outerOffsetX + config.innerOffset + index * config.cellSize + index * config.delimiterSize;
		let y = 40;

		context.fillStyle = '#5DBB46';
		drawRoundedRect(context, x, y, 56, 56, 20);

		x += config.cellInnerOffset;
		y += config.cellInnerOffset;

		const colors = balls[key];
		let gradient = context.createRadialGradient(x + config.ballGradientOffset, y + config.ballGradientOffset, 0, x + config.ballGradientOffset, y + config.ballGradientOffset, 30)
		gradient.addColorStop(0, colors[0]);
		gradient.addColorStop(.5, colors[1]);
		gradient.addColorStop(1, colors[2]);
		context.fillStyle = gradient;
		drawRoundedRect(context, x, y, 42, 42, 21);
	})
}

function drawScore() {
	context.font = '52px LuckiestGuy';
	let text = context.measureText(score);
	context.fillStyle = 'white';
	context.fillText(score, 676 - config.outerOffsetX - config.innerOffset - text.width, 87);
}


//--------------------------------------------------------


// Добавление шаров на поле
nextPreparedColors = [];

function prepareBallColors() {
	let ballColors = [];

	do {
		ballColors.push(ballsKeys[getRandomFromRange(0, ballsKeys.length)]);
	} while (ballColors.length < config.spawnBallAtTime)

	return ballColors;
}

function prepareBalls() {
	const freePositions = getFreePositions();
	if (freePositions.length === 0) {
		return;
	}

	let preparedBalls = [];
	do {
		const key = nextPreparedColors.length ? nextPreparedColors.shift() : ballsKeys[getRandomFromRange(0, ballsKeys.length)];
		const position = freePositions[getRandomFromRange(0, freePositions.length)];
		preparedBalls.push({ key, position });
		markPosition(position, 'x');
	} while (preparedBalls.length < config.spawnBallAtTime)
	return preparedBalls;
}

function spawnBalls() {
	const ballsToSpawn = prepareBalls();
	nextPreparedColors = prepareBallColors();
	ballsToSpawn.forEach((ball) => {
		markPosition(ball.position, ball.key);
	})
	clearSequences(ballsToSpawn.map((ball) => {
		return ball.position;
	}))
}


//--------------------------------------------------------


function clearSequences(positions) {
	let sequences = findSequences(positions);
	sequences.forEach((position) => {
		markPosition(position, '-');
	})
	increaseScore(sequences.length);
	return sequences;
}

function findSequences(positions) {
	let sequences = [];
	const axes = ['x', 'y'];

	positions.forEach((position) => {
		axes.forEach((axis) => {

			const sequence = findSequenceFromPosition(position, axis);
			if (sequence.length < config.minSequenceLength) {
				return;
			}
			sequence.forEach((position) => {
				if (!arrIncludesPosition(sequences, position)) {
					sequences.push(position);
				}
			})
		})
	})
	return sequences;
}

function findSequenceFromPosition(position, axis) {
	const directions = [
		{
			axis: 'y',
			offset: { x: 0, y: -1 }
		},
		{
			axis: 'x',
			offset: { x: 1, y: 0 }
		},
		{
			axis: 'y',
			offset: { x: 0, y: 1 }
		},
		{
			axis: 'x',
			offset: { x:-1, y: 0 }
		}
	];

	let sequence = [position];
	const sequenceKey = field[position.y][position.x];
	let queue = [position];
	const axisDirections = directions.filter(direction => direction.axis === axis);
	do {
		const position = queue.shift();
		axisDirections.forEach((direction) => {
			const nextPosition = { x: position.x + direction.offset.x, y: position.y + direction.offset.y };
			if (!positionExist(nextPosition) || arrIncludesPosition(sequence, nextPosition) || field[nextPosition.y][nextPosition.x] !== sequenceKey) {
				return;
			}
			sequence.push(nextPosition);
			queue.push(nextPosition);
		})		

	} while (queue.length > 0)

	return sequence;
}


//--------------------------------------------------------


// Поиск пути
function findPath(from, to) {
	const directions = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x:-1, y: 0 }];
	
	let path = null;
	let steps = [{ position: from, path: []}];
	let viewedPositions = [from];
	
	do {
		const step = steps.shift();
		if (positionsAreEqual(step.position, to)) {
			path = step.path;
		} else {
			directions.forEach((direction) => {
				const newPosition = { x: step.position.x + direction.x, y: step.position.y + direction.y };
				if (positionIsAvailable(newPosition) && !arrIncludesPosition(viewedPositions, newPosition)) {
					viewedPositions.push(newPosition);
					const pathToPosition = step.path.map(step => step);
					pathToPosition.push(newPosition);
					steps.push({ position: newPosition, path: pathToPosition });
				}
			})
		}
	} while (steps.length > 0 && path === null)
	return path;
}


//--------------------------------------------------------


// Обработка кликов
canvas.addEventListener('click', handleClick);

function handleClick(event) {
	const borderTop = config.outerOffsetY + config.innerOffset;
	const borderRight = config.outerOffsetX + config.innerOffset + config.cellSize * config.fieldSize + config.delimiterSize * (config.fieldSize - 1);
	const borderBottom = config.outerOffsetY + config.innerOffset + config.cellSize * config.fieldSize + config.delimiterSize * (config.fieldSize - 1);
	const borderLeft = config.outerOffsetX + config.innerOffset;
	if (event.offsetX < borderLeft || event.offsetX > borderRight || event.offsetY < borderTop || event.offsetY > borderBottom) {
		return;
	}
	const x = Math.floor((event.offsetX - config.outerOffsetX - config.innerOffset) / (config.cellSize + config.delimiterSize));
	const y = Math.floor((event.offsetY - config.outerOffsetY - config.innerOffset) / (config.cellSize + config.delimiterSize));
	const position = { x, y };

	if (!positionIsAvailable(position)) {
		if (activeBall !== null) {
			markPosition(activeBall.position, activeBall.key);
		}
		const ballKey = field[position.y][position.x];
		markPosition(position, '-');
		activeBall = new ActiveBall(ballKey, balls[ballKey], position);
	} else if (positionIsAvailable(position) && activeBall !== null && !positionsAreEqual(position, activeBall.position)) {
		const path = findPath(activeBall.position, position);
		if (path !== null) {
			activeBall.path = path;
		}
	}
}


//--------------------------------------------------------


// Вспомогательные функции
function getRandomFromRange(from, to) {
	if (from === to) {
		return from;
	}
	return from + Math.floor(Math.random() * (to - from));
}

function markPosition(cell, key) {
	field[cell.y][cell.x] = key;
}

function positionIsAvailable(cell) {
	return positionExist(cell) && field[cell.y][cell.x] === '-';
}

function positionExist(cell) {
	return cell.x >= 0 && cell.x < config.fieldSize && cell.y >= 0 && cell.y < config.fieldSize;
}

function arrIncludesPosition(path, cell) {
	return typeof path.find(position => position.x === cell.x && position.y === cell.y) !== 'undefined';
}

function positionsAreEqual(a, b) {
	return a.x === b.x && a.y === b.y;
}


//--------------------------------------------------------


// Вспомогательные функции для рисования
function drawRoundedRect(ctx, x, y, width, height, radius) {
	ctx.beginPath();
	ctx.moveTo(x, y + radius);
	ctx.arcTo(x, y + height, x + radius, y + height, radius);
	ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
	ctx.arcTo(x + width, y, x + width - radius, y, radius);
	ctx.arcTo(x, y, x, y + radius, radius);
	ctx.fill();
}


//--------------------------------------------------------


// Старт игры
startGame();