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

// create a route for /projects
app.get('/projects', projectLimiter, async (req, res) => {
  clearProjectData();
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