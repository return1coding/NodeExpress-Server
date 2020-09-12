const fetch = require('node-fetch');


async function sendStringToIPAPI(string) {
    const myData = await fetch(string)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
            return data;
        })
    return myData;
}

async function ipAPICaller() {
    const myNum = await sendStringToIPAPI('http://ip-api.com/json/::ffff:42.236.10.117').then((data) => {
        return data;
    })
    return myNum;
}

ipAPICaller().then((num) => {
    console.log(num);
    console.log("hello");
})