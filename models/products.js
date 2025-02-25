const mongoose = require('mongoose');

//products schema
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
      name: { type: String, required: true }, // Storing category name for quick access
    }, // Reference Category model
    images: [{ type: String }], // Array of image URLs
    price: { type: String, required: true },
    stocks:{type: Number}
  });
  

  //products model
  const Products=mongoose.model('Products',ProductSchema)


  //export product model

  module.exports=Products;

  