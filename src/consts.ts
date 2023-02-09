export const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

export const MINI_SIZE = 100;
export const MS_PER_PIXEL = 5;
export const MS_PER_MINI = MINI_SIZE * MS_PER_PIXEL;
