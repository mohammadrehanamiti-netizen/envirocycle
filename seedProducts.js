import mongoose from "mongoose";
import Product from "./Models/Product.js";

// Connect to DB
mongoose.connect("mongodb://localhost:27017/Project", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected for seeding"))
  .catch((err) => console.error("❌ Connection error:", err));

// Product Data Array
const products = [
  {
    name: "Recycled Lamps",
    description: "Made from Recycled Plastics",
    price: 2999,
    image: "./images/RecycledLamps.jpg",
  },
  {
    name: "Packing Material",
    description: "Made from Recycled papers",
    price: 499,
    image: "./images/PackingMaterial.jpg",
  },
  {
    name: "Bamboo Water Bottle",
    description: "Bottle Made From Bamboo",
    price: 999,
    image: "./images/waterbottles.jpg",
  },
  {
    name: "Packing Material (Variant)",
    description: "Made from Recycled papers",
    price: 699,
    image: "./images/RecycledPackaging.jpg",
  },
  {
    name: "Pencils",
    description: "Recycled Pencils made from papers",
    price: 99,
    image: "./images/RecycledPenciles.jpg",
  },
  {
    name: "Bamboo Water Glasses",
    description: "Glasses Made From Bamboo",
    price: 199,
    image: "./images/Glass.jpg",
  },
  {
    name: "Eco-friendly Bag",
    description: "Made from Recycled tree waste",
    price: 599,
    image: "./images/Bag.jpg",
  },
  {
    name: "Plant Stand",
    description: "Stand Made From Recycled Plastic",
    price: 799,
    image: "./images/plantstand.jpg",
  },
  {
    name: "Recycled Stools",
    description: "Made from Recycled Plastics",
    price: 499,
    image: "./images/stool.jpg",
  },
  {
    name: "Recycled Writing Tables",
    description: "Made from Recycled Plastics",
    price: 599,
    image: "./images/tabel.jpg",
  },
  {
    name: "Bottle Jars",
    description: "Made from Reused Bottles",
    price: 149,
    image: "./images/Jar.jpg",
  },
];

// Insert Products
async function seedProducts() {
  try {
    await Product.deleteMany(); // Clears old products
    await Product.insertMany(products);
    console.log("🌱 Products seeded successfully!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    mongoose.disconnect();
  }
}

seedProducts();
