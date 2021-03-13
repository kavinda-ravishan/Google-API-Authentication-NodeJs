const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
//Google Auth
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "267857511778-mabt57720vp19977r76i23j84cpoeh6u.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

dotenv.config();
const PORT = process.env.PORT || 5000;

//Middleware
app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const userid = payload["sub"];
  const { name, email, picture } = payload;
  console.log(payload);
  console.log(name);

  return { name: name, email: email, picture: picture };
}
function checkAuthenticated(req, res, next) {
  const token = req.cookies["session-token"];
  verify(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      res.redirect("/login");
    });
}

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const token = req.body.token;
  console.log(token);
  verify(token)
    .then(() => {
      res.cookie("session-token", token);
      res.send("success");
    })
    .catch(console.error);
});
app.get("/logout", (req, res) => {
  res.clearCookie("session-token");
  res.redirect("/login");
});

app.use("/dashboard", checkAuthenticated, (req, res) => {
  const user = req.user;
  res.render("dashboard", { user });
});

app.use("/protectedroute", checkAuthenticated, (req, res) => {
  res.render("protectedroute");
});

app.listen(PORT, () => {
  console.log(`Server running on PORT : ${PORT}`);
});
