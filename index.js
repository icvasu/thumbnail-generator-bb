const express = require('express');
const bodyParser = require('body-parser');
const app = express();


app.use(bodyParser.json());

let cors = require("cors");
var corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
  );
  app.use(cors(corsOptions));
  app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


const thumbnailRoute = require('./routes/thumbnail')


app.use('/thumbnail',thumbnailRoute)

app.get('/',(req,res)=>{return res.json("Thumbnail Generator Backend Running.")})
const port = process.env.PORT || 3030;
app.listen(port, () => console.log(`Server listening on port ${port}`));
