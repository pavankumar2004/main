document.addEventListener('DOMContentLoaded', () => {
    const productId = window.location.pathname.split('/').pop();
    let http = new XMLHttpRequest();
    http.open('get', '/products', true);
    http.send();

    http.onload = function() {
        if (this.readyState === 4 && this.status === 200) {
            const products = JSON.parse(this.responseText);
            const product = products.find(p => p.id === productId);

            if (product) {
                // Replace full stops with line breaks in the options
                const formattedOptions = product.options.split('.').join('<br>');

                let output = `
                <div class="product-card">
                    <div class="product-hero" style="color: rgb(255, 191, 0);">
                        <h1 class="product" style="color:rgb(255, 191, 0);">${product.modele} - ${product.price}€</h1>
                        <img class="product-main-image" src="${product.pimage}" alt="${product.modele}">
                    </div>
                    <p class="highlight-text">Ne manquez pas cette occasion de posséder une voiture de qualité supérieure ! Faites confiance à MARIN MOTOR pour trouver le véhicule de vos rêves.</p>
                    <div class="product-details container-fluid px-0">
                        <div class="row g-0">
                            <!-- First column -->
                            <div class="col-lg-6 product-specs">
                                <h2 class="section-title">Caractéristiques</h2>
                                <p>
                                    <span class="label">Marque:</span> ${product.marque}
                                </p>   
                                <p>
                                    <span class="label">Modèle:</span> ${product.modele}    
                                </p>
                                <p>
                                    <span class="label">Année:</span> ${product.Annee}
                                </p>   
                                <p>
                                    <span class="label">Kilométrage:</span> ${product.Kilometrage}    
                                </p>      
                                <p>
                                    <span class="label">Carburant:</span> ${product.Carburant}
                                </p>   
                                <p>
                                    <span class="label">Puissance:</span> ${product.puissance}    
                                </p>
                                <p>
                                    <span class="label">Moteur:</span> ${product.moteur}
                                </p>   
                                <p>
                                    <span class="label">Boîte:</span> ${product.boite}    
                                </p>
                            </div>
                            <!-- Second column -->
                            <div class="col-lg-6 product-options">
                                <h2 class="section-title">Options Incluses</h2>
                                <p>${formattedOptions}</p>
                            </div>  
                        </div>
                    </div>
                    <div class="product-gallery">
                        <h2>Photos</h2>
                        <div class="product-images">
                            ${product.display_image.map(img => `<a href="${img}" data-lightbox="product-gallery" data-title="${product.modele}"><img class="product-thumb" src="${img}" alt="${product.modele}"></a>`).join('')}
                        </div>
                    </div>
                    <p class="contact-info">Pour plus d'informations ou pour planifier un essai routier, contactez-nous au 080.550.080 ou envoyez-nous un email à l'adresse <a href="mailto:marin.motor17@gmail.com">marin.motor17@gmail.com</a>.</p>
                </div>                       
                `;
                document.querySelector(".car-details").innerHTML = output;
            } else {
                document.querySelector(".car-details").innerHTML = '<p>Product not found</p>';
            }
        }
    }
});
