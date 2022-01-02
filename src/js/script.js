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


// Стор
let store = {
	score: 0,
	activeBall: null,
	nextPreparedColors: []
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
function increaseScore(ballsCounter) {
	store.score += ballsCounter * config.scorePerBall;
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

function deselectBall() {
	const deselectedBall = Object.assign({}, store.activeBall);
	markPosition(store.activeBall.position, store.activeBall.key);
	store.activeBall = null;
	return deselectedBall;
}

function selectBall(position) {
	const key = field[position.y][position.x];
	store.activeBall = new ActiveBall(key, balls[key], position);
	markPosition(position, '-');
}


//--------------------------------------------------------


// Игровой цикл
function startGame() {
	spawnBalls();
	requestAnimationFrame(gameLoop);
}

function gameLoop() {
	updateGame();
	drawGame();
	requestAnimationFrame(gameLoop);
}


//--------------------------------------------------------


// Обновление игрового поля
function updateGame() {
	updateActiveBallPosition();
}

function updateActiveBallPosition() {
	if (!store.activeBall || !store.activeBall.path) {
		return;
	}
	let targetPosition = store.activeBall.path[0];
	const direction = {
		x: (targetPosition.x - store.activeBall.position.x).toFixed(1),
		y: (targetPosition.y - store.activeBall.position.y).toFixed(1)
	}
	for (let axis in direction) {
		if (Math.abs(direction[axis]) <= config.ballSpeed) {
			store.activeBall.position[axis] = targetPosition[axis];
		} else {
			store.activeBall.position[axis] += direction[axis] * config.ballSpeed;
		}	
	}
	if (positionsAreEqual(store.activeBall.position, targetPosition)) {
		store.activeBall.path = store.activeBall.path.slice(1);
	}

	if (store.activeBall.path.length > 0) {
		return;
	}
	const deselectedBall = deselectBall();
	const clearedSequence = clearSequences([deselectedBall.position]);
	if (clearedSequence.length === 0) {
		spawnBalls();
	}
}

//--------------------------------------------------------


function drawGame() {
	drawField();
	drawBalls();
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

	if (store.activeBall && !store.activeBall.path) {
		context.fillStyle = '#335070';
		const x = config.outerOffsetX + config.innerOffset + store.activeBall.position.x * config.cellSize + store.activeBall.position.x * config.delimiterSize;
		const y = config.outerOffsetY + config.innerOffset + store.activeBall.position.y * config.cellSize + store.activeBall.position.y * config.delimiterSize;
		drawRoundedRect(context, x, y, config.cellSize, config.cellSize, 20);
	}
}

function drawBalls() {
	field.forEach((row, y) => {
		row.forEach((key, x) => {
			if (key === '-' || key === 'x' || key === 'a') {
				return;
			}
			const position = {
				x: config.outerOffsetX + config.innerOffset + x * config.cellSize + x * config.delimiterSize + config.cellInnerOffset,
				y: config.outerOffsetY + config.innerOffset + y * config.cellSize + y * config.delimiterSize + config.cellInnerOffset,
			}
			drawBall(balls[key], position);
		})
	})

	if (store.activeBall) {
		const position = {
			x: config.outerOffsetX + config.innerOffset + store.activeBall.position.x * config.cellSize + store.activeBall.position.x * config.delimiterSize + config.cellInnerOffset,
			y: config.outerOffsetY + config.innerOffset + store.activeBall.position.y * config.cellSize + store.activeBall.position.y * config.delimiterSize + config.cellInnerOffset,
		}
		drawBall(store.activeBall.colors, position);
	}
}

function drawPreparedBalls() {
	store.nextPreparedColors.forEach((key, index) => {
		let x = config.outerOffsetX + config.innerOffset + index * config.cellSize + index * config.delimiterSize;
		let y = 40;

		context.fillStyle = '#5DBB46';
		drawRoundedRect(context, x, y, 56, 56, 20);

		x += config.cellInnerOffset;
		y += config.cellInnerOffset;

		const colors = balls[key];
		drawBall(colors, { x, y })
	})
}

function drawBall(colors, position) {
	const { x, y } = position;

	let gradient = context.createRadialGradient(x + config.ballGradientOffset, y + config.ballGradientOffset, 0, x + config.ballGradientOffset, y + config.ballGradientOffset, 30)
	gradient.addColorStop(0, colors[0]);
	gradient.addColorStop(.5, colors[1]);
	gradient.addColorStop(1, colors[2]);
	context.fillStyle = gradient;
	drawRoundedRect(context, x, y, 42, 42, 21);
}

function drawScore() {
	context.font = '52px LuckiestGuy';
	let text = context.measureText(store.score);
	context.fillStyle = 'white';
	context.fillText(store.score, 676 - config.outerOffsetX - config.innerOffset - text.width, 87);
}


//--------------------------------------------------------


// Добавление шаров на поле
function prepareBallColors() {
	let ballColors = [];

	do {
		ballColors.push(ballsKeys[getRandomFromRange(0, ballsKeys.length)]);
	} while (ballColors.length < config.spawnBallAtTime)

	return ballColors;
}

function prepareBalls() {
	let freePositions = getFreePositions();
	let preparedBalls = [];
	const preparedBallsCounter = freePositions.length < config.spawnBallAtTime ? freePositions.length : config.spawnBallAtTime; 

	if (preparedBallsCounter) {
		do {
			const key = store.nextPreparedColors.length ? store.nextPreparedColors.shift() : ballsKeys[getRandomFromRange(0, ballsKeys.length)];
			const position = freePositions[getRandomFromRange(0, freePositions.length)];
			preparedBalls.push({ key, position });
			freePositions = freePositions.filter(freePosition => !positionsAreEqual(freePosition, position))
		} while (preparedBalls.length < preparedBallsCounter)
	}

	return preparedBalls;
}

function spawnBalls() {
	const ballsToSpawn = prepareBalls();
	ballsToSpawn.forEach((ball) => {
		markPosition(ball.position, ball.key);
	})
	clearSequences(ballsToSpawn.map(ball => ball.position))
	store.nextPreparedColors = prepareBallColors();
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

	if (positionIsAvailable(position) && store.activeBall) {
		store.activeBall.path = findPath(store.activeBall.position, position);
	} else if (!positionIsAvailable(position) && store.activeBall) {
		deselectBall();
		selectBall(position);
	} else if (!positionIsAvailable(position)) {
		selectBall(position);
	}
}


//--------------------------------------------------------


// Вспомогательные функции
function getRandomFromRange(from, to) {
	return from === to ? from : from + Math.floor(Math.random() * (to - from));
}

function markPosition(position, key) {
	field[position.y][position.x] = key;
}

function positionIsAvailable(position) {
	return positionExist(position) && field[position.y][position.x] === '-' && (!store.activeBall|| !positionsAreEqual(position, store.activeBall.position));
}

function positionExist(position) {
	return position.x >= 0 && position.x < config.fieldSize && position.y >= 0 && position.y < config.fieldSize;
}

function arrIncludesPosition(path, position) {
	return typeof path.find(pathPart => pathPart.x === position.x && pathPart.y === position.y) !== 'undefined';
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