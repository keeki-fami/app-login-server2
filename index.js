const http = require("http");
const jwt = require("jsonwebtoken"); //??
const appleSignin = require("apple-signin-auth");
require('dotenv').config();
const PORT = process.env.PORT || 8080;

const SECRET_KEY = process.env.Jwt_Secret;
const APPLE_CLIENT_ID = process.env.Apple_Client_Id;

http.createServer((req,res)=>{
  if(req.method==="POST" && req.url==="/appleSignIn"){
    let body = "";
    
    //postされたデータを受け取る
    req.on("data",chunk=>{
        body += chunk;
    });
    console.log(`body for data:\(body)`);

    req.on("end",async ()=>{
	try{
          const {identityToken, nonce} = JSON.parse(body);
          
	  //Appleトークンの検証
	  const payload = await appleSignin.verifyIdToken(identityToken,{
	    audience:APPLE_CLIENT_ID,
	    nonce: nonce,
	  });
	  console.log("Expected nonce (raw):",nonce);

	  //JWTトークンの生成
	  const token = jwt.sign(
	    {
	      sub:payload.sub,
	      email:payload.email,
	    },
	    SECRET_KEY,
	    {expiresIn: "1h"}
	  );

          res.writeHead(200,{
	    "Content-Type":"application/json"
	  });
	  console.log("Token nonce (decoded):",payload.nonce);
	  //res.write(`Apple ID sub:${payload.sub}\n`);
	  res.end(JSON.stringify({token}));
	}catch(e){
	  console.error("verifyIdToken error:", e);
	  res.writeHead(400,{
            "Content-Type":"application/json"
          });	
	  res.end(JSON.stringify({error:"invalid request"}));
	}
    });
  }else{
    res.writeHead(404,{
        "Content-Type":"application/json"
    });
    res.end("Not Found");
  }

}).listen(PORT,()=>{
	console.log(`running on ${PORT}`);
});
