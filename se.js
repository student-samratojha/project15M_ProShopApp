// seed/productSeed.js

const mongoose = require("mongoose");

const Product = require("./src/db/models/product.model");
const Category = require("./src/db/models/category.model");
const Employee = require("./src/db/models/user.model");

require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const seedProducts = async () => {
  try {
    // old products delete
    await Product.deleteMany();

    // fetch category dynamically
    const categories = await Category.find();

    if (categories.length === 0) {
      console.log("No Categories Found");
      process.exit();
    }

    // fetch employees dynamically
    const employees = await Employee.find({role:"employee"});

    if (employees.length === 0) {
      console.log("No Employees Found");
      process.exit();
    }

    const products = [
      {
        name: "iPhone 15 Pro Max",
        slug: "iphone-15-pro-max",
        description:
          "Latest Apple flagship smartphone with A17 Pro chip and titanium design.",
        shortDescription: "Apple premium flagship phone",
        price: 149999,
        discountPrice: 139999,
        category: categories[0]._id,
        brand: "Apple",
        sku: "APL-IP15PM",
        stock: 15,
        sold: 5,
        images: [
          "https://example.com/iphone1.jpg",
          "https://example.com/iphone2.jpg",
        ],
        thumbnail: "https://example.com/iphone-thumb.jpg",
        colors: ["Black", "Silver", "Blue"],
        sizes: ["256GB", "512GB"],
        tags: ["mobile", "apple", "iphone"],
        rating: 4.8,
        numReviews: 120,
        weight: 240,
        dimensions: {
          length: 16,
          width: 7,
          height: 1,
        },
        shippingCharge: 200,
        warranty: "1 Year Apple Warranty",
        returnPolicy: "7 Days Return",
        isFeatured: true,
        isAvailable: true,
        status: "active",
        metaTitle: "Buy iPhone 15 Pro Max",
        metaDescription: "Best Apple flagship phone",
      },

      {
        name: "Samsung Galaxy S25 Ultra",
        slug: "samsung-galaxy-s25-ultra",
        description:
          "Powerful Samsung flagship smartphone with AI camera system.",
        shortDescription: "Samsung premium flagship",
        price: 129999,
        discountPrice: 119999,
        category: categories[0]._id,
        brand: "Samsung",
        sku: "SMSNG-S25U",
        stock: 20,
        sold: 8,
        images: [
          "https://example.com/samsung1.jpg",
          "https://example.com/samsung2.jpg",
        ],
        thumbnail: "https://example.com/samsung-thumb.jpg",
        colors: ["Titanium Gray", "Black"],
        sizes: ["256GB", "1TB"],
        tags: ["mobile", "samsung", "android"],
        rating: 4.7,
        numReviews: 90,
        weight: 230,
        dimensions: {
          length: 16,
          width: 8,
          height: 1,
        },
        shippingCharge: 150,
        warranty: "1 Year Samsung Warranty",
        returnPolicy: "10 Days Return",
        isFeatured: true,
        isAvailable: true,
        status: "active",
        metaTitle: "Samsung Galaxy S25 Ultra",
        metaDescription: "Samsung AI flagship phone",
      },

      {
        name: "Sony WH-1000XM5",
        slug: "sony-wh1000xm5",
        description:
          "Industry-leading noise canceling wireless headphones.",
        shortDescription: "Sony premium headphones",
        price: 29999,
        discountPrice: 25999,
        category: categories[0]._id,
        brand: "Sony",
        sku: "SONY-XM5",
        stock: 40,
        sold: 12,
        images: [
          "https://example.com/sony1.jpg",
          "https://example.com/sony2.jpg",
        ],
        thumbnail: "https://example.com/sony-thumb.jpg",
        colors: ["Black", "Silver"],
        sizes: ["Standard"],
        tags: ["headphones", "sony", "wireless"],
        rating: 4.9,
        numReviews: 240,
        weight: 180,
        dimensions: {
          length: 20,
          width: 18,
          height: 8,
        },
        shippingCharge: 100,
        warranty: "1 Year Warranty",
        returnPolicy: "7 Days Return",
        isFeatured: false,
        isAvailable: true,
        status: "active",
        metaTitle: "Sony XM5 Headphones",
        metaDescription: "Best noise canceling headphones",
      },

      {
        name: "Nike Air Max 270",
        slug: "nike-air-max-270",
        description:
          "Comfortable and stylish sneakers for daily wear.",
        shortDescription: "Nike stylish sneakers",
        price: 12999,
        discountPrice: 10999,
        category: categories[0]._id,
        brand: "Nike",
        sku: "NIKE-AM270",
        stock: 35,
        sold: 15,
        images: [
          "https://example.com/nike1.jpg",
          "https://example.com/nike2.jpg",
        ],
        thumbnail: "https://example.com/nike-thumb.jpg",
        colors: ["White", "Black", "Red"],
        sizes: ["7", "8", "9", "10"],
        tags: ["shoes", "nike", "sneakers"],
        rating: 4.5,
        numReviews: 70,
        weight: 500,
        dimensions: {
          length: 30,
          width: 12,
          height: 10,
        },
        shippingCharge: 80,
        warranty: "No Warranty",
        returnPolicy: "5 Days Return",
        isFeatured: true,
        isAvailable: true,
        status: "active",
        metaTitle: "Nike Air Max 270",
        metaDescription: "Comfortable Nike sneakers",
      },

      {
        name: "ASUS ROG Strix G16",
        slug: "asus-rog-strix-g16",
        description:
          "High-performance gaming laptop with RTX graphics.",
        shortDescription: "Gaming laptop",
        price: 189999,
        discountPrice: 179999,
        category: categories[0]._id,
        brand: "ASUS",
        sku: "ASUS-ROG-G16",
        stock: 10,
        sold: 3,
        images: [
          "https://example.com/asus1.jpg",
          "https://example.com/asus2.jpg",
        ],
        thumbnail: "https://example.com/asus-thumb.jpg",
        colors: ["Black"],
        sizes: ["16-inch"],
        tags: ["laptop", "gaming", "asus"],
        rating: 4.9,
        numReviews: 55,
        weight: 2200,
        dimensions: {
          length: 35,
          width: 25,
          height: 3,
        },
        shippingCharge: 300,
        warranty: "2 Years Warranty",
        returnPolicy: "7 Days Return",
        isFeatured: true,
        isAvailable: true,
        status: "active",
        metaTitle: "ASUS ROG Strix G16",
        metaDescription: "Powerful gaming laptop",
      },
    ];

    await Product.insertMany(products);

    console.log("✅ 5 Products Seeded Successfully");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

seedProducts();