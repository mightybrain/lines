class Field {
  constructor({ canvasSize, stepSize }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;

    this._cellsBySideCounter = 9;
    this._map = [];
    this._setMap();

    this._size = {
			width: 0,
			height: 0,
		};
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

	_setMap() {
		for (let y = 0; y < this._cellsBySideCounter; y++) {
			const row = [];
			for (let x = 0; x < this._cellsBySideCounter; x++) {
				row.push({});
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
		this._position = {
			x: (this._canvasSize.width - this._size) / 2,
			y: (this._canvasSize.height - this._size) / 2,
		};

		this._map = this._map.map((row, y) => {
      return row.map((cell, x) => {
				return {
          ...cell,
          position: {
            x: this._position.x + this._innerOffset + ((this._cellSize + this._cellsBetweenSize) * x),
            y: this._position.y + this._innerOffset + ((this._cellSize + this._cellsBetweenSize) * y),
          }
				}
			})
		})
	}

	render(ctx) {
		ctx.fillStyle = '#1D3753';
		renderRoundedRect(ctx, this._position.x, this._position.y, this._size, this._size, this._cornerRadius);

		ctx.fillStyle = '#203E60';
		this._map.forEach(row => {
			row.forEach(cell => {
				renderRoundedRect(ctx, cell.position.x, cell.position.y, this._cellSize, this._cellSize, this._cellCornerRadius);
			})
		})
	}
}

Field.SIZE_SCALE_FACTOR = 160;
Field.CELL_SIZE_SCALE_FACTOR = 16;
Field.INNER_OFFSET_SCALE_FACTOR = 4;
Field.CELLS_BETWEEN_SIZE_SCALE_FACTOR = 1;
Field.CORNER_SCALE_FACTOR = 8;
Field.CELL_CORNER_SCALE_FACTOR = 6;