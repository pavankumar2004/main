    document.addEventListener('DOMContentLoaded', () => {
        let http = new XMLHttpRequest();
        http.open('get', '/products', true);
        http.send();

        http.onload = function() {
            if (this.readyState === 4 && this.status === 200) {
                let products = JSON.parse(this.responseText);
                let output = "";
                for (let item of products) {
                    output += `
                        <div class="product">
                            <img style="border-radius: 15px;" src="${item.pimage}" alt="${item.description}">
                            <p style="margin-top:10px"><span class="text-primary">${item.marque} ${item.modele}</span></p>
                            <p>${item.Annee} ${item.puissance} ${item.Carburant} ${item.Kilometrage}</p>
                            <p><span class="text-primary" style="margin-right:20px">${item.price}&euro;</span></p>
                            <a href="/listing/${item.id}" style="border-radius:15px;" class="btn btn-dark">Details</a>
                        </div>
                    `;
                }
                document.querySelector(".products").innerHTML = output;
            }
        }
    });
