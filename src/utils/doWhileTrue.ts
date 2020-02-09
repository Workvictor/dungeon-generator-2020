export function doWhileTrue(repeat: () => boolean) {
  let until;
  do {
    until = repeat();
  } while (until);
}
