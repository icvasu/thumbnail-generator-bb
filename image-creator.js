const moment = require('moment');
const { v4 } = require('uuid');
const puppeteer = require('puppeteer');
const fs = require('fs');

const renderHead = () => {
  return `
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.2.6/gsap.min.js"></script>
    <script src="minified/DrawSVGPlugin.min.js"></script>
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap');
    .titlediv{
        position: absolute;
        right: 11%;
        top:35%;
        height: auto;
        width: 30%;
        z-index: 999;
    }
    .fullnamediv{
        position: absolute;
        right: 8%;
        top:68%;
        height: auto;
        width: auto;
        z-index: 999;
    }
    .datediv{
        position: absolute;
        right: -3%;
        top:21%;
        height: auto;
        width: 350px;
        text-align: center;
        z-index: 999;
    }
    .title{
        color: #ffffff;
        font-size: 45px;
        font-family: 'Alfa Slab One', cursive;
        width: auto;
    }
    .fullname{
        color: #ffffff;
        font-size: 32px;
        font-family: 'Alfa Slab One', cursive;
    }
    .date{
        color: #ffffff;
        font-size: 30px;
        font-family: 'Alfa Slab One', cursive;
    }
    .avatardiv{
      position: absolute;
      top: 14.5%;
      left: 5.5%;
  }
  .avatar{
      border-radius: 100%;
      height:400px;
      width: 400px;
  }
  </style>
    </head>
  `;
};

const renderBody = (post) => {
  const { title, avatar, full_name, creation_time,custom_image } = post;

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
        <h1 class="date">${creation_time}</h1>
    </div>
    <div class="avatardiv">
        <img src="${avatar}" class="avatar" />
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

const createImage = async (post) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    const fileName = `${v4()}.png`;

    await page.setContent(getImageHtml(post));

    const content = await page.$('body');
    const imageBuffer = await content.screenshot({ omitBackground: false });

    fs.writeFileSync(`./public/${fileName}`, imageBuffer);

    return fileName;
  } catch (error) {
    return '';
  } finally {
    await browser.close();
  }
};

module.exports = {
  createImage,
};
