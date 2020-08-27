const cheerio = require('cheerio');
const axios = require('axios');
const url = require('url');
const mongoose = require('mongoose');
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

    // Main Function Call
    hyperlinkCrawler();
})
.catch(err => {
    console.log('**** err in mongoose connect ****');
    console.log(err)
});


const crawlAndParseUrl = (url) => { 
    return new Promise(function (resolve, reject) {
        axios.get(url)
        .then(response => {
            const $ = cheerio.load(response.data);
            const anchortags = $('a');
            $(anchortags).each(function(i,tag){
                const link = $(tag).attr('href');
                if(link.startsWith('https://medium.com')) {
 
                    // Create URL Object
                    const newUrl = new URL(link);
                    const linkObj = { 
                    url : newUrl.origin + newUrl.pathname,
                    count : 1,
                    params : []
                    };
                    newUrl.searchParams.forEach((value, property) => {
                        linkObj.params.push(property);
                    });
 
                    // Check if object exists
                    let existingLinkObj = globalLinksObjectArray.find(object => {
                        if(object.url == linkObj.url){
                            return object;
                        }
                    });

                    let paramMismatch = false;
                    if(existingLinkObj){
                        // Update old object  
                        existingLinkObj.count++;
                        linkObj.params.forEach( param => {
                            if(!existingLinkObj.params.includes(param)) {
                                existingLinkObj.params.push(param);
                                paramMismatch = true;
                            }
                        }); 
                    } else {
                        // Insert newly created Object
                        globalLinksObjectArray.push(linkObj);
                        paramMismatch = true;
                    }
 
                    if(paramMismatch) globalLinksArray.push(link);
 
                }
            });
            console.log('************** globalLinksArray **************', globalLinksArray);
            console.log('************** globalLinksObjectArray **************', globalLinksObjectArray);
            
            return resolve();
        })
        .catch(err => {
            console.log('******** err in crawlAndPraseUrl ********');
            console.log(err);
            return reject(err);
        })
    });
};


const hyperlinkCrawler = async (url) => {
    let  urlPromisesList = [];
    globalLinksArray.push(process.env.url);
    
    for(let i = 0 ; i <= globalLinksArray.length ; i++){
        if( urlPromisesList.length >= limit || i == globalLinksArray.length ) {
            const response = await Promise.all(urlPromisesList);
                i--;
                urlPromisesList = [];
        }
        else {
            urlPromisesList.push(crawlAndParseUrl(globalLinksArray[i]));
        }
    }
};
