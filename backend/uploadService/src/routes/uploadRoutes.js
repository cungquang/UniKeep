const express = require("express");
const Multer = require("multer");

//Configure 3rd party - multer for temporary storage
const router = express.Router();
const multerStorage = Multer.memoryStorage();
const multerUpload = Multer({ storage: multerStorage });

class UploadRouter{
    constructor(uploadController){
        this.uploadController = uploadController
    }

    configureUploadRoute(){
        //in multerUpload.single(must specify the field name in html use to keep the file)
        router.post("/upload", multerUpload.single("fileInput"), async (request, response) => {
            try {
              await this.uploadController.asyncUploadFile(request, response);
            } catch (error) {
              console.error('Error handling file upload: ', error);
              response.status(500).json({ error: 'Internal Server Error' });
            }
          });
        
          return router;
    }
}

module.exports = UploadRouter;