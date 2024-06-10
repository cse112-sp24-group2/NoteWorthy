/*
 * settings.js provides custom popup dialogs
 *
 * Functions inside this file:
 *  - initDialog()
 *  - alertDialog()
 *  - confirmDialog()
 *  - initSettings()
 */

/**
 * @description Object containing DOM elements used for dialog manipulation.
 * @type {Object}
 */
const dom = {};

/**
 * @description Initializes a dialog with the provided message and confirmation text.
 *
 * @param {string} message - The message to be displayed in the dialog.
 * @param {string} confirmText - The text for the confirmation button.
 * @param {boolean} showCancel - Indicates whether to show the cancel button.
 * @returns {void} This function does not return a value.
 */
function initDialog(message, confirmText, showCancel) {
  dom.prompt.innerText = message;
  dom.confirmBtn.style.display = showCancel ? 'inline' : 'none';
  dom.cancelBtn.innerText = confirmText;
  dom.dialog.showModal();
}

/**
 * @description Displays an alert dialog with the given message.
 *
 * @param {string} message - The message to be displayed in the alert dialog.
 * @returns {void} This function does not return a value.
 */
export function alertDialog(message) {
  initDialog(message, 'Ok', false);
  const handleConfirm = () => {
    dom.dialog.close();
    dom.cancelBtn.removeEventListener('click', handleConfirm);
  };
  dom.cancelBtn.addEventListener('click', handleConfirm);
}

/**
 * @description Displays a confirmation dialog with the given message.
 *
 * @param {string} message - The message to be displayed in the confirmation dialog.
 * @returns {Promise<boolean>} A promise that resolves with a boolean value indicating the user's choice (true for confirmation, false for cancellation).
 */
export function confirmDialog(message) {
  return new Promise((resolve) => {
    initDialog(message, 'Yes', true);
    const handleConfirm = () => {
      dom.dialog.close();
      resolve(true);
      dom.confirmBtn.removeEventListener('click', handleConfirm);
    };
    const handleCancel = () => {
      dom.dialog.close();
      resolve(false);
      dom.cancelBtn.removeEventListener('click', handleCancel);
    };
    dom.confirmBtn.addEventListener('click', handleConfirm);
    dom.cancelBtn.addEventListener('click', handleCancel);
  });
}

/**
 * @description Initializes the settings dialog by selecting DOM elements for dialog manipulation.
 *
 * @returns {void} This function does not return a value.
 */
export function initSettings() {
  dom.dialog = document.querySelector('dialog');
  dom.confirmBtn = document.querySelector('.dialog-confirm');
  dom.cancelBtn = document.querySelector('.dialog-cancel');
  dom.prompt = document.querySelector('.dialog-prompt');
}
