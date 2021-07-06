
### Image resize and Upload a File to DigitalOcean Object Storage with Node.js

* Read a local JSON file with live image URLs with id.
* Upload in few sizes(100x100, 250x250, 500x500) + add watermark.
* Return uploaded image URL array based on the image size.  

#### Requirements

* NodeJS.
* Git.  

#### Common setup 

Clone the repo and install the dependencies.  

> git clone https://github.com/shreyasavaliya/image-resize.nodejs.git

> cd the-example-app.nodejs

`npm install`  

#### Steps for start the script

To start the express server, run the following.

>  `npm start`

* Open `http://localhost:3000/` link on your browser and it will display Upload button.  

* Click on Upload button and select your JSON file. below is JSON file format

> {"id": "0014",
"urls": [
"https://picsum.photos/200/300",
"https://picsum.photos/200/300",
"https://picsum.photos/200/300"
]}

* It will display message when ever the script is ended and you will get all uploaded image URLs.  

### Other Packages

* I have used [multer](https://npmjs.com/package/multer) to upload JSON file.
* I have used [sharp](https://www.npmjs.com/package/sharp) to resize image.
* I have used [jimp](https://npmjs.com/package/jimp) to add watermark.