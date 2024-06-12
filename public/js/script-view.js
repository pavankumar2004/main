fetch('/api/products')
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
    }
    return response.json();
})
.then(products => {
    console.log('Products fetched:', products);
    if (!Array.isArray(products)) {
        throw new Error('Expected an array but got: ' + typeof products);
    }
    const tableBody = document.getElementById('productsTable').getElementsByTagName('tbody')[0];
    products.forEach(product => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = product.id;
        row.insertCell(1).textContent = product.marque;
        row.insertCell(2).textContent = product.modele;
        row.insertCell(3).textContent = product.Annee;
        row.insertCell(4).textContent = product.Kilometrage;
        row.insertCell(5).textContent = product.Carburant;
        row.insertCell(6).textContent = product.puissance;
        row.insertCell(7).textContent = product.moteur;
        row.insertCell(8).textContent = product.boite;
        row.insertCell(9).textContent = product.options;
        row.insertCell(10).textContent = product.price;
        
        const pimageCell = row.insertCell(11);
        const pimage = document.createElement('img');
        pimage.src = product.pimage;
        pimage.alt = 'Product Image';
        pimage.onerror = () => console.error('Failed to load image:', product.pimage);
        pimageCell.appendChild(pimage);
        
        const displayImagesCell = row.insertCell(12);
        displayImagesCell.className = 'display-images';
        product.display_image.forEach(imagePath => {
            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = 'Display Image';
            img.onerror = () => console.error('Failed to load image:', imagePath);
            displayImagesCell.appendChild(img);
        });
    });
})
.catch(error => console.error('Error fetching products:', error));
