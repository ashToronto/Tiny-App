// Test with: http://localhost:8080/urls
// http://localhost:8080/urls/new

var express = require("express"); // Enables ejs using require
var app = express(); // ejs definition is needed alot so we define it in var
var PORT = process.env.PORT || 8080; // set a default port
app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
 extended: true
}));
var cookieParser = require("cookie-parser") // Cookie
app.use(cookieParser()) // Set cookie

// ****************************** DATABASE STATEMENTS *******************

var urlDatabase = { // URL object storing
 "b2xVn2": {
  longURL: "http://www.lighthouselabs.ca",
  userID: "userRandomID"
 },
 "9sm5xK": {
  longURL: "http://www.google.com",
  userID: "user2RandomID"
 }
};

const users = { // User Object that stores ID + name + password
 "userRandomID": {
  id: "userRandomID",
  email: "user@example.com",
  password: "purple-monkey-dinosaur"
 },
 "user2RandomID": {
  id: "user2RandomID",
  email: "user2@example.com",
  password: "dishwasher-funk"
 }
}

// ****************************** UTILITY FUNCTIONS  *******************
function generateRandomString() {
  var generate = "";
  var randomChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i <= 6; i ++){
    generate += randomChar.charAt((Math.floor(Math.random() * randomChar.length)));

  }
   return generate;
}


// ****************************** GET REQUESTS *******************
app.get("/urls", (req, res) => { // Table with both short and long URL's
 if (req.cookies["user_id"]) {
  let userUrl = {} // NEW OBJECT THAT STORES USERS PERSONEL URLS REFER TO THIS FROM NOW ON < < < <
  for (j in urlDatabase) {
   if (urlDatabase[j].userID === req.cookies["user_id"]) {
    userUrl[j] === urlDatabase[j];
   }
  }
  let templateVars = {
   urls: userUrl,
   username: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars)
 } else {
  // res.status(401).send("Error not your data please login with the correct account")
  res.redirect("/register")
 }
});

app.get("/urls/new", (req, res) => { // FORM and Submit Add to list
 if (req.cookies["user_id"]) {
  let userUrl = {} // NEW OBJECT THAT STORES USERS PERSONEL URLS REFER TO THIS FROM NOW ON < < < <
  for (j in urlDatabase) {
   if (urlDatabase[j].userID === req.cookies["user_id"]) {
    userUrl[j] === urlDatabase[j];
   }
  }
  let templateVars = {
   urls: userUrl,
   username: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars)
 } else {
  // res.status(401).send("Error not your data please login with the correct account")
  res.redirect("/register")
 }
});

app.get("/urls/:id", (req, res) => { // Connect Short url to full version;
 let templateVars = {
  shortURL: req.params.id,
  urls: urlDatabase,
  username: req.cookies["user_id"]
 };
 res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
 let longURL = urlDatabase[req.params.shortURL]
 res.redirect(longURL);

 if (!req.cookies["user_id"]){
  res.status(404).send('Error: 404: Login first');
 }
 res.redirect("/login")
});

app.get("/register", (req, res) => { // Registration Form Rendering/generating
 let templateVars = {
  shortURL: req.params.id,
  username: req.cookies["user_id"]
 };
 res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => { // Registration Form 2 Step 6
 var templateVars = {
  urls: urlDatabase,
  username: req.cookies["user_id"]
 };
 res.render("login", templateVars);

});

// ****************************** POST RESPONSE *******************

app.post("/urls", (req, res) => {
 var a = {
  longURL: req.body.longURL,
  userID: req.cookies["user_id"]
 }
 var b = generateRandomString();
 urlDatabase[b] = a;
 console.log(urlDatabase)
 res.redirect('/urls/' + b)
});

app.post("/urls/:id/delete", (req, res) => { // DELETE url's from Table
 const id = req.params.id;
 const erase = urlDatabase[id].userID
 if (erase === req.cookies["user_id"]) {
  delete urlDatabase[id]
 }
 res.redirect('/urls')
});

app.post("/urls/:upd", (req, res) => { // Updates any changes to urls you want to edit
 const upd = req.params.upd;
 const long = urlDatabase[upd];
 urlDatabase[upd] = req.body.input;
 if (long) {
  res.redirect("/urls")
 }
});

app.post("/logout", (req, res) => { // Logout
 res.clearCookie('user_id', req.body.user_id)
 res.redirect("/urls");
});

app.post("/register", (req, res) => { // Registration Form creating cookies and saving them + generating random ID
 var templateVars = {
  urls: urlDatabase,
  username: req.cookies["user_id"]
 };
 if (req.body.email === null || req.body.password === null) {
  res.status(400).send("Enter a valid E-mail and password")
  return;
 }
 for (i in users) {
  if (users[i].email === req.body.email) {
   res.status(400).send("User already exists")
   return;
  }
 }
 let generateNum = generateRandomString();
 users[generateNum] = {
  id: generateNum,
  email: req.body.email,
  password: req.body.password
 } // Registring add user
 console.log(users)
 res.cookie('user_id', generateNum)
 res.redirect("/urls");
});

app.post("/login", (req, res) => { // Posting the login Assumes registration is done splitting registring from emailing
 for (i in users) {
  if (users[i].email === req.body.email && users[i].password === req.body.password) {
   // TODO: Need to log the user in
   res.cookie('user_id', i);
   return res.redirect("urls")
  }
 }
 res.status(400).send('Invalid login');
 // <a> href="http://localhost:8080/register">Register first to login</a>
 return;
});


// ****************************** SERVER LITENING *******************

app.listen(PORT, () => {
 console.log(`Example app listening on port ${PORT}!`);
});