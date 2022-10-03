class Field {
  constructor({ canvasSize, stepSize, score, queue, state }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
		this._score = score;
		this._queue = queue;
		this._state = state;

		this._lockInput = false;

    this._map = [];
    this._setMap();

		this._balls = [];
		this._selectedCell = null;

    this._size = 0;
    this._cornerRadius = 0;
    this._innerOffset = 0;
    this._cellsBetweenSize = 0;
    this._cellSize = 0;
    this._cellCornerRadius = 0;
    this._position = {
      x: 0,
      y: 0,
    }
    this.setSize();
  }

	update(time) {
		this._balls = this._balls.filter(ball => ball.getStage() !== ActiveBall.STAGES[5])
		this._balls.forEach(ball => {
			ball.update(time);
		})
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
		this._cellsBetweenSize = this._stepSize.common * Field.CELLS_BETWEEN_SIZE_SCALE_FACTOR;
		this._cellSize = this._stepSize.common * Field.CELL_SIZE_SCALE_FACTOR;
    this._cellCornerRadius = this._stepSize.common * Field.CELL_CORNER_SCALE_FACTOR;
		this._position.x = (this._canvasSize.width - this._size) / 2;
		this._position.y = (this._canvasSize.height - this._size) / 2;

		this._map.forEach((row, y) => {
      row.forEach((cell, x) => {
				cell.position.x = this._position.x + this._innerOffset + ((this._cellSize + this._cellsBetweenSize) * x);
				cell.position.y = this._position.y + this._innerOffset + ((this._cellSize + this._cellsBetweenSize) * y);

				if (cell.ball) {
					const ballSize = this._stepSize.common * Ball.SIZE_SCALE_FACTOR;
					const ballPosition = {
						x: cell.position.x + this._cellSize / 2 - ballSize / 2,
						y: cell.position.y + this._cellSize / 2 - ballSize / 2,
					}
					cell.ball.setSize(ballSize);
					cell.ball.setPosition(ballPosition);
				}
			})
		})
	}

	render(ctx) {
		ctx.fillStyle = '#1D3753';
		renderRoundedRect(ctx, this._position.x, this._position.y, this._size, this._size, this._cornerRadius);

		this._map.forEach(row => {
			row.forEach(cell => {
				ctx.fillStyle = this._selectedCell && this._selectedCell === cell ? '#335070' : '#203E60';
				renderRoundedRect(ctx, cell.position.x, cell.position.y, this._cellSize, this._cellSize, this._cellCornerRadius);
			})
		})

		this._balls.forEach(ball => {
			ball.render(ctx);
		})
	}

	_getFreeCells() {
		return this._map.flat().filter(cell => !cell.ball);
	}

	spawnBalls() {
		const ballsInQueue = this._queue.getBallsInQueue();
		let freeCells = this._getFreeCells();
		const ballsToSpawnCounter = Math.min(freeCells.length, ballsInQueue.length);
		const cells = [];
		
		for (let i = 0; i < ballsToSpawnCounter; i++) {
			const cell = freeCells[getRandomFromRange(0, freeCells.length)];
			cells.push(cell);
			const { key, color } = ballsInQueue.shift().getColorAndKey();
			const size = this._stepSize.common * ActiveBall.SIZE_SCALE_FACTOR;

			const ball = new ActiveBall({
				key,
				color,
				size,
				cellSize: this._cellSize,
				stepSize: this._stepSize,
				field: this,
				birthDelay: i * 50,
				position: {
					x: cell.position.x + (this._cellSize - size) / 2,
					y: cell.position.y + (this._cellSize - size) / 2,
				}
			})

			this._map[cell.coords.y][cell.coords.x].ball = ball;
			this._balls.push(ball);
			freeCells = this._getFreeCells();
		}

		const sequences = this.findSequences(cells);
		if (sequences.length) {
			this.clearSequences(sequences.flat());
			const points = sequences.flat().length * Field.SCORE_PER_BALL;
			this._score.addNewPoints(points);
			freeCells = this._getFreeCells();
		}

		this._queue.clearQueue();
		this._queue.prepareBalls();

		if (!freeCells.length) {
			const currentScore = this._score.getCurrentScore();
			this._state.setTotalScore(currentScore);
			this._state.setResultScene();
		}
	}

  handleClick(event) {
		if (this._lockInput) return;

 		const borderTop = this._position.y + this._innerOffset;
		const borderRight = this._position.x + this._size - this._innerOffset;
		const borderBottom = this._position.y + this._size - this._innerOffset;
		const borderLeft = this._position.x + this._innerOffset;

		if (event.offsetX < borderLeft || event.offsetX > borderRight || event.offsetY < borderTop || event.offsetY > borderBottom) return;

		const x = Math.floor((event.offsetX - this._position.x - this._innerOffset) / (this._cellSize + this._cellsBetweenSize));
		const y = Math.floor((event.offsetY - this._position.y - this._innerOffset) / (this._cellSize + this._cellsBetweenSize));
		
		if (this._map[y][x].ball) {
			this._selectedCell = this._map[y][x];
		} else if (this._selectedCell) {
			const path = this._findPath(this._selectedCell, this._map[y][x]);
			if (path) this._moveBall(path);
		}
  }

	_moveBall(path) {
		const ball = this._selectedCell.ball;
		this._selectedCell.ball = null;
		this._selectedCell = null;
		ball.move(path);
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
				const x = Math.min(
					Math.max(step.cell.coords.x + direction.x, 0),
					Field.CELLS_BY_SIDE_COUNTER - 1
				); 
				const y = Math.min(
					Math.max(step.cell.coords.y + direction.y, 0),
					Field.CELLS_BY_SIDE_COUNTER - 1
				); 
				const cell = this._map[y][x];

				if (!cell.ball && !viewed.includes(cell)) {
					viewed.push(cell);
					steps.push({ cell, path: [ ...step.path, cell ] });
				}
			})

		} while (steps.length && path === null)

		return path;
	}

	clearSequences(cells) {
		cells.forEach(cell => {
			cell.ball.destroy();
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
						const x = Math.min(
							Math.max(part.coords.x + direction.offset.x, 0),
							Field.CELLS_BY_SIDE_COUNTER - 1
						); 
						const y = Math.min(
							Math.max(part.coords.y + direction.offset.y, 0),
							Field.CELLS_BY_SIDE_COUNTER - 1
						); 
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

		//console.log(sequences)
		return sequences;
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