/*
 * utility.js provides utility functions that are called from multiple files and provide
 * general purpose functionality
 *
 * Functions inside this file:
 *   - toggleClassToArr()
 *   - parseNoteDate()
 *   - generateRandomString()
 *   - getDate()
 */

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

/**
 * Generates a random string of specified length.
 *
 * @param {number} length - The desired length of the random string.
 * @returns {string} A string of random characters with the specified length.
 */
export function generateRandomString(length) {
  let str = '';
  const alphabet = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  for (let i = 0; i < length; i += 1) {
    str += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return str;
}

/**
 * @description get the current date and time for the dashboard
 * @returns {string} current date in format of mm/dd/yyyy at XX:XX XM
 */
export function getDate() {
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${month}/${day}/${year} at ${time}`;
}
