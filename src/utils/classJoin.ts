export const classJoin = (
  ...classNames: (string | boolean | null | 0 | undefined)[]
) => {
  return classNames.filter(i => i).join(' ');
};
