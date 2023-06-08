# Thumbnail Generator
Creating Thumbnail using Node.js

## How to run 
yarn
npm start

## Postman : 
POST : http://localhost:3030/thumbnail/create

Body : 
{
    "title": "Enter your Title",
    "avatar": "Enter Avatar Link",
    "full_name": "Enter Author Name",
    "creation_time": "Enter Date"
}



## Env
1. Create .env file in root directory
2. Copy all data from env.example into .env
3. Insert your Aws Credentials.