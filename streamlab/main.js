
/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date:
 * Author:
 *
 */

const path = require("path");
const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");
const pathTry= path.join(__dirname, "sephia");



IOhandler.unzip(zipFilePath, pathUnzipped)
    .then(()=> IOhandler.readDir(pathUnzipped))
    .then((pngFiles) => IOhandler.saveImages(pngFiles, pathProcessed, pathTry))
    .then(() => {console.log("Grayscale and Sephia color filter conversion completed .");})
    .catch((err)=> console.log(err))