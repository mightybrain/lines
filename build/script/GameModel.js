class GameModel {
	constructor(fieldLength, spawnBallAtTime, minSequenceLength, scorePerBall) {
		this._fieldLength = fieldLength;
		this._spawnBallAtTime = spawnBallAtTime;
		this._minSequenceLength = minSequenceLength;
		this._scorePerBall = scorePerBall;

		this._field = this._buildField();
		this._score = 0;
		this._selectedBall = null;
		this._newSpawnedBalls = [];
		this._nextPreparedColors = [];

		this._animations = [];
		
		this._spawnBalls();
	}

	getField() {
		return this._field;
	}

	getSelectedBall() {
		return this._selectedBall;
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

	getAnimations() {
		return this._animations;
	}

	_buildField() {
		const field = [];
		for (let i = 0; i < this._fieldLength; i++) {
			const row = [];
			for (let j = 0; j < this._fieldLength; j++) {
				row.push('-');
			}
			field.push(row);
		}
		return field;
	}

	_prepareBallColors() {
		const ballsKeys = Object.keys(GameModel.BALLS);
		const ballColors = [];
	
		do {
			ballColors.push(ballsKeys[this._getRandomFromRange(0, ballsKeys.length)]);
		} while (ballColors.length < this._spawnBallAtTime)
	
		return ballColors;
	}
	
	_spawnBalls() {
		let freePositions = this._getFreePositions();
		const ballsToSpawnCounter = freePositions.length < this._spawnBallAtTime ? freePositions.length : this._spawnBallAtTime;

		const ballsKeys = Object.keys(GameModel.BALLS);
		const ballsToSpawn = [];
		do {
			const key = this._nextPreparedColors.length ? this._nextPreparedColors.shift() : ballsKeys[this._getRandomFromRange(0, ballsKeys.length)];
			const colors = GameModel.BALLS[key];
			const position = freePositions[this._getRandomFromRange(0, freePositions.length)];
			const scaleFactor = 0;
			ballsToSpawn.push({ key, colors, position, scaleFactor });
			freePositions = freePositions.filter(freePosition => !this._positionsAreEqual(freePosition, position));
		} while (ballsToSpawn.length < ballsToSpawnCounter)

		ballsToSpawn.forEach((ball, index) => {
			const type = Animation.TYPES[1];
			const elem = ball;
			const path = [0, 1.2, 1];
			const duration = path.length * 150;
			const delay = index * 50;
			const onEnd = function() {
				this._markPosition(elem.position, elem.key);
				this._newSpawnedBalls.push(elem.position);
				if (this._animations.find(animation => animation.getType() === Animation.TYPES[1] && !animation.getEnded())) return;
				this._clearSequences(this._newSpawnedBalls.map(position => position));
				this._newSpawnedBalls.length = 0;
			}
			const onUpdate = function(elem, currentStep, nextStep, currentStepProgress) {
				elem.scaleFactor = currentStep + ((nextStep - currentStep) * currentStepProgress);
			}
			this._animations.push(new Animation(type, elem, path, duration, delay, onUpdate, onEnd.bind(this)));
		})

		this._nextPreparedColors = this._prepareBallColors();
	}

	update(timestamp) {
		this._updateAnimations(timestamp);
	}

	_updateAnimations(timestamp) {
		if (!this._animations.length) return;
		
		this._animations.forEach((animation) => {
			if (!animation.getRunning()) {
				animation.start(timestamp);
				return;
			}
			animation.update(timestamp);
			if (animation.getEnded()) {
				animation.onEnd && animation.onEnd();
			}
		})

		this._animations = this._animations.filter(animation => !animation.getEnded());
	}

	_increaseScore(ballsCounter) {
		this._score += ballsCounter * this._scorePerBall;
	}
	
	_selectBall(position) {
		const key = this._field[position.y][position.x];
		const colors = GameModel.BALLS[key];
		const scaleFactor = 1;
		this._selectedBall = { key, colors, position, scaleFactor };
	}

	_findPath(from, to) {
		const directions = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x:-1, y: 0 }];
		
		let path = null;
		const steps = [{ position: from, path: [from]}];
		const viewedPositions = [from];
		
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
		const sequences = [];
		const axes = ['x', 'y'];
	
		positions.forEach((position) => {
			axes.forEach((axis) => {
	
				const sequence = this._findSequenceFromPosition(position, axis);
				if (sequence.length < this._minSequenceLength) return;
				sequence.forEach((position) => {
					if (!this._arrIncludesPosition(sequences, position)) {
						sequences.push(position);
					}
				})
			})
		})

		sequences.forEach((position, index) => {
			const type = Animation.TYPES[2];
			const key = this._field[position.y][position.x];
			const colors = GameModel.BALLS[key];
			const scaleFactor = 1;
			const elem = { key, colors, position, scaleFactor };
			const path = [1, 1.2, 0];
			const duration = path.length * 150;
			const delay = index * 50;
			const onUpdate = function(elem, currentStep, nextStep, currentStepProgress) {
				elem.scaleFactor = currentStep + ((nextStep - currentStep) * currentStepProgress);
			}
			
 			this._animations.push(new Animation(type, elem, path, duration, delay, onUpdate));
			this._markPosition(position, '-');
		})
		
		this._increaseScore(sequences.length);
		return sequences;
	}

 	handleClick(position) {
		if (!this._positionIsAvailable(position)) {
			this._selectBall(position);
			return;
		} else if (!this._selectedBall) {
			return;
		}
		
		const path = this._findPath(this._selectedBall.position, position);
		if (path) {
			const type = Animation.TYPES[0];
			const elem = Object.assign({}, this._selectedBall);
			const duration = path.length * 75;
			const delay = 0;
 			const onEnd = function() {
				this._markPosition(elem.position, elem.key);
				const clearedSequence = this._clearSequences([elem.position]);
				if (!clearedSequence.length) {
					this._spawnBalls();
				}
			}
			const onUpdate = function(elem, currentStep, nextStep, currentStepProgress) {
				elem.position = {
					x: currentStep.x + ((nextStep.x - currentStep.x) * currentStepProgress),
					y: currentStep.y + ((nextStep.y - currentStep.y) * currentStepProgress)
				};
			}
			this._animations.push(new Animation(type, elem, path, duration, delay, onUpdate, onEnd.bind(this)));
			this._markPosition(this._selectedBall.position, '-');
			this._selectedBall = null;
		}
	}

	_getFreePositions() {
		const freePositions = [];
		this._field.forEach((row, y) => {
			row.forEach((position, x) => {
				if (position !== '-') return;
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
	
		const sequence = [position];
		const sequenceKey = this._field[position.y][position.x];
		const queue = [position];
		const axisDirections = directions.filter(direction => direction.axis === axis);
		do {
			const position = queue.shift();
			axisDirections.forEach((direction) => {
				const nextPosition = { x: position.x + direction.offset.x, y: position.y + direction.offset.y };
				if (!this._positionExist(nextPosition) || this._arrIncludesPosition(sequence, nextPosition) || this._field[nextPosition.y][nextPosition.x] !== sequenceKey) return;
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
		return this._positionExist(position) && this._field[position.y][position.x] === '-';
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