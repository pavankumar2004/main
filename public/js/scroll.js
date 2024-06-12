// scroll.js
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector('a[href="#services"]').addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetElement = document.getElementById('services');
        
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
