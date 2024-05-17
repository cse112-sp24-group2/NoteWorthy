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

/**
 * @description Parse the note date string into a Date object
 * @param {String} dateString - The date string in the format 'MM/DD/YYYYat HH:MM AM/PM'
 * @returns {Date} The parsed Date object
 */
export function parseNoteDate(dateString) {
  const [month, day, dateTimeString] = dateString.split('/');
  const [date, timeString] = dateTimeString.split('at ');
  const [hour, minute, ampm] = timeString.trim().split(/[: ]/);

  let parsedHour = parseInt(hour, 10);
  if (parsedHour === 12) {
    parsedHour = ampm === 'PM' ? 12 : 0;
  } else {
    parsedHour = ampm === 'PM' ? parsedHour + 12 : parsedHour;
  }

  return new Date(date, parseInt(month, 10) - 1, parseInt(day, 10), parsedHour, parseInt(minute, 10));
}
