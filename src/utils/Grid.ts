import { GridNode } from './GridNode';
import { createRect } from './createRect';
import { coroutine } from './coroutine';
import { doWhileTrue } from './doWhileTrue';

export const min = 9;

export const max = 256;

export const gridSize = {
  width: 60,
  height: 40,
  cellSize: 16,
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

type NodeState = 0 | 1;

const NEIGHBORS_OFFSETS = [-1, 0, +1];

export class Grid {
  static MAX_WIDTH = 256;
  static MAX_HEIGHT = 256;

  constructor(props: GridConstructor) {
    const { cellSize, ctx, height, width, density } = props;

    this.density = density * DENSITY_PER_PERCENT + DENSITY_MIN;

    this.cellSize = cellSize;

    this.ctx = ctx;

    this.width = width;

    this.height = width;

    this.sizeOfGrid = width * height;

    this.stateMap = [
      createRect('#000', cellSize, cellSize),
      createRect('#fff', cellSize, cellSize)
    ];
  }

  stateMap: HTMLCanvasElement[];

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

  private getNodeImage = (state: NodeState) => {
    return this.stateMap[state] || this.stateMap[0];
  };

  drawNode = (node: GridNode) => {
    this.ctx.drawImage(this.getNodeImage(node.state), node.x, node.y);
  };

  drawNodeRect = (node: GridNode, color: string) => {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(node.x, node.y, this.cellSize, this.cellSize);
  };

  drawRegionId = (node: GridNode, id: number) => {
    this.ctx.fillStyle = '#000';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.font = '10px Arial';
    this.ctx.fillText(String(id), node.x, node.y);
  };

  nodeInGrid = (col: number, row: number) => {
    return col >= 0 && col <= this.width && row >= 0 && row <= this.height;
  };

  getConnectedNeighborsIds = (
    index: number,
    map?: (node: GridNode) => boolean
  ) => {
    const iRow = this.getRow(index);
    const iCol = this.getCol(index);
    const result: number[] = [];
    const crossOffsets = [
      [iCol, iRow + 1],
      [iCol, iRow - 1],
      [iCol + 1, iRow],
      [iCol - 1, iRow]
    ];
    crossOffsets.forEach(([col, row]) => {
      const nIndex = this.getIndex(col, row);

      const node = this.nodes[nIndex];

      const availableNode = index !== nIndex && node;
      const withNoMapFunction = availableNode && !map;
      const withMapFunction = availableNode && map && map(node);
      if (withNoMapFunction || withMapFunction) {
        result.push(nIndex);
      }
    });
    return result;
  };

  getNeighborsIds = (index: number, map?: (node: GridNode) => boolean) => {
    const row = this.getRow(index);
    const col = this.getCol(index);

    const result: number[] = [];

    NEIGHBORS_OFFSETS.forEach(stepX => {
      NEIGHBORS_OFFSETS.forEach(stepY => {
        const nCol = col + stepX;
        const nRow = row + stepY;
        const nIndex = this.getIndex(nCol, nRow);
        const node = this.nodes[nIndex];
        const availableNode = index !== nIndex && node;
        const withNoMapFunction = availableNode && !map;
        const withMapFunction = availableNode && map && map(node);
        if (withNoMapFunction || withMapFunction) {
          result.push(nIndex);
        }
      });
    });

    return result;
  };

  createNodes = (onProgress: OnProgressCallback) => {
    return coroutine(loopTime => {
      doWhileTrue(() => {
        const coords = this.getCords(this.nodes.length);

        const node = new GridNode(coords[0], coords[1], this.nodes.length);

        const col = this.getCol(node.index);
        const row = this.getRow(node.index);

        if (
          col === 0 ||
          row === 0 ||
          col === this.width - 1 ||
          row === this.height - 1
        ) {
          node.state = 0;
        } else {
          node.state = this.getRandomState();
        }

        this.drawNode(node);

        this.nodes.push(node);

        return loopTime > Date.now() && this.nodes.length < this.sizeOfGrid;
      });

      onProgress(this.nodes.length / this.sizeOfGrid);

      return this.nodes.length < this.sizeOfGrid;
    });
  };

  smooth = (onProgress: OnProgressCallback) => {
    let smooth = 5;
    let index = 0;
    return coroutine(loopTime => {
      doWhileTrue(() => {
        const node = this.nodes[index];

        const nCount = this.getNeighborsIds(index, n => n.state > 0).length;

        if (nCount > 4) {
          node.state = 1;
        }

        if (nCount < 3) {
          node.state = 0;
        }

        this.drawNode(node);

        index++;

        return (
          loopTime > Date.now() && smooth > 0 && index < this.sizeOfGrid - 1
        );
      });
      onProgress(index / this.sizeOfGrid);

      if (index === this.sizeOfGrid - 1) {
        index = 0;
        smooth--;
      }

      return smooth > 0;
    });
  };

  getFirstWalkableIndex = () => {
    const node = this.nodes.find(node => {
      return node.state > 0 && node.regionId === 0;
    });
    if (node) {
      return node.index;
    }
    return -1;
  };

  detectRegions = (onProgress: OnProgressCallback) => {
    const regionList: number[] = [];

    const debugColor = '#8bc34a';
    const openListIds: number[] = [this.getFirstWalkableIndex()];

    return coroutine(loopTime => {
      doWhileTrue(() => {
        const nodeIndex = openListIds.pop()!;
        const regionId = regionList.length + 1;

        if (nodeIndex >= 0) {
          const stepNode = this.nodes[nodeIndex];
          stepNode.regionId = regionId;
          this.drawRegionId(stepNode, regionId);
          this.getConnectedNeighborsIds(nodeIndex, n =>
            Boolean(n.state > 0 && n.regionId === 0)
          ).forEach(id => {
            openListIds.push(id);
          });
        }
        const nextIndex = this.getFirstWalkableIndex();
        if (openListIds.length === 0 && nextIndex >= 0) {
          openListIds.push(nextIndex);
          regionList.push(regionId);
        }
        if (openListIds.length === 0 && nextIndex < 0) {
          regionList.push(regionId);
        }
        return loopTime > Date.now() && openListIds.length > 0;
      });

      console.log('detect', regionList);

      return openListIds.length > 0;
    });
  };

  generate = async (onProgress: OnProgressCallback) => {
    await this.createNodes(onProgress);
    await this.smooth(onProgress);
    await this.detectRegions(onProgress);
  };
}
