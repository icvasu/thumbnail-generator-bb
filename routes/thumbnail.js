const AWS = require('aws-sdk');
const moment = require('moment');
const { v4 } = require('uuid');
const puppeteer = require('puppeteer');
const fs = require('fs');

const { Router } = require("express");
const express = require("express");
const router = express.Router();
require('dotenv').config()
const S3_ACCESS_KEY_ID=process.env.S3_ACCESS_KEY_ID
const S3_SECRET_ACCESS_KEY=process.env.S3_SECRET_ACCESS_KEY
const S3_REGION=process.env.S3_REGION
const S3_BUCKET=process.env.S3_BUCKET

const renderHead = () => {
  return `
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.2.6/gsap.min.js"></script>
    <script src="minified/DrawSVGPlugin.min.js"></script>
    <style>
    
    @import url('https://fonts.googleapis.com/css2?family=Jost:ital,wght@1,300&family=Oswald&family=Playfair+Display:ital,wght@1,600&family=Poppins:wght@300&display=swap');
    .brand_logodiv{
      position: absolute;
      top: 2%;
      left: 83%;
    }
    .titlediv{
        position: absolute;
        right: 7%;
        top:8%;
        height: auto;
        width: 30%;
        z-index: 999;
    }
    .fullnamediv{
        position: absolute;
        right: 12%;
        top:52%;
        height: auto;
        width: auto;
        z-index: 999;
    }
    .datediv{
        position: absolute;
        right:56%;
        top:85%;
        height: auto;
        width: 350px;
        text-align: center;
        z-index: 999;
    }
    .title{
        color: #ffffff;
        font-size: 45px;
        font-family: 'Roboto', cursive;
        width: auto;
    }
    .fullname{
        color: #ffffff;
        font-size: 32px;
        font-family: 'Roboto', cursive;
    }
    .date{
        color: #000000;
        font-size: 30px;
        font-family: 'Roboto', cursive;
    }
    .avatardiv{
      position: absolute;
      top: 10%;
      left: 1.5%;
  }
  .avatar{
      border-radius: 100%;
      height:400px;
      width: 400px;
  }
  .brand_logo{
    height:40px;
    width: 120px;
}
  </style>
    </head>
  `;
};

const renderBody = (post) => {
  // Define the list of variables as an array
var bgList = [
  // "https://bigbuddystore.s3.ap-south-1.amazonaws.com/thumbnail-templates/1.1.jpg",
  // "https://bigbuddystore.s3.ap-south-1.amazonaws.com/thumbnail-templates/1.2.jpg", 
  // "https://bigbuddystore.s3.ap-south-1.amazonaws.com/thumbnail-templates/1.3.jpg", 
  // "https://bigbuddystore.s3.ap-south-1.amazonaws.com/thumbnail-templates/1.4.jpg", 
  // "https://bigbuddystore.s3.ap-south-1.amazonaws.com/thumbnail-templates/1.5.jpg"
  "https://bigbuddystore.s3.ap-south-1.amazonaws.com/thumbnail-templates/4.1.jpeg"
];
const currentDate = new Date();


const formattedDate = currentDate.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

// Select a random index from bgList
var randomBgIndex = Math.floor(Math.random() * bgList.length);

// Store the selected variable in a custom variable
var custom_image = bgList[randomBgIndex];


  const { title, avatar, full_name , brand_logo} = post;
  return `
  <body style="margin: 0; padding: 0; height: 100vh;">
    <div style="height: 100%; display: flex; justify-content: center; align-items: center;">
      <img src="${custom_image}" style="max-width: 100%; max-height: 100%;" />
    </div>
    <div class="titlediv">
        <h1 class="title">${title}</h1>
    </div>
    <div class="fullnamediv">
        <h1 class="fullname">${full_name}</h1>
    </div>
    <div class="datediv">
        <h1 class="date">${formattedDate}</h1>
    </div>
    <div class="avatardiv">
    <img src="${avatar}" class="avatar" />
</div>
<div class="brand_logodiv">
    <img src="${brand_logo}" class="brand_logo" />
</div>
  </body>
`;
};

const getImageHtml = (post) => {
  return `
    <html lang="en">
      ${renderHead()}
      ${renderBody(post)}
    </html>
  `;
};


const s3 = new AWS.S3({
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
    region: S3_REGION,
  });
  const createImage = async (post) => {
    // const browser = await puppeteer.launch({           //For Server
      // executablePath: '/usr/bin/chromium-browser',     //For Server
                // args: ["--no-sandbox"]                 //For Server
    // });                                                //For Server
    const browser = await puppeteer.launch();             //For Localhost
    const page = await browser.newPage();
  
    try {
      const fileName = `${v4()}.png`;
  
      await page.setContent(getImageHtml(post));
  
      const content = await page.$('body');
      const imageBuffer = await content.screenshot({ omitBackground: false });
      let randomnumber = Math.floor((Math.random() * 100000000000) + 1);
      const s3Params = {
        Bucket: S3_BUCKET,
        Key: 'thumbnails/'+randomnumber+'_'+fileName,
        Body: imageBuffer,
        ContentType: 'image/png',
        ACL: 'public-read' // Set the ACL property to 'public-read'
      };
  
      const s3Result = await s3.upload(s3Params).promise();
      const imageUrl = s3Result.Location;
  
      return { fileName, imageUrl }; // Return an object containing the filename and imageUrl
    } catch (error) {
      return '';
    } finally {
      await browser.close();
    }
  };
  
  router.post('/create', async (req, res) => {
    try {
      const data = req.body;
      const errors = {};
  
      if (!data['title'] || data['title'] === '') {
        errors['title'] = 'Title is required!';
      }
      // if (!data['custom_image'] || data['custom_image'] === '') {
      //   errors['custom_image'] = 'custom_image is required!';
      // }
  
      if (!data['avatar'] || data['avatar'] === '') {
        errors['avatar'] = 'Avatar is required!';
      }
  
      if (!data['full_name'] || data['full_name'] === '') {
        errors['full_name'] = 'Full name is required!';
      }
  
      // if (!data['creation_time'] || data['creation_time'] === '') {
      //   errors['creation_time'] = 'Creation time is required!';
      // }
  
      if (Object.keys(errors).length > 0) {
        return res.status(500).json({
          status: 'FAILED',
          message: 'Failed to create a thumbnail image for this post!',
          errors,
        });
      }
  
      const { fileName, imageUrl } = await createImage(data);
      return res.status(200).json({
        status: 'SUCCESS',
        message: 'Create a thumbnail image successfully!',
        data: { fileName, imageUrl }, // Modify the response object to include the filename and imageUrl
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 'FAILED',
        message: 'Failed to create a thumbnail image for this post!',
      });
    }
  });
  
  module.exports = router;