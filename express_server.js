// Test with: http://localhost:8080/urls
// http://localhost:8080/urls/new

var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
 extended: true
}));
var cookieSession = require("cookie-session")
app.use(cookieSession({
 name: 'session',
 keys: ['hothot'],
}))
const bcrypt = require('bcrypt');
var urlDatabase = {
 "FGcYkJk": {
  longURL: "http://www.espn.com",
  userID: "userRandomID"
 },
};

const users = {
 "userRandomID": {
  id: "userRandomID",
  email: "user@example.com",
  password: bcrypt.hashSync("password", 10)
 },
}

app.listen(PORT, () => {
 console.log(`TinyApp server is now listening on port ${PORT}!`);
});

// ******************************  URL HOME PAGE *******************

app.get("/urls", (req, res) => {
 if (req.session["user_id"]) {
  let userUrl = {}
  for (j in urlDatabase) {
   if (urlDatabase[j].userID === req.session["user_id"]) {
    userUrl[j] = urlDatabase[j];
   }
  }
  let templateVars = {
   urls: userUrl,
   username: users[req.session["user_id"]]
  };
  res.render("urls_index", templateVars)
 } else {

  res.redirect("/register")
 }
});

app.get("/urls/new", (req, res) => {
 if (req.session["user_id"]) {
  let templateVars = {
   username: req.session["user_id"]
  };
  res.render("urls_new", templateVars)
 } else {
  res.redirect("/register")
 }
});

app.get("/urls/:id", (req, res) => {

 if (!req.session["user_id"] || !(urlDatabase[req.params.id])) {
  return res.status(401).send("You are not logged in.")
 } else if (req.session["user_id"] === urlDatabase[req.params.id].userID) {
  let templateVars = {
   shortURL: req.params.id,
   urls: urlDatabase,
   username: req.session["user_id"]
  };
  return res.render("urls_show", templateVars);
 }
});

// ******************* DELETE URL FEATURE  *******************

app.post("/urls/:id/delete", (req, res) => {
 if (req.session["user_id"]) {
  const id = req.params.id;
  const erase = urlDatabase[id].userID
  if (erase === req.session["user_id"]) {
   delete urlDatabase[id]
   res.redirect('/urls')
  }
 } else {
  res.status(401).send("You are not logged-in")
 }
});

// *********************** GENERATE SHORT URL ID *****************

function generateRandomString() {
 var generate = "";
 var randomChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 for (var i = 0; i <= 6; i++) {
  generate += randomChar.charAt((Math.floor(Math.random() * randomChar.length)));

 }
 return generate;
}

app.post("/urls", (req, res) => {

 if (req.session["user_id"]) {
  var b = generateRandomString();
  urlDatabase[b] = {
   longURL: req.body.longURL,
   userID: req.session["user_id"]
  }
  res.redirect('/urls/' + b);
 } else {
  return res.status(401).send("You are not logged in.")
 }
});

// *********************** USER CUSTOM URL PAGE  *******************

// Redirects to new shortened page must use "/u?" + short URL ID to redirect to page
app.get("/u/:shortURL", (req, res) => {
 let longURL = urlDatabase[req.params.shortURL].longURL
 res.redirect(longURL);
});

// updates any changes to urls you want to edit
app.post("/urls/:shortURL", (req, res) => {
 if (req.session["user_id"]) {
  if (urlDatabase[req.params.shortURL]) {
   urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
 }
 res.redirect("/urls/" + req.params.shortURL)
});

// *********************** LOGOUT FEATURE  *******************

app.post("/logout", (req, res) => {
 req.session = null
 res.redirect("/urls");
});

// ********************* REGISTER FEATURE  *******************

app.get("/register", (req, res) => {
 let templateVars = {
  shortURL: req.params.id,
  username: req.session["user_id"]
 };
 res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
 var templateVars = {
  urls: urlDatabase,
  username: req.session["user_id"]
 };
 if (!req.body.email || !req.body.password) {
  res.status(401).send("Enter a valid E-mail and password")
  return;
 }
 for (i in users) {
  if (users[i].email === req.body.email) {
   res.status(400).send("Username already exists")
   return;
  }
 }
 let generateNum = generateRandomString();
 users[generateNum] = {
  id: generateNum,
  email: req.body.email,
  password: bcrypt.hashSync(req.body.password, 10)
 }
 req.session["user_id"] = generateNum
 res.redirect("/urls");
});

// ********************* LOGIN FEATURE  *******************

app.get("/login", (req, res) => {
 var templateVars = {
  urls: urlDatabase,
  username: req.session["user_id"]
 };
 res.render("login", templateVars);

});

//Assumes registration is complete
app.post("/login", (req, res) => {
 for (i in users) {
  if (users[i].email === req.body.email && bcrypt.compareSync(req.body.password, users[i].password)) {
   // TODO: Need to log the user in
   req.session['user_id'] = i;
   return res.redirect("urls")
  }
 }
 res.status(400).send('Invalid login go back and try again');
 return;
});