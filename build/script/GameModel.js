class GameModel {
	constructor(ctx, gameWidth, gameHeight) {
		this._ctx = ctx;
		this._gameWidth = gameWidth;
		this._gameHeight = gameHeight;
		this._fieldLength = 9;
		this._spawnBallAtTime = 3;
		this._ballsSpawnSpeed = 150;
		this._ballDestroySpeed = 150;
		this._ballMoveSpeed = 75;
		this._scorePerBall = 1;
		this._minSequenceLength = 5;

		this._field = null;
		this._setField();
		this._setFieldSize();
		this._ballSize = this._field.cellSize * 0.75;
		this._ballsKeys = Object.keys(GameModel.BALLS);
		this._selectedBall = null;
		this._score = {
			value: 0,
			toAdd: 0,
			lastUpdateTime: 0
		};
		this._setScoreSize();

		this._animations = [];

		this._preparedBalls = {
			balls: []
		};
		this._setPreparedBallsSize();
		this._prepareBalls();
		this._newSpawnedBalls = [];
		this._spawnBalls();
	}

	getField() {
		return this._field;
	}

	getScore() {
		return this._score;
	}

	getPreparedBalls() {
		return this._preparedBalls;
	}

	getSelectedBall() {
		return this._selectedBall;
	}

	getRenderableAnimations() {
		return this._animations.filter(animation => animation.getRenderable());
	}

	setSize(gameWidth, gameHeight) {
		this._gameWidth = gameWidth;
		this._gameHeight = gameHeight;
		this._setFieldSize();
		this._setBallsSize();
		this._setPreparedBallsSize();
		this._setScoreSize();
	}

	update(timestamp) {
		this._updateAnimations(timestamp);
		this._updateScore(timestamp);
	}

	_updateAnimations(timestamp) {
		if (!this._animations.length) return;
		
		this._animations.forEach(animation => {
			if (!animation.getRunning()) {
				animation.start(timestamp);
			} else {
				animation.update(timestamp);
			}
			if (animation.getEnded()) animation.onEnd && animation.onEnd();
		})

		this._animations = this._animations.filter(animation => !animation.getEnded());
	}

	_updateScore(timestamp) {
		if (!this._score.toAdd) {
			this._score.lastUpdateTime = timestamp;
		} else {
			const progress = Math.floor((timestamp - this._score.lastUpdateTime) / 100);
			if (!progress) return;
			const scoreToAdd = Math.min(progress, this._score.toAdd);
			this._score.value += scoreToAdd;
			this._score.toAdd -= scoreToAdd;
			this._score.lastUpdateTime = timestamp;
			this._setScoreSize();
		}
	}

	_setField() {
		this._field = {
			map: [],
		}
		for (let y = 0; y < this._fieldLength; y++) {
			const row = [];
			for (let x = 0; x < this._fieldLength; x++) {
				row.push({
					coords: { x, y },
				});
			}
			this._field.map.push(row);
		}
	}

	_setFieldSize() {
		const field = this._field;

		field.size = this._gameWidth * 0.9 + this._gameHeight * 0.2 > this._gameHeight ? this._gameHeight * 0.8 : this._gameWidth * 0.9;
		field.position = {
			x: this._gameWidth / 2 - field.size / 2,
			y: this._gameHeight / 2 - field.size / 2,
		};
		field.innerOffset = field.size * 0.02;
		field.cellsDelimiter = field.size * 0.007;
		field.cellSize = (field.size - field.innerOffset * 2 - field.cellsDelimiter * (this._fieldLength - 1)) / this._fieldLength;

		const { map, position, innerOffset, cellSize, cellsDelimiter } = field;
		map.forEach((row, rowIndex) => {
			row.forEach((cell, cellIndex) => {
				cell.position = {
					x: position.x + innerOffset + ((cellSize + cellsDelimiter) * cellIndex),
					y: position.y + innerOffset + ((cellSize + cellsDelimiter) * rowIndex),
				}
			})
		})
	}

	_setBallsSize() {
		const field = this._field;

		this._ballSize = field.cellSize * 0.75;
		field.map.forEach(row => {
			row.forEach(cell => {
				const { ball } = cell;
				if (!ball) return;
				ball.size = this._ballSize;
				ball.position = this._calcBallPosition(ball);
			})
		})
		if (this._selectedBall) {
			this._selectedBall.size = this._ballSize;
			this._selectedBall.position = this._calcBallPosition(this._selectedBall);
		}
	}

	_getFreeCells() {
		return this._field.map.flat().filter(cell => !cell.ball);
	}

	_setScoreSize() {
		const score = this._score;

		score.areaHeight = this._field.cellSize;

		score.valueSize = score.areaHeight * 0.68;
		this._ctx.font = `${score.valueSize}px LuckiestGuy`;
		const scoreText = this._ctx.measureText(score.value);

		score.icon = new Image();
		score.icon.src = 'images/coin.png';
		score.iconSize = score.areaHeight * 0.77;
		
		score.areaWidth = scoreText.width + score.areaHeight * 0.49 + score.iconSize;
		score.areaPosition = {
			x: this._gameWidth - score.areaWidth - score.areaHeight * 0.39,
			y: score.areaHeight * 0.39
		}

		score.valuePosition = {
			x: score.areaPosition.x + score.areaHeight * 0.18,
			y: score.areaPosition.y + score.areaHeight * 0.75,
		}

		score.iconPosition = {
			x: score.areaPosition.x + score.areaWidth - score.areaHeight * 0.12 - score.iconSize,
			y: score.areaPosition.y + score.areaHeight * 0.12,
		}
	}

	_setPreparedBallsSize() {
		const preparedBalls = this._preparedBalls;
		const ballSize = this._ballSize;

		preparedBalls.areaHeight = this._field.cellSize;
		preparedBalls.areaWidth = preparedBalls.areaHeight * 0.12 + this._spawnBallAtTime * (preparedBalls.areaHeight * 0.12 + ballSize);
		preparedBalls.areaPosition = {
			x: preparedBalls.areaHeight * 0.39,
			y: preparedBalls.areaHeight * 0.39
		}
		preparedBalls.balls.forEach((ball, index) => {
			ball.size = ballSize;
			ball.position = {
				x: preparedBalls.areaPosition.x + preparedBalls.areaHeight * 0.12 + (preparedBalls.areaHeight * 0.12 + ballSize) * index,
				y: preparedBalls.areaPosition.y + preparedBalls.areaHeight / 2 - ballSize / 2,
			};
		})
	}

	_prepareBalls() {
		const preparedBalls = this._preparedBalls;
		const ballSize = this._ballSize;

		for(let i = 0; i < this._spawnBallAtTime; i++) {
			const key = this._ballsKeys[this._getRandomFromRange(0, this._ballsKeys.length)];
			const colors = GameModel.BALLS[key];
			const size = ballSize;
			const scaleFactor = 0;
			const coords = null;
			const position = {
				x: preparedBalls.areaPosition.x + preparedBalls.areaHeight * 0.12 + (preparedBalls.areaHeight * 0.12 + ballSize) * i + ballSize / 2 - size * scaleFactor / 2,
				y: preparedBalls.areaPosition.y + preparedBalls.areaHeight / 2 - size * scaleFactor / 2 ,
			};
			const ball = { key, colors, size, scaleFactor, position, coords };
			preparedBalls.balls.push(ball);
		}

		preparedBalls.balls.forEach((ball, index) => {
			const type = Animation.TYPES[3];
			const path = [0, 1.2, 1];
			const duration = path.length * this._ballsSpawnSpeed;
			const delay = index * 50;
			const renderable = false;
			const setUpdate = function(ball, currentStep, nextStep, currentStepProgress) {
				ball.scaleFactor = currentStep + ((nextStep - currentStep) * currentStepProgress);
				ball.position = {
					x: preparedBalls.areaPosition.x + preparedBalls.areaHeight * 0.12 + (preparedBalls.areaHeight * 0.12 + ballSize) * index + ballSize / 2 - ball.size * ball.scaleFactor / 2,
					y: preparedBalls.areaPosition.y + preparedBalls.areaHeight / 2 - ball.size * ball.scaleFactor / 2,
				};
			}
			this._animations.push(new Animation(type, ball, path, duration, delay, renderable, setUpdate.bind(this)));
		})
	}

	_spawnBalls() {
		let freeCells = this._getFreeCells();
		
		const ballsToSpawnCounter = Math.min(freeCells.length, this._spawnBallAtTime);
		const ballsToSpawn = [];

		for (let i = 0; i < ballsToSpawnCounter; i++) {
			const ball = this._preparedBalls.balls.shift() || new Object();

			const { key, colors, size } = ball;
			ball.key = key || this._ballsKeys[this._getRandomFromRange(0, this._ballsKeys.length)];
			ball.colors = colors || GameModel.BALLS[ball.key];
			ball.size = size || this._ballSize;
			ball.scaleFactor = 0;
			ball.coords = freeCells[this._getRandomFromRange(0, freeCells.length)].coords;
			ball.position = this._calcBallPosition(ball);
			ballsToSpawn.push(ball);

			freeCells = freeCells.filter(cell => !this._coordsAreEqual(cell.coords, ball.coords));
		}

		ballsToSpawn.forEach((ball, index) => {
			this._markCell(ball);

			const type = Animation.TYPES[1];
			const path = [0, 1.2, 1];
			const duration = path.length * this._ballsSpawnSpeed;
			const delay = index * 50;
			const renderable = false;
			const onEnd = function() {
				this._newSpawnedBalls.push(ball);
				if (this._animations.find(animation => animation.getType() === type && !animation.getEnded())) return;
				this._clearSequences(this._newSpawnedBalls.map(ball => ball));
				this._newSpawnedBalls.length = 0;
			}
			const setUpdate = function(ball, currentStep, nextStep, currentStepProgress) {
				ball.scaleFactor = currentStep + ((nextStep - currentStep) * currentStepProgress);
				ball.position = this._calcBallPosition(ball);
			}
			this._animations.push(new Animation(type, ball, path, duration, delay, renderable, setUpdate.bind(this), onEnd.bind(this)));
		})

		if (this._preparedBalls.balls.length) this._preparedBalls.balls.length = 0;

		this._prepareBalls();
	}

	handleClick(event) {
		if (this._animations.length) return;

		const { size, position, innerOffset, cellSize, cellsDelimiter } = this._field;
 		const borderTop = position.y + innerOffset;
		const borderRight = position.x + size - innerOffset;
		const borderBottom = position.y + size - innerOffset;
		const borderLeft = position.x + innerOffset;
		if (event.offsetX < borderLeft || event.offsetX > borderRight || event.offsetY < borderTop || event.offsetY > borderBottom) return;

		const x = Math.floor((event.offsetX - position.x - innerOffset) / (cellSize + cellsDelimiter));
		const y = Math.floor((event.offsetY - position.y - innerOffset) / (cellSize + cellsDelimiter));
		const coords = { x, y };

		if (!this._coordsIsAvailable(coords)) {
			this._selectBall(coords);
			return;
		} else if (!this._selectedBall) {
			return;
		}

		const path = this._findPath(this._selectedBall.coords, coords);
		if (path) this._moveSelectedBall(path);
	}

	_moveSelectedBall(path) {
		const type = Animation.TYPES[0];
		const ball = Object.assign(new Object(), this._selectedBall);
		const duration = path.length * this._ballMoveSpeed;
		const delay = 0;
		const renderable = true;
		const onEnd = function() {
			this._markCell(ball);
			const clearedSequence = this._clearSequences([ball]);
			if (!clearedSequence.length) this._spawnBalls();
		}
		const setUpdate = function(ball, currentStep, nextStep, currentStepProgress) {
			ball.coords = {
				x: currentStep.x + ((nextStep.x - currentStep.x) * currentStepProgress),
				y: currentStep.y + ((nextStep.y - currentStep.y) * currentStepProgress)
			};
			ball.position = this._calcBallPosition(ball);
		}
		this._animations.push(new Animation(type, ball, path, duration, delay, renderable, setUpdate.bind(this), onEnd.bind(this)));
		this._selectedBall = null;
	}

	_findPath(from, to) {
		const directions = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x:-1, y: 0 }];
		
		let path = null;
		const steps = [{ coords: from, path: [from] }];
		const viewedCoords = [from];
		
		do {
			const step = steps.shift();
			if (this._coordsAreEqual(step.coords, to)) {
				path = step.path;
			} else {
				directions.forEach(direction => {
					const newCoords = { x: step.coords.x + direction.x, y: step.coords.y + direction.y };
					if (this._coordsIsAvailable(newCoords) && !this._arrIncludesCoords(viewedCoords, newCoords)) {
						viewedCoords.push(newCoords);
						const pathToCoords = step.path.map(step => step);
						pathToCoords.push(newCoords);
						steps.push({ coords: newCoords, path: pathToCoords });
					}
				})
			}
		} while (steps.length > 0 && path === null)
		return path;
	}

	_selectBall(coords) {
		if (this._selectedBall) this._markCell(Object.assign(new Object(), this._selectedBall));
		const cell = this._field.map[coords.y][coords.x];
		this._selectedBall = Object.assign(new Object(), cell.ball);
		cell.ball = null;
	}

	_increaseScore(ballsCounter) {
		this._score.toAdd += ballsCounter * this._scorePerBall;
	}

	_clearSequences(balls) {
		const sequences = [];
		const axes = ['x', 'y', 'xy', 'yx'];
	
		balls.forEach(ball => {
			axes.forEach(axis => {
				const sequence = this._findSequenceFromCoords(ball.coords, ball.key, axis);
				if (sequence.parts.length < this._minSequenceLength) return;
				sequences.push(sequence);
			})
		})

		sequences.forEach(sequence => {
			sequence.parts.forEach((coords, index) => {

				if (!this._field.map[coords.y][coords.x].ball) return;

				const type = Animation.TYPES[2];
				const ball = Object.assign({}, this._field.map[coords.y][coords.x].ball);
				const path = [1, 1.2, 0];
				const duration = path.length * this._ballDestroySpeed;
				const delay = index * 50;
				const renderable = true;
				const setUpdate = function(ball, currentStep, nextStep, currentStepProgress) {
					ball.scaleFactor = currentStep + ((nextStep - currentStep) * currentStepProgress);
					ball.position = this._calcBallPosition(ball);
				}
				
				this._animations.push(new Animation(type, ball, path, duration, delay, renderable, setUpdate.bind(this)));
				this._field.map[coords.y][coords.x].ball = null;
			})
			this._increaseScore(sequence.parts.length, sequence.key);
		})
		
		return sequences;
	}

	_findSequenceFromCoords(coords, key, axis) {
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
				offset: { x: -1, y: 0 }
			},
			{
				axis: 'xy',
				offset: { x: -1, y: -1 }
			},
			{
				axis: 'xy',
				offset: { x: 1, y: 1 }
			},
			{
				axis: 'yx',
				offset: { x: -1, y: 1 }
			},
			{
				axis: 'yx',
				offset: { x: 1, y: -1 }
			}
		];
	
		const sequence = {
			parts: [coords],
			key,
		};
		const queue = [coords];
		const axisDirections = directions.filter(direction => direction.axis === axis);

		do {
			const coords = queue.shift();
			axisDirections.forEach(direction => {
				const nextCoords = { x: coords.x + direction.offset.x, y: coords.y + direction.offset.y };
				if (!this._coordsExist(nextCoords) || this._arrIncludesCoords(sequence.parts, nextCoords) || this._field.map[nextCoords.y][nextCoords.x].ball?.key !== key) return;
				sequence.parts.push(nextCoords);
				queue.push(nextCoords);
			})
		} while (queue.length > 0)

		return sequence;
	}

	_getRandomFromRange(from, to) {
		return from === to ? from : from + Math.floor(Math.random() * (to - from));
	}

	_coordsAreEqual(a, b) {
		if (!a || !b) return false;
		return a.x === b.x && a.y === b.y;
	}

	_calcBallPosition(ball) {
		const { position, innerOffset, cellSize, cellsDelimiter } = this._field;
		const { coords, size, scaleFactor } = ball;
		const ballSize = size * scaleFactor;
		return {
			x: position.x + innerOffset + ((cellSize + cellsDelimiter) * coords.x) + ((cellSize - ballSize) / 2),
			y: position.y + innerOffset + ((cellSize + cellsDelimiter) * coords.y) + ((cellSize - ballSize) / 2),
		}
	}

 	_markCell(ball) {
		const { x, y } = ball.coords;
		this._field.map[y][x].ball = ball;
	}

	_coordsIsAvailable(coords) {
		return this._coordsExist(coords) && !this._field.map[coords.y][coords.x].ball && !this._coordsAreEqual(this._selectedBall?.coords, coords);
	}

	_coordsExist(coords) {
		return coords.x >= 0 && coords.x < this._fieldLength && coords.y >= 0 && coords.y < this._fieldLength;
	}
	
	_arrIncludesCoords(arr, coords) {
		return typeof arr.find(part => part.x === coords.x && part.y === coords.y) !== 'undefined';
	}
	
}

GameModel.BALLS = {
	bl: ['#E5E8FF', '#5163FF', '#2A359C'],
	br: ['#FFEBE5', '#F29048', '#8E441B'],
	gr: ['#E5FFE9', '#51CE46', '#197E2F'],
	pnk: ['#FFE5FC', '#EC39FC', '#B2229B'],
	rd: ['#FFCAB9', '#E74724', '#991F1F'],
	sea: ['#E5FFF9', '#51E0FF', '#2391B4'],
	yel: ['#FFF9E5', '#FCDD39', '#B1881E'],
}