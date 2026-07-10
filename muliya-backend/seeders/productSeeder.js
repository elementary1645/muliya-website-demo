import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDatabase from "../config/db.js";
import Product from "../models/Product.js";

import products from "../data/products.js";

dotenv.config();

connectDatabase();

const importProducts = async () => {
  try {
    await Product.deleteMany();

    await Product.insertMany(products);

    console.log("Products imported successfully.");

    process.exit();
  } catch (error) {
    console.error(`Product import failed: ${error.message}`);

    process.exit(1);
  }
};

const destroyProducts = async () => {
  try {
    await Product.deleteMany();

    console.log("Products deleted successfully.");

    process.exit();
  } catch (error) {
    console.error(`Product deletion failed: ${error.message}`);

    process.exit(1);
  }
};

if (process.argv[2] === "--destroy") {
  destroyProducts();
} else {
  importProducts();
}