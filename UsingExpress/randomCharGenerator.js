function generateRandomString() {
  var generate = "";
  var randomChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i <= 6; i ++){
    generate += randomChar.charAt((Math.floor(Math.random() * randomChar.length)));

  }
   return console.log(generate);
}

generateRandomString()