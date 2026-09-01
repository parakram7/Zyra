document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('medicineForm');
    const confirmation = document.getElementById('confirmation');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Basic validation already handled by HTML 'required' attributes
        confirmation.classList.remove('hidden');
        form.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
