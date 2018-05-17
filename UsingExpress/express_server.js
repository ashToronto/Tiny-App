
// Test with: http://localhost:8080/urls
// http://localhost:8080/urls/new

var express = require("express"); // Enables ejs using require
var app = express(); // ejs definition is needed alot so we define it in var
var PORT = process.env.PORT || 8080; // set a default port
app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require("cookie-parser") // Cookie
app.use(cookieParser()) // Set cookie

var urlDatabase = { // Hardcoded data object
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls",(req, res) => {  // Table with both short and long URL's
  let templateVars = {urls: urlDatabase,
  username: req.cookies["username"]};
  res.render("urls_index", templateVars)
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => { // FORM and Submit
  console.log('this baby', req.cookies["username"])
  let templateVars = { shortURL: req.params.id, urls: urlDatabase,
  username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { // Connect Short url to full version;
  let templateVars = { shortURL: req.params.id, urls: urlDatabase,
  username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => { // DELETE url's from Table
  const id = req.params.id;
  const erase = urlDatabase[id]

  if (erase){
    delete urlDatabase[id]
  }
  res.redirect('/urls')
});

// app.post("/urls", (req, res) => {
//   console.log(req.body);  // debug statement to see POST parameters
//   res.send("Ok");         // Respond with 'Ok' (we will replace this)

// });

app.post("/urls", (req, res) => {
  var a = req.body.longURL;
  var b = generateRandomString();
  urlDatabase[b] = a;
  console.log(urlDatabase)
  res.redirect('/urls/' + b)
});

function generateRandomString() {
  var generate = "";
  var randomChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i <= 6; i ++){
    generate += randomChar.charAt((Math.floor(Math.random() * randomChar.length)));

  }
   return generate;
}

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:upd", (req, res) => { // Updates any changes to urls you want to edit
  const upd = req.params.upd;
  const long = urlDatabase[upd];
  urlDatabase[upd] = req.body.input;
  if (long){
  res.redirect("/urls")
  }
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username)
  res.redirect("/urls");
});


