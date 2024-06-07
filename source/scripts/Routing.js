/*
 * Routing.js mainly stores the central pageData that is referenced from multiple places.
 * created solely to avoid dependency cycles
 *
 * Functions inside this file:
 *   - updateURL()
 */

// Page Data reference to minimize initializeDB calls among other variables
/* eslint-disable-next-line */
export let pageData = {
  database: null,
  noteID: null,
  editEnabled: false,
  tagDB: null,
  tags: [], // use this to keep track of which new tags are being pushed to addtags.
  theme: 'light',
};

/**
 * @description Updates the URL to signify page changing.
 *              Window eventlisteners will automatically detect the change.
 *
 * @param {String} urlString "" for dashboard for "?id={number}" for edit page.
 * @returns {void} this function does not return a value.
 */
export function updateURL(urlString) {
  const path = window.location.pathname;
  window.history.pushState({}, null, path + urlString);
  window.dispatchEvent(new Event('popstate'));
}
