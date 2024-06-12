// scroll.js
    document.querySelector('a[href="#services"]').addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetElement = document.getElementById('services');
        
        if (targetElement) {
            if ('scrollBehavior' in document.documentElement.style) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                targetElement.scrollIntoView(true);
            }
        }
    });
