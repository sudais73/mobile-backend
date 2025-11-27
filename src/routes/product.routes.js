import express from 'express';
const router = express.Router();

// Sample route for creating a product
router.post('/', (req, res) => {
  // Product creation logic here
  res.status(201).json({ message: 'Product created successfully' });
});

// Sample route for fetching all products
router.get('/', (req, res) => {
  // Fetching products logic here
  res.status(200).json({ products: [] });
}); 
export default router;