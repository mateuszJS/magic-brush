let lastCallback = (e: MouseEvent) => {};

export function showRemoveWidthPointBtn(
  position: Point,
  callback: (e: MouseEvent) => void
) {
  const removeWidthPointBtn = document.querySelector<HTMLButtonElement>(
    ".remove-width-point-btn"
  )!;

  removeWidthPointBtn.removeEventListener("click", lastCallback);
  removeWidthPointBtn.addEventListener("click", callback);
  lastCallback = callback;

  removeWidthPointBtn.style.top = `${position.y}px`;
  removeWidthPointBtn.style.left = `${position.x}px`;
  removeWidthPointBtn.style.display = "block";
}

export function hideRemoveWidthPointBtn() {
  const removeWidthPointBtn = document.querySelector<HTMLButtonElement>(
    ".remove-width-point-btn"
  )!;
  removeWidthPointBtn.style.display = "none";
}
