const multer= require('multer');
const path = require('path')
const crypto = require('crypto');

const storage = multer.diskStorage({
    // here we are setting up the file folder 
    destination: function (req, file, cb) {
        cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        // here we are setting up the files name 
        crypto.randomBytes(12, function(err, name){
                const fn = name.toString('hex') + path.extname(file.originalname) // e.g. abc.jpeg so, "path.extname" it extracts the .jpeg from original file name or any extension ike jpg, png, svg etc... 
                cb(null, fn) // fn: file name
            })
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    }
  })
  
  const upload = multer({ storage: storage })

  module.exports = upload;