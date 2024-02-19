/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:HAINI XIAO A00587586
 */

const yauzl = require("yauzl-promise"),
  fs = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path");
  const { pipeline}  = require('stream/promises');
/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
//const unzip = (pathIn, pathOut) => {
//};
const unzip = async (pathIn, pathOut) => {
  const zip = await yauzl.open(`${pathIn}`);
  try {
    // Create the pathOut if it does not exist
    await fs.promises.mkdir(pathOut, { recursive: true });

    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        // Create directory for entry
        await fs.promises.mkdir(`${pathOut}/${entry.filename}`, { recursive: true });
      } else {
        // Create write stream for file entry
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(`${pathOut}/${entry.filename}`);
        await pipeline(readStream, writeStream);
      }
    }
    console.log("Extraction operation complete");
  } finally {
    await zip.close();
  }
};
/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);

      } else {

        const pngFiles = files
          .filter((file) => path.extname(file) === ".png")
          .filter((file) => file !== "__MACOSX")
          .map((file) => path.join(dir, file));
        resolve(pngFiles);
      }
    });
  });
};



/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 * a pic in zip file, filter into the grayscaled dirctory
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */


const grayScale = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(pathIn);
    const output = fs.createWriteStream(pathOut);
    const transformStream = new PNG({});
  
    input
      .pipe(transformStream)
      .on("parsed", function() {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            const gray = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;
            this.data[idx] = this.data[idx + 1] = this.data[idx + 2] = gray;
          }
        }
    
        this.pack().pipe(output);

        output
          .on("finish", () => {resolve()})
          .on("error", (err) => {reject(err)});

      });
    input
      .on("error", (err) => {reject(err)});
  });
};
/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 * a pic in zip file, filter into the sephia dirctory not really sure it is a correct effect
 * @param {string} path
 * @param {string} pathTry
 * @return {promise}
 */

const sephiaTry = (pathProcessed, pathTry) => {
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(pathProcessed);
    const output = fs.createWriteStream(pathTry);
    const transformStream = new PNG({});
  
    input
      .pipe(transformStream)
      .on("parsed", function() {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            const sephia = this.data[idx]; 
            this.data[idx] = sephia; // R
            this.data[idx + 1] = sephia * 0.75; // G
            this.data[idx + 2] = sephia * 0.5; // B
        }
        
        }
    
        this.pack().pipe(output);

        output
          .on("finish", () => {resolve()})
          .on("error", (err) => {reject(err)});

      });
    input
      .on("error", (err) => {reject(err)});
  });
};




const saveImages = (pngFiles, pathProcessed, pathTry) => {
  const grayScalePromises = pngFiles.map((file) => {
    const outputFilePath = path.join(pathProcessed, path.basename(file));
    const outputFilePath2 = path.join(pathTry, path.basename(file));
    return grayScale(file, outputFilePath), sephiaTry(file, outputFilePath2);
  });
  return Promise.all(grayScalePromises);
};


module.exports = {
  unzip,
  readDir,
  grayScale,
  sephiaTry,
  saveImages

};