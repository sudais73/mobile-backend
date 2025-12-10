
import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.model.js";

// export const createProduct = async (req, res) => {
//   try {
//     const { title, description, price} = req.body;
    

//     const response = await cloudinary.uploader.upload_stream(
//       { folder: "products" },
//       (error, result) => {
//         if (error) return res.status(500).json({ success: false, msg: error.message });

//         const newProducts = new Product({
//           title,
//           description,
//           price,
//           image: result.secure_url
//         });

//         newProducts.save().then(() => {
//           res.status(201).json({ success: true, newProducts });
//         });
//       }
//     );

//     response.end(req.file.buffer);
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//     console.log(error.message)
//   }
// };


// import Product from "../models/product.model.js";
// import cloudinary from "../utils/cloudinary.js";

export const addProduct = async (req, res) => {
  try {
    // No file uploaded
    if (!req.file) {
      return res.status(400).json({ msg: "Image is required" });
    }

    // Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error) {
          console.log("Upload error:", error);
          return res.status(500).json({ msg: "Cloudinary upload failed" });
        }

        // Save in DB
        const product = new Product({
          title: req.body.title,
          description: req.body.description,
          price: req.body.price,
          image: result.secure_url,
      
        });

        product.save();

        return res.json({
          msg: "Product created successfully",
          product,
        });
      }
    );

    // write file buffer
    uploadRes.end(req.file.buffer);

  } catch (error) {
    console.log("Controller error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// GET ALL PRODUCTS

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


// GET SINGLE PRODUCT

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


// UPDATE PRODUCT

export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Product not found" });

    res.json({
      msg: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// DELETE PRODUCT

export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ msg: "Product not found" });

    res.json({
      msg: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
