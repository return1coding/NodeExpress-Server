// import required packages
const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const app = express();
const rateLimit = require("express-rate-limit");
const { db } = require('./firebase');
const fetch = require('node-fetch');
const bodyParser = require("body-parser");

//imports for MongoDB and Humanity's TODO
const mongoose = require('mongoose');
const Todo = require('./toDoSchema');
// const { dbURI } = require('./dbURI');



async function callMe(ipString) {
  return fetch(`http://ip-api.com/json/${ipString}`)
    .then(response => response.json())
    .then(data => data)
}

function tellMeEverything(string) {
  fs.appendFile('./whoCame.log', string, () => {
    console.log("Data Logged!")
  })
}

//log started time to screen
var started = new Date().getTime() / 1000;
console.log(`Server started at time ${started}`);

//rate limiter for project
const projectLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  message: {
    status: "declined to projects",
    reason: "too many requests"
  }
});

//rate limiter for work experience
const workLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  message: {
    status: "declined to work experiences",
    reason: "too many requests"
  }
});

//get data from firebase collection passed in as string
async function getData(collectionName) {
  var listToReturn = [];
  var collectionPointer = db.collection(collectionName);
  await collectionPointer.get().then((snapshot) => {
    const collectionPointerObjects = snapshot.docs;
    for (const d of collectionPointerObjects) {
      listToReturn.push(d.data());
    }
  })
  return listToReturn;
}

// clearing work data
function clearWorkData() {
  workExperiences = [];
}

// clearing project data
function clearProjectData() {
  projectList = [];
}

function gimmeSomeTime() {
  return Date();
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect("mongodb+srv://humanitytodo:uJ2PRBW5JckjoxwM@cluster0.ec2ig.gcp.mongodb.net/humanity-todo?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => console.log("Connected to MongoDB for Humanity's TODO"))
  .catch((err) => console.log(err));


// create a route for /projects
app.get('/projects', projectLimiter, async (req, res) => {
  clearProjectData();
  console.log("project data cleared")
  await getData("Projects").then((returnedList) => {
    res.send(returnedList);
    const myString = callMe(req.ip)
      .then((data) => {
        console.log(data)
        activityString =
          `
-----------${gimmeSomeTime()}-----------
Response sent to ${req.ip}
Details of visitor:
${data.country} 
${data.regionName} 
${data.city} 
`
        console.log(activityString);
        tellMeEverything(activityString);
      });


  })

});

app.get('/potato', projectLimiter,  (req, res) => {
  res.send("potato!!!");
});

// create a route for /workexperiences
app.get('/workexperiences', workLimiter, async (req, res) => {
  clearWorkData();
  await getData("WorkExperiences").then((returnedList) => {
    res.send(returnedList);
    const myString = callMe(req.ip)
      .then((data) => {
        console.log(data)
        activityString =
          `
-----------${gimmeSomeTime()}-----------
Response sent to ${req.ip}
Details of visitor:
${data.country} 
${data.regionName} 
${data.city} 
`
        console.log(activityString);
        tellMeEverything(activityString);
      });
  })
});

//create routes for MongoDB and Humanity's TODO
app.post('/submit-todo', (req, res) => {
  var submitTitle = req.body.title;
  const myString = callMe(req.ip)
    .then((data) => {
      const rawDate = new Date();
      const submitDateString = `${rawDate.getUTCDate()}/${rawDate.getUTCMonth() + 1}/${rawDate.getUTCFullYear()}`
      const todo = new Todo({
        title: submitTitle,
        from: data.country,
        time: submitDateString
      });
      todo.save();
    });

})

app.get('/get-all-todos', (req, res) => {
  Todo.find().sort({ createdAt: -1 })
    .then((result) => {
      res.send({result})
    })
    .catch((err) => {
      console.log(err);
    })
})


// Listen both http & https ports
const httpServer = http.createServer(app);
const httpsServer = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/justinevm.ddns.net/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/justinevm.ddns.net/fullchain.pem'),
}, app);

httpServer.listen(80, () => {
  console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});