const express = require("express");
const jwt = require("jsonwebtoken");
const appleSignin = require("apple-signin-auth");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

const SECRET_KEY = process.env.Jwt_Secret;
const APPLE_CLIENT_ID = process.env.Apple_Client_Id;

// JSONのボディをパースするミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // この行を追加

// POST /appleSignIn エンドポイント
app.post("/appleSignIn", async (req, res) => {
  try {

    console.log("Received body from Apple:", req.body);
    //const { identityToken, nonce } = req.body;
    const identityToken = req.body.id_token;
    const nonce = req.body.nonce;
    
    if (!identityToken || !nonce) {
      return res.status(400).json({ error: "Missing identityToken or nonce" });
    }

    // Appleトークンの検証
    const payload = await appleSignin.verifyIdToken(identityToken, {
      audience: APPLE_CLIENT_ID,
      nonce: nonce,
    });

    console.log("Decoded JWT payload:", payload);
    console.log("SECRET_KEY:", SECRET_KEY);

    // JWTの生成
    const token = jwt.sign(
      {
        sub: payload.sub,
        email: payload.email,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token, success: true });
  } catch (e) {
    console.error("verifyIdToken error:", e);
    res.status(400).json({ error: "Invalid request", success: false });
  }
});

// 404ハンドリング（他のルートはNot Found）
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});

// 404ハンドリング（他のルートはNot Found）
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


