const express = require('express');
const app = express();
const port = 3000;

const cors = require('cors');  /* Import Cors */

app.use(cors());     /* Enable CORS for all routes */   /* Middle ware */

const products = [
  { id: 1, name: 'Product 1', price: 10 },
  { id: 2, name: 'Product 2', price: 20 },
  { id: 3, name: 'Product 3', price: 30 },
];

app.get('/products', (req, res)=>{   /* Cors uses /products to display all products */
    res.json(products);
})


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});