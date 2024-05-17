/**
 * Toggles a specific class for every HTML element in an array
 * @param { Array<HTMLElement> } arr - arr of elements to use
 * @param { String } className - name of class to toggle
 */
export function toggleClassToArr(arr, className) {
  arr.forEach((el) => {
    el.classList.toggle(className);
  });
} /* toggleClassToArr */
