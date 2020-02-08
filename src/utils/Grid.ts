import { GridNode } from './GridNode';
import { createRect } from './createRect';

export const min = 9;

export const max = 256;

export const gridSize = {
  width: 80,
  height: 40,
  cellSize: 8,
  density: 50
};

const DENSITY_MIN = 0.3;
const DENSITY_PER_PERCENT = DENSITY_MIN / 100;
const DENSITY_MAX = DENSITY_PER_PERCENT * 100 + DENSITY_MIN;

export type GridSize = typeof gridSize;

export interface GridConstructor extends GridSize {
  ctx: CanvasRenderingContext2D;
}

type OnProgressCallback = (progress: number) => void;

const NEIGHBORS_OFFSETS = [-1, 0, +1];

export class Grid {
  static MAX_WIDTH = 256;
  static MAX_HEIGHT = 256;
  constructor(props: GridConstructor) {
    const { cellSize, ctx, height, width, density } = props;
    this.density = density * DENSITY_PER_PERCENT + DENSITY_MIN;
    console.log(props);
    GridNode.CELL_SIZE = cellSize;
    GridNode.STATE_MAP = [
      createRect('#000', cellSize, cellSize),
      createRect('#fff', cellSize, cellSize)
    ];
    this.cellSize = cellSize;
    this.ctx = ctx;
    this.width = width;
    this.height = width;
    this.sizeOfGrid = width * height;
    this.nodeStateMap = [
      createRect('#000', cellSize, cellSize),
      createRect('#fff', cellSize, cellSize)
    ];
  }

  nodeStateMap: HTMLCanvasElement[];

  density: number;

  cellSize: number;

  width: number;

  height: number;

  sizeOfGrid: number;

  ctx: CanvasRenderingContext2D;

  private readonly progress = 0;

  nodes: GridNode[] = [];

  getCol = (index: number) => index % this.width;

  getRow = (index: number) => Math.floor(index / this.width);

  getIndex = (col: number, row: number) => col + row * this.width;

  getCords = (index: number): [number, number] => [
    this.getCol(index) * this.cellSize,
    this.getRow(index) * this.cellSize
  ];

  getRandomState() {
    if (this.density === DENSITY_MIN) {
      return 0;
    }
    if (Math.random() < this.density || this.density === DENSITY_MAX) {
      return 1;
    }
    return 0;
  }

  nodeInGrid = (col: number, row: number) => {
    return col >= 0 && col <= this.width && row >= 0 && row <= this.height;
  };

  getNeighbors = (index: number) => {
    const row = this.getRow(index);
    const col = this.getCol(index);

    const result: number[] = [];

    NEIGHBORS_OFFSETS.forEach(stepX => {
      NEIGHBORS_OFFSETS.forEach(stepY => {
        const nCol = col + stepX;
        const nRow = row + stepY;
        const nIndex = this.getIndex(nCol, nRow);
        const node = this.nodes[nIndex];
        if (index !== nIndex && node && node.state > 0) {
          result.push(nIndex);
        }
      });
    });

    return result;
  };

  private get loopTime() {
    return Date.now() + 1000 / 60;
  }

  createNodes = (onProgress: OnProgressCallback) => {
    return new Promise(resolve => {
      const loop = () => {
        const loopTime = this.loopTime;
        while (this.nodes.length < this.sizeOfGrid && loopTime > Date.now()) {
          const node = new GridNode(...this.getCords(this.nodes.length));
          node.state = this.getRandomState();
          node.draw(this.ctx);
          this.nodes.push(node);
        }
        onProgress(this.nodes.length / this.sizeOfGrid);
        if (this.nodes.length < this.sizeOfGrid) {
          window.requestAnimationFrame(loop);
        } else {
          console.log('finished createNodes');
          resolve();
        }
      };
      loop();
    });
  };

  smooth = (onProgress: OnProgressCallback) => {
    let smooth = 3;
    let index = 0;
    return new Promise(resolve => {
      const loop = () => {
        const loopTime = this.loopTime;
        while (
          loopTime > Date.now() &&
          smooth > 0 &&
          index < this.sizeOfGrid - 1
        ) {
          const node = this.nodes[index];
          const nCount = this.getNeighbors(index).length;
          if (nCount > 4) {
            node.state = 1;
          }
          if (nCount < 3) {
            node.state = 0;
          }
          node.draw(this.ctx);
          index++;
        }
        onProgress(index / this.sizeOfGrid);
        if (index === this.sizeOfGrid - 1) {
          index = 0;
          smooth--;
        }
        if (smooth > 0) {
          window.requestAnimationFrame(loop);
        } else {
          console.log('finished smooth');
          resolve();
        }
      };
      loop();
    });
  };

  generate = async (onProgress: OnProgressCallback) => {
    await this.createNodes(onProgress);
    await this.smooth(onProgress);
  };
}
