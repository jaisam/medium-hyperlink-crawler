# medium-hyperlink-crawler :
NodeJS Crawler which recursively crawls all hyperlinks that belong to medium.com domain.

# Technical Specifications:
This App uses :

1) Request-Promise package for HTTP operations such as Get,Post,etc.
2) Cheerio to parse,render,manipulate DOM.
3) Mongoose, a MongoDB ODM(Object Data Mapper) has also been used along with MongoDB in the database layer.

# Installation :
Clone the repository and Run the following commands in the terminal:

a) npm run install_all ( This will install the server's dependency packages).

b) npm run start (This will start the backend server. Alternatively, you can also run npm run start_dev to start the server with nodemon, which will look for the changes in the files and restart the server everytime)

# Contents of .env file :

1) url : Url that needs to be parsed. In my case , "https://www.medium.com" is used.
2) db_url : Add the url of database which will store the data.
3) cookie : Login to medium.com website and get the cookie from localstorage. Add cookie then only crawler will be able to crawl authenticated websites.
