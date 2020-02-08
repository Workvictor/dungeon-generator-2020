import { createRect } from './createRect';

export class GridNode {
  static CELL_SIZE: number = 8;

  static STATE_MAP = [
    createRect('#000', GridNode.CELL_SIZE, GridNode.CELL_SIZE)
  ];

  constructor(public x: number, public y: number) {}

  private get image() {
    return GridNode.STATE_MAP[this.state] || GridNode.STATE_MAP[0];
  }

  setPosition = (x: number, y: number) => {
    this.x = x;
    this.y = y;
  };

  draw = (ctx: CanvasRenderingContext2D) => {
    ctx.drawImage(this.image, this.x, this.y);
  };

  state: 0 | 1 = 0;
}
