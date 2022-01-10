class GameModel {
	constructor(fieldLength, spawnBallAtTime, minSequenceLength, scorePerBall) {
		this._fieldLength = fieldLength;
		this._spawnBallAtTime = spawnBallAtTime;
		this._minSequenceLength = minSequenceLength;
		this._scorePerBall = scorePerBall;
		
		this._score = 0;
		this._activeBall = null;
		this._activeBallSpeed = 0.2;
		this._nextPreparedColors = [];
		this._ballsKeys = Object.keys(GameModel.BALLS);
		this._field = this._buildField();
		this._spawnBalls();
	}

	getField() {
		return this._field;
	}

	getActiveBall() {
		return this._activeBall;
	}

	getScore() {
		return this._score;
	}

	getNextPreparedColors() {
		return this._nextPreparedColors;
	}

	getColors(key) {
		return GameModel.BALLS[key];
	}

	_buildField() {
		let field = [];
		for (let i = 0; i < this._fieldLength; i++) {
			let row = [];
			for (let j = 0; j < this._fieldLength; j++) {
				row.push('-');
			}
			field.push(row);
		}
		return field;
	}

	_prepareBallColors() {
		let ballColors = [];
	
		do {
			ballColors.push(this._ballsKeys[this._getRandomFromRange(0, this._ballsKeys.length)]);
		} while (ballColors.length < this._spawnBallAtTime)
	
		return ballColors;
	}
	
	_spawnBalls() {
		let freePositions = this._getFreePositions();
		const ballsToSpawnCounter = freePositions.length < this._spawnBallAtTime ? freePositions.length : this._spawnBallAtTime;

		let ballsToSpawn = [];
		do {
			const key = this._nextPreparedColors.length ? this._nextPreparedColors.shift() : this._ballsKeys[this._getRandomFromRange(0, this._ballsKeys.length)];
			const position = freePositions[this._getRandomFromRange(0, freePositions.length)];
			ballsToSpawn.push({ key, position });
			freePositions = freePositions.filter(freePosition => !this._positionsAreEqual(freePosition, position))
		} while (ballsToSpawn.length < ballsToSpawnCounter)

		ballsToSpawn.forEach((ball) => {
			this._markPosition(ball.position, ball.key);
		})
		this._clearSequences(ballsToSpawn.map(ball => ball.position))
		this._nextPreparedColors = this._prepareBallColors();
	}

	update() {
		this._updateActiveBallPosition();
	}
	
	_updateActiveBallPosition() {
		if (!this._activeBall || !this._activeBall.path) {
			return;
		}
		let targetPosition = this._activeBall.path[0];
		const direction = {
			x: (targetPosition.x - this._activeBall.position.x).toFixed(1),
			y: (targetPosition.y - this._activeBall.position.y).toFixed(1)
		}
		for (let axis in direction) {
			if (Math.abs(direction[axis]) <= this._activeBallSpeed) {
				this._activeBall.position[axis] = targetPosition[axis];
			} else {
				this._activeBall.position[axis] += direction[axis] * this._activeBallSpeed;
			}	
		}
		if (this._positionsAreEqual(this._activeBall.position, targetPosition)) {
			this._activeBall.path = this._activeBall.path.slice(1);
		}
	
		if (this._activeBall.path.length > 0) {
			return;
		}
		const deselectedBall = this._deselectBall();
		const clearedSequence = this._clearSequences([deselectedBall.position]);
		if (clearedSequence.length === 0) {
			this._spawnBalls();
		}
	}

	_increaseScore(ballsCounter) {
		this._score += ballsCounter * this._scorePerBall;
	}

	_deselectBall() {
		const deselectedBall = Object.assign({}, this._activeBall);
		this._markPosition(this._activeBall.position, this._activeBall.key);
		this._activeBall = null;
		return deselectedBall;
	}
	
	_selectBall(position) {
		const key = this._field[position.y][position.x];
		this._activeBall = {
			key,
			colors: GameModel.BALLS[key],
			position,
			path: null,
		};
		this._markPosition(position, '-');
	}

	_findPath(from, to) {
		const directions = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x:-1, y: 0 }];
		
		let path = null;
		let steps = [{ position: from, path: []}];
		let viewedPositions = [from];
		
		do {
			const step = steps.shift();
			if (this._positionsAreEqual(step.position, to)) {
				path = step.path;
			} else {
				directions.forEach((direction) => {
					const newPosition = { x: step.position.x + direction.x, y: step.position.y + direction.y };
					if (this._positionIsAvailable(newPosition) && !this._arrIncludesPosition(viewedPositions, newPosition)) {
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

	_clearSequences(positions) {
		let sequences = [];
		const axes = ['x', 'y'];
	
		positions.forEach((position) => {
			axes.forEach((axis) => {
	
				const sequence = this._findSequenceFromPosition(position, axis);
				if (sequence.length < this._minSequenceLength) {
					return;
				}
				sequence.forEach((position) => {
					if (!this._arrIncludesPosition(sequences, position)) {
						sequences.push(position);
					}
				})
			})
		})

		sequences.forEach((position) => {
			this._markPosition(position, '-');
		})
		this._increaseScore(sequences.length);
		return sequences;
	}

 	handleClick(position) {
		if (this._positionIsAvailable(position) && this._activeBall) {
			this._activeBall.path = this._findPath(this._activeBall.position, position);
		} else if (!this._positionIsAvailable(position) && this._activeBall) {
			this._deselectBall();
			this._selectBall(position);
		} else if (!this._positionIsAvailable(position)) {
			this._selectBall(position);
		}
	}

	_getFreePositions() {
		let freePositions = [];
		this._field.forEach((row, y) => {
			row.forEach((position, x) => {
				if (position !== '-') {
					return;
				}
				freePositions.push({ x, y });
			})
		})
		return freePositions;
	}

	_findSequenceFromPosition(position, axis) {
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
		const sequenceKey = this._field[position.y][position.x];
		let queue = [position];
		const axisDirections = directions.filter(direction => direction.axis === axis);
		do {
			const position = queue.shift();
			axisDirections.forEach((direction) => {
				const nextPosition = { x: position.x + direction.offset.x, y: position.y + direction.offset.y };
				if (!this._positionExist(nextPosition) || this._arrIncludesPosition(sequence, nextPosition) || this._field[nextPosition.y][nextPosition.x] !== sequenceKey) {
					return;
				}
				sequence.push(nextPosition);
				queue.push(nextPosition);
			})		
	
		} while (queue.length > 0)
	
		return sequence;
	}

	_getRandomFromRange(from, to) {
		return from === to ? from : from + Math.floor(Math.random() * (to - from));
	}

	_markPosition(position, key) {
		this._field[position.y][position.x] = key;
	}
	
	_positionIsAvailable(position) {
		return this._positionExist(position) && this._field[position.y][position.x] === '-' && (!this._activeBall|| !this._positionsAreEqual(position, this._activeBall.position));
	}
	
	_positionExist(position) {
		return position.x >= 0 && position.x < this._fieldLength && position.y >= 0 && position.y < this._fieldLength;
	}
	
	_arrIncludesPosition(path, position) {
		return typeof path.find(pathPart => pathPart.x === position.x && pathPart.y === position.y) !== 'undefined';
	}
	
	_positionsAreEqual(a, b) {
		return a.x === b.x && a.y === b.y;
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