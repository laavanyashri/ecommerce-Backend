
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require("path");

const app = express();
//app.use(cors())
app.use(cors({
  origin: 'https://ecommerce-backend-weld-iota.vercel.app' // Allow only your frontend
}));

// Middleware
app.use(bodyParser.json());
//mongodb://localhost:27017/
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://laavanyashri:123@cluster0.ltwsm.mongodb.net/ecommercedbtest?retryWrites=true&w=majority&appName=Cluster0").then(function ()  //passkey is databse
{
  console.log("Connected to DB")
}).catch(function () {
  console.log("Failed to connect")
})

// const uri = 'mongodb://127.0.0.1:27017/ecommerceDB';
// // MongoDB Connection
// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(() =>
//   console.log("Connection Successfull"))
//   .catch(err => console.error('Error connecting to database', err));
// Define Schema
const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  date: String

});



// categorymodel

const Category = mongoose.model('Category', categorySchema)

//save category
app.post('/api/category', async (req, res) => {

  // Check if data exists in the collection
  const hasData = await Category.exists({});
  if (hasData) {
    // console.log(`Model category has data.`);
  } else {
    //if no category data then  
    await Category.insertMany(req.body)
      .then((docs) => {
        mongoose.connection.close(); // Close the connection after inserting
      })
      .catch((err) => {
        console.log("Error inserting categories:", err);
      })
  }

});


//get category by name
// Routes
app.get('/api/categorybyname/:categoryname', async (req, res) => {
  try {

    const categorydata = await Category.findOne({ name: req.params.categoryname });
    res.send(categorydata)
  } catch (err) {
    console.log("the categoryerror", err.message);
    res.status(500).json({ message: err.message });
  }
});

//products model
//products schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    name: { type: String }, // Storing category name for quick access
  }, // Reference Category model
  images: [{  _id: {  type: mongoose.Schema.Types.ObjectId, auto: true, index: true  }, imgurl: { type: String }, name: { type: String, index: true }, price: { type: String }, stock: { type: Number } }], // Array of image URLs

});

//ProductSchema.index({ "images.name": 1 });
//products model
const Products = mongoose.model('Products', ProductSchema)
Products.syncIndexes() // This ensures indexes are updated
  .then(() => console.log("Indexes synced"))
  .catch(err => console.error("Index sync error:", err));

//cart model

// Define Schema
const usercartSchema = new mongoose.Schema({
  productname: String,
  productcategory: String,
  date: String,
  imageid:mongoose.Schema.Types.ObjectId,
  userid:String,
  isRemoved: {
    type: Boolean,
    default: false
},
address:String,
paymentmode:String

});



// categorymodel

const Cart = mongoose.model('Cart', usercartSchema);
//save products
app.post('/api/products', async (req, res) => {


  // Check if data exists in the collection
  const hasData = await Products.exists({});
  if (hasData) {
  }

  else {

    await Products.insertMany(req.body)
      .then((docs) => {
        console.log("products inserted:");
      })
      .catch((err) => {
        console.log("Error inserting products:", err);
      })

    await Products.find()
      .then((docs) => {
        //  console.log("products find:", docs);
        //mongoose.connection.close(); // Close the connection after inserting
      })
      .catch((err) => {
        console.log("Error inserting products:", err);
      })
  }
});

//get products
// Routes
app.get('/api/productsbycategory/:categoryname', async (req, res) => {
  try {

    const products = await Products.find({ "category.name": req.params.categoryname });
    //  console.log("Number of products found", products);

    res.send(products)
  } catch (err) {
    console.log("the categoryerror", err.message);
    res.status(500).json({ message: err.message });
  }
});



//get filter products
// Routes
app.get('/api/filterproducts', async (req, res) => {
  try {
    const { categories } = req.query;

    let filter = {};
    if (categories) {
      filter.name = { $in: categories.split(",") };
    }

    const products = await Products.find(filter);
    res.send(products)
  } catch (err) {
    //  console.log("the categoryerror", err.message);
    res.status(500).json({ message: err.message });
  }
});

//save cart items
app.post('/api/addcartitems', async (req, res) => {


  // Check if data exists in the collection
  const hasData = await Cart.exists({});

  {
    try {
    const newOrderid = await Cart.create(req.body)

    res.send(newOrderid._id)
  } catch (err) {
    //  console.log("the categoryerror", err.message);
    res.status(500).json({ message: err.message });
  }
  }
});
//getcart count
// Routes
app.get('/api/getcartcount', async (req, res) => {
  try {

    const count = await Cart.countDocuments({});
    res.send(count.toString())
  } catch (err) {
    //  console.log("the categoryerror", err.message);
    res.status(500).json({ message: err.message });

  }
});


//removecart count
// Routes
app.delete('/api/clearcart', async (req, res) => {
  try {

    await Cart.deleteMany({});;
    res.send({ success: true, message: "All items deleted" })
  } catch (err) {
    //  console.log("the categoryerror", err.message);
    res.status(500).json({ message: err.message });

  }
});


//get cart items  
app.get('/api/getcartitems:userid', async (req, res) => {
  try {
    const user=req.params.userid;
    const Carts = await Cart.find({userid: user, isRemoved: false });
    //console.log("The carts found", Carts);
    if (!Carts) {
      res.send( { message: "No cart item found with this ID" });
  }
  else{
    res.send(Carts)
  }
  } catch (err) {
    //console.log("the categoryerror", err.message);
    res.status(500).json({ message: err.message });
  }
});


//update cart user id
//get cart items  
app.post('/api/updatecartuser', async (req, res) => {
  try {
    const{userid,cartids}=req.body;

    if (!userid || !cartids) {
      return res.status(400).json({ message: 'userid and cartitems are required' });
    }
    // Find the cart associated with the user (assuming you have a Cart model)

  
    const updatedCarts = await Cart.updateMany(
      { _id: { $in: cartids }}, // Cart documents that match the cartIds and username
      { $set: {"userid": userid  }}, // Update the documents with the newData
      { new: true } // Ensure that multiple documents are updated
    );
     // Fetch items from the database
     const cartItems = await Cart.find({ userid: userid, isRemoved: false  });
     //const cartItems = await Cart.find({ _id: { $in: cartids } });
    res.send(cartItems)
  } catch (err) {
    //console.log("the categoryerror", err.message);
    res.status(500).json({ message: err.message });
  }
});

//get products by cart items
app.get('/api/getproducts', async (req, res) => {
  try {

    const imageids = req.query.image?.split(','); // Convert query string to array
    const objectIds = imageids.map(id => new mongoose.Types.ObjectId(id));
   // console.log("The products query", objectIds);
    const filteredProducts = await Products.aggregate([
      {
        $addFields: {
          images: {
            $filter: {
              input: "$images",
              as: "image",
              cond: { $in: ["$$image._id", objectIds] }
             //cond: { $in: ["$$image.name", productsname] }

            }
          }
        }
      },
      {
        $match: { images: { $ne: [] } } // Remove products with no matching images
      }
    ]);
  //  console.log( "the filter products",filteredProducts);

    res.send(filteredProducts)
  } catch (err) {
    console.log("the categoryerror", err.message);
    res.status(500).json({ message: err.message });
  }
});



//delete image from product

app.delete('/api/deleteImageFromCart/:product', async (req, res) => {


  try {

   // const productName = decodeURIComponent(req.params.encodedName); // Decode special characters
    console.log("Decoded Product Name:", req.params.product);
    const result = await Cart.findOneAndDelete({ 'productname': req.params.product });
    res.send({ success: true, message: "Cart items deleted" })
   

  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: error.message });

  }
});


//update cart sttaus to fals
app.delete('/api/updateImageFromCart/:imageid', async (req, res) => {


  try {
console.log("the requets params",req.params.imageid)
    const updatedCart = await Cart.findOneAndUpdate(
      { imageid: req.params.imageid },
      {isRemoved:true}, // Update only the matched cart
      { new: true }
    );
   
    console.log("the updatedcart",updatedCart)
    res.send(updatedCart)

  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: error.message });

  }
});


// Start server
app.listen(5000, () => console.log('Server running on port 5000'));
