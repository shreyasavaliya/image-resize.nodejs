var express = require('express');
var router = express.Router();
var fs = require('fs');
const sharp = require('sharp');
const destination_path = 'public/temp/';
var request = require('request');
var Jimp = require('jimp');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/json');
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName)
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "application/json") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Allowed only json'));
    }
  }
});

/**
 *
 * @param {file} JSON file with image URLs
 *
 * @returns Uploaded image URL as a table view in index.html
 */

router.post('/upload', upload.any(), function (req, res) {
  if (req.files.length != 1) {
    return res.send({ message: "Must Upload JSON file" })
  } else {
    // Read Uploaded JSON file.
    fs.readFile('public/json/' + req.files[0].filename, 'utf8', function (err, data) {
      if (err) {
        return res.status(500).json({
          message: err,
        });
      }
      try {
        // Create temp directory to download images.
        if (fs.existsSync("public/temp")) {
          console.log("Directory exists.");
          initializeImage(data, req, res)
        } else {
          console.log("Directory does not exist.");
          fs.mkdirSync('public/temp');
          initializeImage(data, req, res)
        }
      } catch (e) {
        console.log("Error reading JSON string:", e);
        return res.status(500).json({ message: "Error reading JSON string:", err: err });
      }
    });
  }

});

function initializeImage(data, req, res) {
  try {
    var result = JSON.parse(data);
    const result_length = result.length - 1;

    if (result_length >= 0) {
      var final_response = [];
      var final_response_length = 0;

      result.forEach((element, j) => {
        final_response_length += element.urls.length * 3;

        if (result_length == j) {
          result.forEach((element, i) => {
            var url_holder = element.urls ? element.urls : 0;

            if (url_holder.length) {

              var mainDir = destination_path + element.id;
              var subDirectory500 = mainDir + '/500x500';
              var subDirectory250 = mainDir + '/250x250';
              var subDirectory100 = mainDir + '/100x100';

              // Create a directory with name as id and by size.
              if (!fs.existsSync(mainDir)) {
                fs.mkdirSync(mainDir);
                fs.mkdirSync(subDirectory500);
                fs.mkdirSync(subDirectory250);
                fs.mkdirSync(subDirectory100);
                ResizeImage(url_holder, destination_path, element, result_length, i, final_response, final_response_length, req, res)
              } else {
                ResizeImage(url_holder, destination_path, element, result_length, i, final_response, final_response_length, req, res)
              }

            } else {
              if (result_length == i) {
                return res.status(200).json({
                  data: result,
                });
              }
            }
          });
        }
      });

    } else {
      console.log("Empty file!");
    }
  } catch (err) {
    console.log("Error parsing JSON string:", err);
    return res.status(500).json({ message: "Error parsing JSON string initializeImage:", err: err });
  }
}

function ResizeImage(url_holder, destination_path, element, result_length, i, final_response, final_response_length, req, res) {
  const url_holder_length = url_holder.length - 1;

  try {
    // Create SVG image of id name.
    const watermark_svg_string = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" width="70mm" height="30mm" inkscape:version="0.92.3 (2405546, 2018-03-11)" sodipodi:docname="water1.svg" version="1.1" viewBox="0 0 70 30"> <sodipodi:namedview id="base" bordercolor="#666666" borderopacity="1.0" inkscape:current-layer="layer1" inkscape:cx="296.21892" inkscape:cy="-4.0406102" inkscape:document-units="mm" inkscape:pageopacity="0.0" inkscape:pageshadow="2" inkscape:window-height="667" inkscape:window-maximized="1" inkscape:window-width="1366" inkscape:window-x="0" inkscape:window-y="27" inkscape:zoom="0.98994949" pagecolor="#ffffff" showgrid="false"/> <g transform="translate(0,-267)" inkscape:groupmode="layer" inkscape:label="Layer 1"> <rect xmlns="http://www.w3.org/2000/svg" x=".48868" y="267.25" width="69.815" height="29.749" ry="5.8799" fill="#1a1a1a" opacity=".99" stroke="#ff323c" stroke-opacity=".37391" stroke-width=".26458"/> <text x="35.58868" y="290" text-anchor="middle" fill="#fff" font-size="26" style="font-weight: 600;">' + element.id + '</text> </g> </svg>';

    const watermark_svg_string6 = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" width="70mm" height="30mm" inkscape:version="0.92.3 (2405546, 2018-03-11)" sodipodi:docname="water1.svg" version="1.1" viewBox="0 0 70 30"> <sodipodi:namedview id="base" bordercolor="#666666" borderopacity="1.0" inkscape:current-layer="layer1" inkscape:cx="296.21892" inkscape:cy="-4.0406102" inkscape:document-units="mm" inkscape:pageopacity="0.0" inkscape:pageshadow="2" inkscape:window-height="667" inkscape:window-maximized="1" inkscape:window-width="1366" inkscape:window-x="0" inkscape:window-y="27" inkscape:zoom="0.98994949" pagecolor="#ffffff" showgrid="false"/> <g transform="translate(0,-267)" inkscape:groupmode="layer" inkscape:label="Layer 1"> <rect xmlns="http://www.w3.org/2000/svg" x=".48868" y="267.25" width="69.815" height="29.749" ry="5.8799" fill="#1a1a1a" opacity=".99" stroke="#ff323c" stroke-opacity=".37391" stroke-width=".26458"/> <text x="35.58868" y="290" text-anchor="middle" fill="#fff" font-size="20" style="font-weight: 600;">' + element.id + '</text> </g> </svg>';

    const watermark_svg_string8 = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" width="70mm" height="30mm" inkscape:version="0.92.3 (2405546, 2018-03-11)" sodipodi:docname="water1.svg" version="1.1" viewBox="0 0 70 30"> <sodipodi:namedview id="base" bordercolor="#666666" borderopacity="1.0" inkscape:current-layer="layer1" inkscape:cx="296.21892" inkscape:cy="-4.0406102" inkscape:document-units="mm" inkscape:pageopacity="0.0" inkscape:pageshadow="2" inkscape:window-height="667" inkscape:window-maximized="1" inkscape:window-width="1366" inkscape:window-x="0" inkscape:window-y="27" inkscape:zoom="0.98994949" pagecolor="#ffffff" showgrid="false"/> <g transform="translate(0,-267)" inkscape:groupmode="layer" inkscape:label="Layer 1"> <rect xmlns="http://www.w3.org/2000/svg" x=".48868" y="267.25" width="69.815" height="29.749" ry="5.8799" fill="#1a1a1a" opacity=".99" stroke="#ff323c" stroke-opacity=".37391" stroke-width=".26458"/> <text x="35.58868" y="288" text-anchor="middle" fill="#fff" font-size="16" style="font-weight: 600;">' + element.id + '</text> </g> </svg>';

    var writeStream = fs.createWriteStream("public/temp/" + element.id + '.svg');

    if (element.id.length < 4) {
      writeStream.write(watermark_svg_string);
    } else if (element.id.length < 6) {
      writeStream.write(watermark_svg_string6);
    } else {
      writeStream.write(watermark_svg_string8);
    }

    // Save a watermark in images.
    writeStream.end(() => {
      sharp("public/temp/" + element.id + '.svg')
        .png()
        .toFile("public/temp/" + element.id + ".png")
        .then(function (info) {

          const LOGO = "public/temp/" + element.id + ".png";
          const LOGO_MARGIN_PERCENTAGE = 2;

          url_holder.forEach((url_element, index) => {
            const current_extension = /[^.]+$/.exec(url_element);
            const image_name = index + '.' + current_extension[0];

            const save_image_path_500 = destination_path + element.id + '/500x500/' + image_name;
            resizeAndAddWaterMark(500, save_image_path_500, LOGO, LOGO_MARGIN_PERCENTAGE, destination_path, element, image_name, false, url_element, url_holder_length, index, result_length, i, final_response, final_response_length, res);

          });
        });
    });
  } catch (error) {
    console.error(error);
    if (result_length == i) {
      return res.status(500).json({
        data: error,
      });
    }
  }
}

function resizeAndAddWaterMark(size, save_image_path, LOGO, LOGO_MARGIN_PERCENTAGE, destination_path, element, image_name, is100, url_element, url_holder_length, index, result_length, i, final_response, final_response_length, res) {

  // Digital ocean storage connection!
  var AWS = require('aws-sdk');
  var fs = require('fs');
  const spacesEndpoint = new AWS.Endpoint('http://example.digitaloceanspaces.com'); // Place your end point URL.
  const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: '', // place your access key Id.
    secretAccessKey: '' // place your secret key Id.
  });

  // Resize images.
  const Resizer = sharp().resize(size, size).toFile(save_image_path, (err, info) => {
    if (err) {
      console.log(save_image_path, 'size');
      console.log('err in resize 500: ', err);
      if (url_holder_length == index) {
        if (result_length == i) {
          return res.status(500).json({
            data: err,
          });
        }
      }
    } else {
      // Add id as a watermark in images.
      const ORIGINAL_IMAGE = save_image_path;
      const FILENAME = save_image_path;
      try {
        const main = async () => {
          try {
            const [image, logo] = await Promise.all([
              Jimp.read(ORIGINAL_IMAGE),
              Jimp.read(LOGO)
            ]);

            if (is100) {
              logo.resize(image.bitmap.width / 4, Jimp.AUTO);
            } else {
              logo.resize(image.bitmap.width / 8, Jimp.AUTO);
            }

            const xMargin = (image.bitmap.width * LOGO_MARGIN_PERCENTAGE) / 100;
            const yMargin = (image.bitmap.width * LOGO_MARGIN_PERCENTAGE) / 100;

            const X = image.bitmap.width - logo.bitmap.width - xMargin;
            const Y = image.bitmap.height - logo.bitmap.height - yMargin;

            return image.composite(logo, X, Y, [
              {
                mode: Jimp.BLEND_SCREEN,
                opacitySource: 0.1,
                opacityDest: 1
              }
            ]);
          } catch (error) {
            console.error('ORIGINAL_IMAGE', ORIGINAL_IMAGE);
            console.error('error in main', error);
            if (url_holder_length == index) {
              if (result_length == i) {
                return res.status(500).json({
                  err: error,
                });
              }
            }
          }
        };

        main()
          .then(async image => {
            console.log(FILENAME, 'in main');
            return await image.write(FILENAME);
          })
          .then(async (image) => {
            if (size == 500) {
              fs.readFile(destination_path + element.id + '/500x500/' + image_name, function (err, data) {
                if (err) { console.log(err); }

                // Upload image in Digital ocean storage
                const params = {
                  Bucket: "easycarhk.picture",
                  Key: element.id + '/500x500/' + image_name,
                  Body: data,
                  ACL: 'public-read',
                  ContentType: "mimetype"
                };
                s3.upload(params, function (err, data) {
                  if (err) {
                    console.log(err);
                  }

                  final_response.push(data.Location);
                  const save_image_path_250 = destination_path + element.id + '/250x250/' + image_name;

                  resizeAndAddWaterMark(250, save_image_path_250, LOGO, LOGO_MARGIN_PERCENTAGE, destination_path, element, image_name, false, url_element, url_holder_length, index, result_length, i, final_response, final_response_length, res);
                });

              });
            } else {
              if (size == 250) {
                fs.readFile(destination_path + element.id + '/250x250/' + image_name, function (err, data) {
                  if (err) { console.log(err); }

                  // Upload image in Digital ocean storage
                  const params = {
                    Bucket: "easycarhk.picture",
                    Key: element.id + '/250x250/' + image_name,
                    Body: data,
                    ACL: 'public-read',
                    ContentType: "mimetype"
                  };

                  s3.upload(params, function (err, data) {
                    if (err) {
                      console.log(err);
                    }

                    final_response.push(data.Location);
                    const save_image_path_100 = destination_path + element.id + '/100x100/' + image_name;

                    resizeAndAddWaterMark(100, save_image_path_100, LOGO, LOGO_MARGIN_PERCENTAGE, destination_path, element, image_name, false, url_element, url_holder_length, index, result_length, i, final_response, final_response_length, res);
                  });


                });
              } else {
                fs.readFile(destination_path + element.id + '/100x100/' + image_name, function (err, data) {
                  if (err) { console.log(err); }
                  const params = {
                    Bucket: "easycarhk.picture",
                    Key: element.id + '/100x100/' + image_name,
                    Body: data,
                    ACL: 'public-read',
                    ContentType: "mimetype"
                  };


                  s3.upload(params, function (err, data) {
                    if (err) {
                      console.log(err);
                    }
                    console.log(data.Location);
                    final_response.push(data.Location);
                    if (final_response_length == final_response.length) {
                      var bucketParams = {
                        Bucket: 'easycarhk.picture',
                        Prefix: element.id
                      };

                      // Call S3 to obtain a list of the objects in the bucket
                      s3.listObjects(bucketParams, function (err, data) {
                        if (err) {
                          console.log("Error", err);
                        } else {
                          // console.log("Success", data);
                          const data_length = data.Contents.length - 1;
                          data.Contents.forEach((uploaded_element, index) => {

                            // Check if uploaded image size is empty then upload again!
                            if (uploaded_element.Size == 0) {
                              console.log(uploaded_element);
                              console.log('Again upload path', destination_path + uploaded_element.Key);
                              fs.readFile(destination_path + uploaded_element.Key, async function (err, data) {
                                if (err) { console.log('Again upload error', err); }
                                const params = {
                                  Bucket: "easycarhk.picture",
                                  Key: destination_path + uploaded_element.Key,
                                  Body: data,
                                  ACL: 'public-read',
                                  ContentType: "mimetype"
                                };

                                s3.upload(params, function (err, data) {
                                  if (err) {
                                    console.log(err);
                                  }
                                  console.log(`Again File uploaded successfully. ${data.Location}`);
                                  if (data_length == index) {
                                    try {
                                      const directory = 'public/temp';
                                      fs.rmdir(directory, () => {
                                        console.log("Folder Deleted!");
                                        return res.status(200).json({
                                          message: "Done",
                                          final_response: final_response
                                        });
                                      });
                                    } catch {
                                      return res.status(200).json({
                                        message: "Done",
                                        err: "Can't delete temp",
                                        final_response: final_response
                                      });
                                    }
                                  }
                                });
                              });
                            } else {
                              if (data_length == index) {
                                try {
                                  const directory = 'public/temp';
                                  fs.rmdir(directory, () => {
                                    console.log("Folder Deleted!");
                                    return res.status(200).json({
                                      message: "Done",
                                      final_response: final_response
                                    });
                                  });
                                } catch {
                                  return res.status(200).json({
                                    message: "Done",
                                    err: "Can't delete temp",
                                    final_response: final_response
                                  });

                                }
                              }
                            }
                          });
                        }
                      });
                    }
                  });
                });
              }
            }
          });
      } catch (error) {
        console.error('ORIGINAL_IMAGE', ORIGINAL_IMAGE);
        console.error('error out main', error);
        if (url_holder_length == index) {
          if (result_length == i) {
            return res.status(500).json({
              err: error,
            });
          }
        }
      }
    }
  });
  request(url_element).pipe(Resizer);
}

module.exports = router;
