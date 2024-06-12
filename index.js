const express = require("express");
const path = require("path");
const { Storage } = require('@google-cloud/storage');
const bodyParser = require('body-parser');
const multer = require('multer');
const basicAuth = require('basic-auth');
const app = express();

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'keys.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '200mb' })); // Increase limit to 200MB
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

const port = process.env.PORT || 4000;
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "frame-src 'self' https://www.google.com");
    next();
});

const storage = new Storage({
    projectId: 'audiototext-424517', // Specify the project ID
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS // Path to your service account key file
});
const bucketName = 'storing-audio-for-my-project';

// Multer configuration for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 200 * 1024 * 1024 } // Limit file size to 200MB
});

// Basic authentication middleware
const adminAuth = (req, res, next) => {
    const user = basicAuth(req);
    if (!user || user.name !== 'admin' || user.pass !== 'password') {
        res.set('WWW-Authenticate', 'Basic realm="example"');
        return res.status(401).send('Authentication required.');
    }
    next();
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/atlier', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'atlier.html'));
});
app.get('/listing', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'listing.html'));
});
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/products', async (req, res) => {
    try {
        const [file] = await storage.bucket(bucketName).file('products.json').download();
        const data = file.toString('utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading products file:', err);
        res.status(500).send('Error reading products file');
    }
});

app.get('/listing/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const [file] = await storage.bucket(bucketName).file('products.json').download();
        const data = file.toString('utf8');
        const products = JSON.parse(data);
        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.sendFile(path.join(__dirname, 'views', 'car-single.html'));
    } catch (err) {
        console.error('Error reading products file:', err);
        res.status(500).send('Error reading products file');
    }
});

// Admin routes with authentication
app.get('/admin', adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.post('/admin/add', adminAuth, upload.single('pimage'), async (req, res) => {
    const newProduct = req.body;
    try {
        const [file] = await storage.bucket(bucketName).file('products.json').download();
        const data = file.toString('utf8');
        const products = JSON.parse(data);
        newProduct.id = (products.length + 1).toString();

        if (req.file) {
            const blob = storage.bucket(bucketName).file(`images/${Date.now()}-${req.file.originalname}`);
            const blobStream = blob.createWriteStream();
            blobStream.end(req.file.buffer);
            await new Promise((resolve, reject) => {
                blobStream.on('finish', resolve);
                blobStream.on('error', reject);
            });
            newProduct.pimage = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
        }
        products.push(newProduct);
        await storage.bucket(bucketName).file('products.json').save(JSON.stringify(products, null, 2));
        res.status(201).send('Product added successfully');
    } catch (err) {
        console.error('Error updating products file:', err);
        res.status(500).send('Error updating products file');
    }
});

app.post('/admin/add-display-image/:id', adminAuth, upload.single('display_image'), async (req, res) => {
    const productId = req.params.id;
    try {
        const [file] = await storage.bucket(bucketName).file('products.json').download();
        const data = file.toString('utf8');
        const products = JSON.parse(data);
        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        if (req.file) {
            const blob = storage.bucket(bucketName).file(`images/${Date.now()}-${req.file.originalname}`);
            const blobStream = blob.createWriteStream();
            blobStream.end(req.file.buffer);
            await new Promise((resolve, reject) => {
                blobStream.on('finish', resolve);
                blobStream.on('error', reject);
            });
            product.display_image = product.display_image || [];
            product.display_image.push(`https://storage.googleapis.com/${bucketName}/${blob.name}`);
        }
        await storage.bucket(bucketName).file('products.json').save(JSON.stringify(products, null, 2));
        res.status(201).send('Display image added successfully');
    } catch (err) {
        console.error('Error updating products file:', err);
        res.status(500).send('Error updating products file');
    }
});

app.put('/admin/update/:id', adminAuth, upload.single('pimage'), async (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body;
    try {
        const [file] = await storage.bucket(bucketName).file('products.json').download();
        const data = file.toString('utf8');
        let products = JSON.parse(data);
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            return res.status(404).send('Product not found');
        }
        updatedProduct.id = productId;

        if (req.file) {
            const blob = storage.bucket(bucketName).file(`images/${Date.now()}-${req.file.originalname}`);
            const blobStream = blob.createWriteStream();
            blobStream.end(req.file.buffer);
            await new Promise((resolve, reject) => {
                blobStream.on('finish', resolve);
                blobStream.on('error', reject);
            });
            updatedProduct.pimage = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
        }
        products[productIndex] = updatedProduct;
        await storage.bucket(bucketName).file('products.json').save(JSON.stringify(products, null, 2));
        res.send('Product updated successfully');
    } catch (err) {
        console.error('Error updating products file:', err);
        res.status(500).send('Error updating products file');
    }
});

app.delete('/admin/delete/:id', adminAuth, async (req, res) => {
    const productId = req.params.id;
    try {
        const [file] = await storage.bucket(bucketName).file('products.json').download();
        const data = file.toString('utf8');
        let products = JSON.parse(data);
        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        const deleteFile = async (filePath) => {
            await storage.bucket(bucketName).file(filePath).delete();
            console.log(`Deleted file: ${filePath}`);
        };
        if (product.pimage) {
            await deleteFile(product.pimage.replace(`https://storage.googleapis.com/${bucketName}/`, ''));
        }
        if (product.display_image && product.display_image.length > 0) {
            for (const imagePath of product.display_image) {
                await deleteFile(imagePath.replace(`https://storage.googleapis.com/${bucketName}/`, ''));
            }
        }
        products = products.filter(p => p.id !== productId);
        await storage.bucket(bucketName).file('products.json').save(JSON.stringify(products, null, 2));
        res.send('Product deleted successfully');
    } catch (err) {
        console.error('Error updating products file:', err);
        res.status(500).send('Error updating products file');
    }
});

app.get('/view-products', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'view-products.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
