const rfqForm = document.getElementById('rfqForm');
const rfqMsg = document.getElementById('rfqMsg');
const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (rfqForm) {
  rfqForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(rfqForm);
    const name = (formData.get('name') || '').toString().trim();
    const product = (formData.get('product') || '').toString().trim();

    if (!name || !product) {
      rfqMsg.textContent = 'Please fill in the required fields.';
      rfqMsg.style.color = '#b42318';
      return;
    }

    rfqMsg.textContent = `Thanks, ${name}. Your sourcing request has been received.`;
    rfqMsg.style.color = '#1d8d5f';
    rfqForm.reset();
  });
}
