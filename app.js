const cheerio = require('cheerio');
const axios = require('axios');
const url = require('url');
require('dotenv').config();

let links = [];
let linksObject = [];


const getLinks = (response) => { 
    const $ = cheerio.load(response.data);
    const anchortags = $('a');   
    $(anchortags).each(function(i,tag){
        const link = $(tag).attr('href');
        if(link.startsWith('https://medium.com')) {

            // Create Object
            const url = new URL(link);
            const baseUrl = url.origin + url.pathname;
            let params = [];
            url.searchParams.forEach((value, property) => {
                params.push(property);
            });

            // Check if object exists
            const presentLink = linksObject.find(object => {
                if(object.url == baseUrl){
                    return object;
                }
            });

            // Update old object
            if(presentLink){
                presentLink.count++;
                params.forEach( param => {
                    if(!presentLink.params.includes(param))
                        presentLink.params.push(param);
                });
            // Insert newly created Object
            } else {
                linksObject.push({
                    url : baseUrl,
                    count : 1,
                    params : params
                });
            }
            links.push(link);
        }
    });
    console.log(links);
    console.log(linksObject);
};


const hyperlinkCrawler = (url) => {
        axios.get(url)
        .then(response => {
            getLinks(response);
            let promises = [];
            for(let i = 0 ; i < links.length ; i++){
                if(promises.length < 5) {
                    //check in db
                    promises.push(axios.get(links[i]));
                }
                else {
                    Promise.all(promises)
                    .then(results => {
                        results.forEach(result => {
                            getLinks(result);
                        });
                        i--;
                        promises = [];
                    });
                }
            }
        });
};

// Main Function Call
hyperlinkCrawler(process.env.url);
