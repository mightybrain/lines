class Field {
  constructor({ canvasSize, stepSize, score, queue, sceneManager }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
		this._score = score;
		this._queue = queue;
		this._sceneManager = sceneManager;

		this._audioController = new AudioController();
		
    this._map = [];
    this._setMap();

		this._lockInput = false;

		this._balls = [];
		this._ballsTransports = [];
		this._selectedCell = null;

    this._size = 0;
    this._cornerRadius = 0;
    this._innerOffset = 0;
    this._cellsBetweenSize = {
			common: 0,
		};
    this._cellSize = {
			common: 0,
		};
    this._cellCornerRadius = 0;
    this._position = {
      x: 0,
      y: 0,
    }
    this.setSize();
  }


	update(time) {
		this._ballsTransports = this._ballsTransports.filter(transport => !transport.getDone());
		if (this._ballsTransports.length) this._ballsTransports.forEach(transport => transport.update(time));
		else this._lockInput = false;
		
		this._balls = this._balls.filter(ball => ball.getStage() !== Ball.STAGES[4]);
		this._balls.forEach(ball => ball.update(time));
	}

	_setMap() {
		for (let y = 0; y < Field.CELLS_BY_SIDE_COUNTER; y++) {
			const row = [];
			for (let x = 0; x < Field.CELLS_BY_SIDE_COUNTER; x++) {
				row.push({
					coords: { x, y },
					position: { x: 0, y: 0 },
					ball: null,
				});
			}
			this._map.push(row);
		}
	}

	setSize() {
		this._size = this._stepSize.common * Field.SIZE_SCALE_FACTOR;
    this._cornerRadius = this._stepSize.common * Field.CORNER_SCALE_FACTOR;
		this._innerOffset = this._stepSize.common * Field.INNER_OFFSET_SCALE_FACTOR;
		this._cellsBetweenSize.common = this._stepSize.common * Field.CELLS_BETWEEN_SIZE_SCALE_FACTOR;
		this._cellSize.common = this._stepSize.common * Field.CELL_SIZE_SCALE_FACTOR;
    this._cellCornerRadius = this._stepSize.common * Field.CELL_CORNER_SCALE_FACTOR;
		this._position.x = (this._canvasSize.width - this._size) / 2;
		this._position.y = (this._canvasSize.height - this._size) / 2;

		this._map.forEach((row, y) => {
      row.forEach((cell, x) => {
				cell.position.x = this._position.x + this._innerOffset + (this._cellSize.common + this._cellsBetweenSize.common) * x;
				cell.position.y = this._position.y + this._innerOffset + (this._cellSize.common + this._cellsBetweenSize.common) * y;

				if (cell.ball) {
					const ballSize = this._stepSize.common * Ball.SIZE_SCALE_FACTOR;
					const ballPosition = {
						x: cell.position.x + (this._cellSize.common - ballSize) / 2,
						y: cell.position.y + (this._cellSize.common - ballSize) / 2,
					}
					cell.ball.setSize(ballSize);
					cell.ball.setPosition(ballPosition);
				}
			})
		})

		this._ballsTransports.forEach(transport => transport.setSize());
	}

	render(ctx) {
		ctx.fillStyle = '#1D3753';
		renderRoundedRect(ctx, this._position.x, this._position.y, this._size, this._size, this._cornerRadius);

		this._map.forEach(row => {
			row.forEach(cell => {
				ctx.fillStyle = this._selectedCell === cell ? '#335070' : '#203E60';
				renderRoundedRect(ctx, cell.position.x, cell.position.y, this._cellSize.common, this._cellSize.common, this._cellCornerRadius);
			})
		})

		this._balls.forEach(ball => ball.render(ctx));
	}

	_getFreeCells() {
		return this._map.flat().filter(cell => !cell.ball);
	}

	clearSequences(cells) {
		this._audioController.playAudio('audio/fall.wav');

		cells.forEach((cell, index) => {
			cell.ball.destroy(index * 50);
			cell.ball = null;
		})
	}

	findSequences(cells) {
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
		const axes = ['x', 'y', 'xy', 'yx'];
		const sequences = [];
		cells.forEach(cell => {
			const { key } = cell.ball.getColorAndKey();

			axes.forEach(axis => {
				const queue = [cell];
				const sequence = [cell];
				const axisDirections = directions.filter(direction => direction.axis === axis);
		
				do {
					const part = queue.shift();
					axisDirections.forEach(direction => {
						const x = part.coords.x + direction.offset.x; 
						const y = part.coords.y + direction.offset.y;
						
						if (x < 0 || y < 0 || x > Field.CELLS_BY_SIDE_COUNTER - 1 || y > Field.CELLS_BY_SIDE_COUNTER - 1) return;

						const nextCell = this._map[y][x];

						if (nextCell.ball && nextCell.ball.getColorAndKey().key === key && !sequence.includes(nextCell)) {
							sequence.push(nextCell);
							queue.push(nextCell);
						}
					})
				} while (queue.length)

				if (sequence.length >= Field.MIN_SEQUENCE_LENGTH) sequences.push(sequence);
			})
		})

		return sequences.flat();
	}

	_moveBall(path) {
		this._lockInput = true;

		this._audioController.playAudio('audio/move.wav');

		const ball = this._selectedCell.ball;
		this._selectedCell.ball = null;
		this._selectedCell = null;
		this._ballsTransports.push(new BallTransport({
			stepSize: this._stepSize,
			cellSize: this._cellSize,
			cellsBetweenSize: this._cellsBetweenSize,
			field: this,
			score: this._score,
			ball,
			path,
		}))
	}

	_findPath(from, to) {
		const directions = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x:-1, y: 0 }];
		
		const steps = [{ cell: from, path: [from] }];
		const viewed = [from];
		let path = null;
		
		do {
			const step = steps.shift();

			if (step.cell === to) {
				path = step.path;
				continue;
			}

			directions.forEach(direction => {
				const x = step.cell.coords.x + direction.x; 
				const y = step.cell.coords.y + direction.y;

				if (x < 0 || y < 0 || x > Field.CELLS_BY_SIDE_COUNTER - 1 || y > Field.CELLS_BY_SIDE_COUNTER - 1) return;

				const cell = this._map[y][x];

				if (!cell.ball && !viewed.includes(cell)) {
					viewed.push(cell);
					steps.push({ cell, path: [ ...step.path, cell ] });
				}
			})

		} while (steps.length && path === null)

		return path;
	}

  handleClick(event) {
		if (this._lockInput) return;

 		const borderTop = this._position.y + this._innerOffset;
		const borderRight = this._position.x + this._size - this._innerOffset;
		const borderBottom = this._position.y + this._size - this._innerOffset;
		const borderLeft = this._position.x + this._innerOffset;

		if (event.offsetX < borderLeft || event.offsetX > borderRight || event.offsetY < borderTop || event.offsetY > borderBottom) return;

		const x = Math.floor((event.offsetX - this._position.x - this._innerOffset) / (this._cellSize.common + this._cellsBetweenSize.common));
		const y = Math.floor((event.offsetY - this._position.y - this._innerOffset) / (this._cellSize.common + this._cellsBetweenSize.common));
		const cell = this._map[y][x];
		
		if (cell.ball) {
			this._audioController.playAudio('audio/tap.wav');
			this._selectedCell = cell;
		} else if (this._selectedCell) {
			const path = this._findPath(this._selectedCell, cell);
			if (path) this._moveBall(path);
		}
  }

	spawnBalls() {
		const ballsInQueue = this._queue.getBallsInQueue();
		let freeCells = this._getFreeCells();
		const ballsToSpawnCounter = Math.min(freeCells.length, ballsInQueue.length);
		const cells = [];
		
		for (let i = 0; i < ballsToSpawnCounter; i++) {
			const cell = freeCells[getRandomFromRange(0, freeCells.length)];
			const { key, color } = ballsInQueue.shift().getColorAndKey();
			const size = this._stepSize.common * Ball.SIZE_SCALE_FACTOR;

			const ball = new Ball({
				key,
				color,
				size,
				birthDelay: i * 50,
				position: {
					x: cell.position.x + (this._cellSize.common - size) / 2,
					y: cell.position.y + (this._cellSize.common - size) / 2,
				}
			})

			cell.ball = ball;
			this._balls.push(ball);
			cells.push(cell);
			freeCells = this._getFreeCells();
		}

		const sequences = this.findSequences(cells);
		if (sequences.length) {
			this.clearSequences(sequences);
			this._score.addNewPoints(sequences.length * Field.SCORE_PER_BALL);
			freeCells = this._getFreeCells();
		}

		this._queue.clearQueue();
		this._queue.prepareBalls();

		if (!freeCells.length) {
			setTimeout(() => {
				this._sceneManager.setResultScene(this._score.getCurrentScore());
			}, 1500)
		}
	}
}

Field.SIZE_SCALE_FACTOR = 160;
Field.CELL_SIZE_SCALE_FACTOR = 16;
Field.INNER_OFFSET_SCALE_FACTOR = 4;
Field.CELLS_BETWEEN_SIZE_SCALE_FACTOR = 1;
Field.CORNER_SCALE_FACTOR = 9;
Field.CELL_CORNER_SCALE_FACTOR = 6;
Field.CELLS_BY_SIDE_COUNTER = 9;
Field.SCORE_PER_BALL = 1;
Field.MIN_SEQUENCE_LENGTH = 5;