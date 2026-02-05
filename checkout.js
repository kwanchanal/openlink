const walletInput = document.getElementById('wallet');
const detailInput = document.getElementById('detail');
const messageInput = document.getElementById('message');
const receiveToggle = document.getElementById('receive');
const previewName = document.getElementById('preview-name');
const previewDetail = document.getElementById('preview-detail');

const defaultName = 'Kwanchanae Geographic';
const defaultDetail = 'Scuba Diving School and Recreation\nlocated in Koh Tao, Thailand';

function updatePreview() {
  const detail = detailInput.value.trim();
  const message = messageInput.value.trim();

  previewName.textContent = detail ? detail.split(',')[0].slice(0, 40) : defaultName;

  if (!receiveToggle.checked) {
    previewDetail.textContent = defaultDetail;
    return;
  }

  if (message) {
    previewDetail.textContent = message;
  } else if (detail) {
    previewDetail.textContent = detail;
  } else {
    previewDetail.textContent = defaultDetail;
  }
}

[walletInput, detailInput, messageInput, receiveToggle].forEach((el) => {
  el.addEventListener('input', updatePreview);
  el.addEventListener('change', updatePreview);
});

updatePreview();

const copyButtons = document.querySelectorAll('[data-copy]');
copyButtons.forEach((btn) => {
  btn.addEventListener('click', async () => {
    const selector = btn.getAttribute('data-copy');
    const target = document.querySelector(selector);
    if (!target) return;

    try {
      await navigator.clipboard.writeText(target.value);
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1200);
    } catch (err) {
      console.error('Copy failed', err);
    }
  });
});
