import React, { useState } from 'react';

import styles from './styles.module.scss';
import { GridSize, gridSize, Grid } from 'utils/Grid';

interface Props {
  onGenerate(state: GridSize): void;
}

export const Sidebar = (props: Props) => {
  const [state, setState] = useState<GridSize>(gridSize);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.currentTarget;
    setState(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  }

  function generate() {
    props.onGenerate(state);
  }

  return (
    <div className={styles.root}>
      <fieldset>
        <legend>Setup the grid</legend>
        <p>
          <label>
            width ({state.width})
            <input
              min={0}
              max={Grid.MAX_WIDTH}
              step={1}
              type="range"
              name="width"
              onChange={onChange}
              value={state.width}
            />
          </label>
        </p>
        <p>
          <label>
            height ({state.height})
            <input
              min={0}
              max={Grid.MAX_HEIGHT}
              step={1}
              type="range"
              name="height"
              onChange={onChange}
              value={state.height}
            />
          </label>
        </p>
        <p>
          <label>
            density ({state.density})
            <input
              min={0}
              max={100}
              step={1}
              type="range"
              name="density"
              onChange={onChange}
              value={state.density}
            />
          </label>
        </p>
      </fieldset>
      <p>
        <button onClick={generate}>generate</button>
      </p>
    </div>
  );
};
