const express = require("express");
const fs = require("fs");
const app = express();
const multer = require("multer");
const path = require("path");
const pdf = require("pdf-parse");
const now = Date.now();
const crypto = require("crypto");
const PDFGenerator = require("pdfkit");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${now}.pdf`);
  },
});
const upload = multer({ storage: storage });

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
app.post("/upload", upload.single("ebook"), function (req, res) {
  const absolutePath = path.join(__dirname, req.file.path);
  const key = "XemtPEQxgyZkqVrQfWKqw9IEV+iD3hE+ELTCBb61GZ4="
  fs.readFile(absolutePath, function (err, data) {
    if (err) {
      return console.log(err);
    }
    try {
      var cipher = crypto.createCipher("aes-256-cbc", key);
      var text = data;
      var crypted = cipher.update(text, "utf8", "hex");
      crypted += cipher.final("hex");
      fs.writeFileSync(absolutePath, crypted);
    } catch (error) {
      console.log(`can't encrypt file : ${error}`);
    }
  });
  res.json({
    status: true,
  });
});

app.get("/download/:filename", function (req, res) {
  const { filename } = req.params;
  const absolutePath = path.join(__dirname, `uploads/${filename}`);
  const algorithm = "aes-192-cbc";
  const key = "XemtPEQxgyZkqVrQfWKqw9IEV+iD3hE+ELTCBb61GZ4="
  fs.readFile(absolutePath, function (err, data) {
    if (err) {
      return console.log(err);
    }
    try {
      var decipher = crypto.createDecipher("aes-256-cbc", key);
      var dec = decipher.update(data.toString(), "hex", "binary");
      dec += decipher.final("binary");
      var buffer = new Buffer(dec, "binary");
      fs.writeFileSync(absolutePath, buffer);
      return;
    } catch (error) {
      console.log(`can't decrypt file`);
    }
  });
  res.json({
    status: false,
  });
});
app.listen(8000, function () {
  console.log("App running on port 5555");
});
