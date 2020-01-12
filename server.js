const express = require("express");
const app = express();
const port = 3210;
app.use("/", express.static(__dirname + "/public"));
app.listen(port, function() {
  console.log("Canvas Game Engine Server started on port " + port + "...");
});
