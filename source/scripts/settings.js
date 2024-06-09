const dom = {};

function initDialog(message, confirmText, showCancel) {
  dom.prompt.innerText = message;
  dom.confirmBtn.style.display = showCancel ? 'inline' : 'none';
  dom.cancelBtn.innerText = confirmText;
  dom.dialog.showModal();
}

export function alertDialog(message) {
  initDialog(message, 'Ok', false);
  const handleConfirm = () => {
    dom.dialog.close();
    dom.cancelBtn.removeEventListener('click', handleConfirm);
  };
  dom.cancelBtn.addEventListener('click', handleConfirm);
}

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

export function initSettings() {
  dom.dialog = document.querySelector('dialog');
  dom.confirmBtn = document.querySelector('.dialog-confirm');
  dom.cancelBtn = document.querySelector('.dialog-cancel');
  dom.prompt = document.querySelector('.dialog-prompt');
}
