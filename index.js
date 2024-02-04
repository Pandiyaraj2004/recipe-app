const puppeteer = require('puppeteer');

//Using Express JS for Creating API(Server Running in port 3000)
const express = require('express');
const app = express();
const PORT = 3000;

const cors = require('cors');


//Starting the Server and listening to port 3000
app.listen(PORT, () => { console.log('Server listening on port', PORT); });
app.use(express.json())
//This is added to avoid cors error while using live server extension
app.use(cors());

//This is the actual API which recieves data from fetch method in browser JS(script.js) and calls the method
//to scrap data and returs the results back to the browser js(script.js).
app.post('/predict', async (req, res) => {
  console.log(req.body.imageUrl);
  //Calling the scrap method to get the results 
  const itemName = await scrape(req.body.imageUrl);
  //Sending results back to browser js
  res.send({results:itemName});
  res.end();
});

async function scrape(imageUrl) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Replace with the URL of the webpage you want to scrape
  await page.goto(`https://lens.google.com/uploadbyurl?url=${imageUrl}`);

  // Scrape the <a> tags and their classes
  const links = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('span.LzliJc'));

    return elements.map(element => element.innerText.trim());
  });

  console.log(links);
  console.log("the food name is",links);
  await browser.close();
  return links
  
}








