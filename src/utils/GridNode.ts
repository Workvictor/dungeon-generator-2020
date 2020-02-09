export class GridNode {
  constructor(public x: number, public y: number, public index: number) {}

  state: 0 | 1 = 0;

  regionId: number = 0;
}
