export function coroutine(repeat: (loopTime: number) => boolean, fps = 60) {
  return new Promise(resolve => {
    const loop = () => {
      if (repeat(Date.now() + 1000 / fps)) {
        window.requestAnimationFrame(loop);
      } else {
        resolve();
      }
    };
    loop();
  });
}
