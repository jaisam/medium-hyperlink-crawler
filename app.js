const cheerio = require('cheerio');
const axios = require('axios');
const url = require('url');
const mongoose = require('mongoose');
const Link = require('./Models/linkModel');
require('dotenv').config();

let limit = 5;
let globalLinksArray = [];
let globalLinksObjectArray = [];


// Connecting to Database
mongoose.connect(process.env.db_url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
})
.then(async () => {
    console.log(`Connected to DB!`);

    // Deleting old records generated by running this script, If not done it will give unique key error
    Link.deleteMany({})
    .then(response => {
        console.log('No of Deleted Records ', response.n);

        // Main Function Call
        hyperlinkCrawler();
    })
    .catch(err => console.log(err));
})
.catch(err => {
    console.log('**** err in mongoose connect ****');
    console.log(err)
});


// Helper Function
const crawlAndParseUrl = async (url) => {
    let paramMismatch = false;

    console.log('----------------------------------------');
    console.log('Before await Link.findOne ', url);

    let dbLinkObj = await Link.findOne({
        url: url
    });

    let dbPromise;
    
    console.log('+++++++++++++++++++++++++++++++++++++++++');
    console.log('After await Link.findOne', url);
    console.log('dbLinkObj ', dbLinkObj);

    // Create URL Object
    const newUrl = new URL(url);
    const linkObj = { 
        url : newUrl.origin + newUrl.pathname,
        count : 1,
        params : []
    };
    newUrl.searchParams.forEach((value, property) => {
        linkObj.params.push(property);
    });

    // console.log('linkObj ', linkObj);

    if(dbLinkObj) {
        // Update old object  
        dbLinkObj.count++;
        linkObj.params.forEach( param => {
            if(!dbLinkObj.params.includes(param)) {
                dbLinkObj.params.push(param);
                paramMismatch = true;
            }
        });
        dbPromise = dbLinkObj.save();
        console.log('Saving Object', dbPromise);
    } else {
        paramMismatch = true;
        dbPromise = Link.create(linkObj);
        console.log('Creating Object ', dbPromise);
    }
    
    console.log('-------------------------------------');
    console.log('Before await dbPromise ', url);

    // return dbPromise;
    const record = await dbPromise;

    console.log('+++++++++++++++++++++++++++++++++++++++++');
    console.log('After awaiting dbPromise ', url );
    console.log('record =>', record);
    console.log('paramMismatch =>', paramMismatch);

    if(paramMismatch){

        console.log('----------------------------------------');
        console.log('Before await axios', url);

        let response = await axios.get(url);
        
        console.log('+++++++++++++++++++++++++++++++++++++++++');
        console.log('After await axios', url);

        const $ = cheerio.load(response.data);
        const anchortags = $('a');
        $(anchortags).each(function(i,tag){
            const link = $(tag).attr('href');
            if(link.startsWith('https://medium.com')) {
    
                // Create URL Object
                // const newUrl = new URL(link);
                // const linkObj = { 
                // url : newUrl.origin + newUrl.pathname,
                // count : 1,
                // params : []
                // };
                // newUrl.searchParams.forEach((value, property) => {
                //     linkObj.params.push(property);
                // });
    
                // Check if object exists
                // let existingLinkObj = globalLinksObjectArray.find(object => {
                //     if(object.url == linkObj.url){
                //         return object;
                //     }
                // });
    
                // let paramMismatch = false;
                // if(existingLinkObj){
                //     // Update old object  
                //     existingLinkObj.count++;
                //     linkObj.params.forEach( param => {
                //         if(!existingLinkObj.params.includes(param)) {
                //             existingLinkObj.params.push(param);
                //             paramMismatch = true;
                //         }
                //     }); 
                // } else {
                //     // Insert newly created Object
                //     globalLinksObjectArray.push(linkObj);
                //     paramMismatch = true;
                // }
    
                globalLinksArray.push(link);
            }
        });

        console.log('************** globalLinksArray **************', globalLinksArray);
        // console.log('************** globalLinksObjectArray **************', globalLinksObjectArray);
    }
};


// Driver Function
const hyperlinkCrawler = async (url) => {
    let  urlPromisesList = [];
    globalLinksArray.push(process.env.url);
    
    for(let i = 0 ; i <= globalLinksArray.length ; i++){
        if( urlPromisesList.length >= limit || i == globalLinksArray.length ) {
            console.log('####### Inside ELSE ####### i is ' + i + ' globalLinksArray.length ' + globalLinksArray.length);
            const response = await Promise.all(urlPromisesList);
            console.log('After Promise.all ');
            i--;
            urlPromisesList = [];
        }
        else {
            urlPromisesList.push(crawlAndParseUrl(globalLinksArray[i]));
            console.log('******** Inside IF ***** i is ' + i + ' globalLinksArray.length ' + globalLinksArray.length);
        }
    }
};
