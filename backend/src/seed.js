require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");
const Product = require("./models/Product");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://gadgiriddhi_db_user:Bhumi2205@bhumigold.kyqigbs.mongodb.net/BhumiGold?retryWrites=true&w=majority";
console.log("Connecting to:", process.env.MONGO_URI);

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not defined in .env");
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log("🗑 Cleared existing data");

    /* =========================
       CATEGORIES (6)
    ========================== */

    const necklaces = await Category.create({
      name: "Necklaces",
      slug: "necklaces",
      allowedMetals: ["gold", "silver"],
      allowedVariants: ["18k", "22k", "traditional"],
      isGift: false,
      images: ["https://example.com/cat-necklace.png"],
    });

    const rings = await Category.create({
      name: "Rings",
      slug: "rings",
      allowedMetals: ["gold", "silver", "rose"],
      allowedVariants: ["18k", "22k", "925"],
      isGift: false,
      images: ["https://example.com/cat-rings.png"],
    });

    const goldEarrings = await Category.create({
      name: "Gold Earrings",
      slug: "gold-earrings",
      allowedMetals: ["gold"],
      allowedVariants: ["18k", "22k"],
      isGift: false,
      images: ["https://example.com/cat-earrings.png"],
    });

    const silverBracelets = await Category.create({
      name: "Silver Bracelets",
      slug: "silver-bracelets",
      allowedMetals: ["silver"],
      allowedVariants: ["925"],
      isGift: false,
      images: ["https://example.com/cat-bracelets.png"],
    });

    const roseGoldCollection = await Category.create({
      name: "Rose Gold",
      slug: "rose-gold",
      allowedMetals: ["rose"],
      allowedVariants: ["18k"],
      isGift: true,
      images: ["https://example.com/cat-rose.png"],
    });

    const giftItems = await Category.create({
      name: "Gift Items",
      slug: "gift-items",
      allowedMetals: ["gold", "silver"],
      allowedVariants: ["18k", "925"],
      isGift: true,
      images: ["https://example.com/cat-gift.png"],
    });

    console.log("✅ Categories created");

    /* =========================
       PRODUCTS (32)
    ========================== */

    await Product.insertMany([
      /* --- Necklaces (6) --- */
      {
        name: "18K Gold Chain",
        category: necklaces._id,
        metalType: "gold",
        variant: "18k",
        weightGrams: 20,
        makingCharge: 2000,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 5,
        images: ["https://example.com/p1.jpg"],
        description: "Elegant gold chain",
      },
      {
        name: "22K Bridal Necklace",
        category: necklaces._id,
        metalType: "gold",
        variant: "22k",
        weightGrams: 45,
        makingCharge: 4500,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 2,
        images: ["https://example.com/p2.jpg"],
        description: "Heavy bridal necklace",
      },
      {
        name: "Silver Traditional Necklace",
        category: necklaces._id,
        metalType: "silver",
        variant: "traditional",
        weightGrams: 30,
        makingCharge: 1800,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 4,
        images: ["https://example.com/p3.jpg"],
        description: "Traditional silver necklace",
      },
      {
        name: "Gold Layered Necklace",
        category: necklaces._id,
        metalType: "gold",
        variant: "18k",
        weightGrams: 28,
        makingCharge: 2600,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 3,
        images: ["https://example.com/p4.jpg"],
        description: "Layered gold necklace",
      },
      {
        name: "Silver Coin Necklace",
        category: necklaces._id,
        metalType: "silver",
        variant: "traditional",
        weightGrams: 35,
        makingCharge: 2100,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 2,
        images: ["https://example.com/p5.jpg"],
        description: "Coin style silver necklace",
      },
      {
        name: "Minimal Gold Necklace",
        category: necklaces._id,
        metalType: "gold",
        variant: "18k",
        weightGrams: 15,
        makingCharge: 1200,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 6,
        images: ["https://example.com/p6.jpg"],
        description: "Minimal everyday necklace",
      },

      /* --- Rings (6) --- */
      {
        name: "22K Gold Ring",
        category: rings._id,
        metalType: "gold",
        variant: "22k",
        weightGrams: 6,
        makingCharge: 700,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 8,
        images: ["https://example.com/r1.jpg"],
        description: "Classic gold ring",
      },
      {
        name: "Silver Engagement Ring",
        category: rings._id,
        metalType: "silver",
        variant: "925",
        weightGrams: 5,
        makingCharge: 500,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 10,
        images: ["https://example.com/r2.jpg"],
        description: "Silver engagement ring",
      },
      // {
      //   name: "Rose Gold Band",
      //   category: rings._id,
      //   metalType: "rose",
      //   variant: "18k",
      //   weightGrams: 4,
      //   makingCharge: 600,
      //   makingChargeType: "fixed",
      //   gstPercent: 3,
      //   stockQty: 7,
      //   images: ["https://example.com/r3.jpg"],
      //   description: "Rose gold band ring",
      // },
      {
        name: "Designer Gold Ring",
        category: rings._id,
        metalType: "gold",
        variant: "18k",
        weightGrams: 7,
        makingCharge: 1100,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 4,
        images: ["https://example.com/r4.jpg"],
        description: "Designer gold ring",
      },
      {
        name: "Minimal Silver Ring",
        category: rings._id,
        metalType: "silver",
        variant: "925",
        weightGrams: 3,
        makingCharge: 350,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 12,
        images: ["https://example.com/r5.jpg"],
        description: "Minimal silver ring",
      },
      {
        name: "Traditional Gold Ring",
        category: rings._id,
        metalType: "gold",
        variant: "22k",
        weightGrams: 8,
        makingCharge: 1400,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 3,
        images: ["https://example.com/r6.jpg"],
        description: "Traditional gold ring",
      },

      /* --- Gold Earrings (8) --- */
      {
        name: "Classic Gold Earrings",
        category: goldEarrings._id,
        metalType: "gold",
        variant: "18k",
        weightGrams: 7,
        makingCharge: 1200,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 8,
        images: ["https://example.com/e1.jpg"],
        description: "Classic gold earrings",
      },
      {
        name: "Gold Jhumka",
        category: goldEarrings._id,
        metalType: "gold",
        variant: "22k",
        weightGrams: 11,
        makingCharge: 2600,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 4,
        images: ["https://example.com/e2.jpg"],
        description: "Traditional jhumka",
      },
      {
        name: "Gold Studs",
        category: goldEarrings._id,
        metalType: "gold",
        variant: "18k",
        weightGrams: 5,
        makingCharge: 900,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 10,
        images: ["https://example.com/e3.jpg"],
        description: "Minimal gold studs",
      },
      {
        name: "Designer Gold Drops",
        category: goldEarrings._id,
        metalType: "gold",
        variant: "18k",
        weightGrams: 9,
        makingCharge: 1900,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 6,
        images: ["https://example.com/e4.jpg"],
        description: "Designer gold drop earrings",
      },
      {
        name: "Temple Gold Earrings",
        category: goldEarrings._id,
        metalType: "gold",
        variant: "22k",
        weightGrams: 13,
        makingCharge: 3100,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 2,
        images: ["https://example.com/e5.jpg"],
        description: "Temple jewellery earrings",
      },
      {
        name: "Pearl Gold Earrings",
        category: goldEarrings._id,
        metalType: "gold",
        variant: "18k",
        weightGrams: 8,
        makingCharge: 1600,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 5,
        images: ["https://example.com/e6.jpg"],
        description: "Pearl embedded earrings",
      },
      {
        name: "Antique Gold Earrings",
        category: goldEarrings._id,
        metalType: "gold",
        variant: "22k",
        weightGrams: 12,
        makingCharge: 2800,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 3,
        images: ["https://example.com/e7.jpg"],
        description: "Antique gold earrings",
      },
      {
        name: "Daily Wear Gold Earrings",
        category: goldEarrings._id,
        metalType: "gold",
        variant: "18k",
        weightGrams: 6,
        makingCharge: 1000,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 9,
        images: ["https://example.com/e8.jpg"],
        description: "Daily wear gold earrings",
      },

      /* --- Silver Bracelets (6) --- */
      {
        name: "Classic Silver Bracelet",
        category: silverBracelets._id,
        metalType: "silver",
        variant: "925",
        weightGrams: 14,
        makingCharge: 700,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 6,
        images: ["https://example.com/b1.jpg"],
        description: "Classic silver bracelet",
      },
      {
        name: "Designer Silver Bracelet",
        category: silverBracelets._id,
        metalType: "silver",
        variant: "925",
        weightGrams: 18,
        makingCharge: 1200,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 4,
        images: ["https://example.com/b2.jpg"],
        description: "Designer silver bracelet",
      },
      {
        name: "Silver Kada",
        category: silverBracelets._id,
        metalType: "silver",
        variant: "925",
        weightGrams: 22,
        makingCharge: 1500,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 3,
        images: ["https://example.com/b3.jpg"],
        description: "Heavy silver kada",
      },
      {
        name: "Minimal Silver Bracelet",
        category: silverBracelets._id,
        metalType: "silver",
        variant: "925",
        weightGrams: 12,
        makingCharge: 600,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 9,
        images: ["https://example.com/b4.jpg"],
        description: "Minimal silver bracelet",
      },
      {
        name: "Oxidized Silver Bracelet",
        category: silverBracelets._id,
        metalType: "silver",
        variant: "925",
        weightGrams: 16,
        makingCharge: 950,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 5,
        images: ["https://example.com/b5.jpg"],
        description: "Oxidized silver bracelet",
      },
      {
        name: "Chain Style Silver Bracelet",
        category: silverBracelets._id,
        metalType: "silver",
        variant: "925",
        weightGrams: 15,
        makingCharge: 800,
        makingChargeType: "fixed",
        gstPercent: 3,
        stockQty: 7,
        images: ["https://example.com/b6.jpg"],
        description: "Chain style bracelet",
      },
    ]);

    console.log("✅ 32 Products created");
    console.log("🎉 Seeding completed successfully!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

seed();
