import React, { useState, useRef } from 'react';

import styles from './styles.module.scss';
import { Sidebar } from 'components/sidebar/Sidebar';
import { Grid, GridSize, gridSize } from 'utils/Grid';

export const App = () => {
  const startTime = useRef(Date.now());
  const [progress, setProgress] = useState(0);
  const [genTime, setGenTime] = useState(0);
  const [width, setWidth] = useState(gridSize.width);
  const [height, setHeight] = useState(gridSize.height);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function onProgress(progress: number) {
    setProgress(progress);
    setGenTime(Date.now() - startTime.current);
  }

  function onGenerate(props: GridSize) {
    setProgress(0);
    setGenTime(0);
    setWidth(props.width);
    setHeight(props.height);
    const canvas = canvasRef.current!;
    canvas.width = props.width * props.cellSize;
    canvas.height = props.height * props.cellSize + props.cellSize;
    const ctx = canvas.getContext('2d')!;

    const grid = new Grid({ ...props, ctx });
    startTime.current = Date.now();
    grid.generate(onProgress).then(() => {
      setGenTime(Date.now() - startTime.current);
    });
  }

  const progressPercent = Math.floor(progress * 100);

  return (
    <div>
      <div className={styles.wrapper}>
        <Sidebar onGenerate={onGenerate} />
        <div>
          <div>
            progress:{' '}
            <progress id="progress" max="100" value={progressPercent}>
              {progressPercent}%
            </progress>
          </div>
          <div>genTime: {genTime}ms</div>
          <canvas
            ref={canvasRef}
            // width={width * gridSize.cellSize}
            // height={height * gridSize.cellSize + gridSize.cellSize}
          />
        </div>
      </div>
    </div>
  );
};
