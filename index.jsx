const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_KEY);

const app = express();

// ========== MIDDLEWARE ==========
app.use(cors({ origin: "http://localhost:5173" })); // Frontend URL
app.use(express.json()); // Parse JSON bodies

// ========== TEST ROUTE ==========
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// ========== CREATE PAYMENT INTENT ==========
app.post("/payments/create", async (req, res) => {
  try {
    const total = Number(req.query.total);

    if (!total || total <= 0) {
      return res.status(400).json({ error: "Invalid total amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total, // in cents
      currency: "usd",
      // optional: automatic payment methods (Stripe auto-detects card type)
      automatic_payment_methods: { enabled: true },
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
