//const functions = require('firebase-functions');
const express = require('express');
const app1 = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http')

const morgan = require('morgan');



//    *******************
//    M I D D L E W A R E
//    *******************

// app1.use(fileUpload());

// const options = {
//     uploadDir: os.tmpdir(),
//     autoClean: true
//   };
   
//   // parse data with connect-multiparty. 
//   app1.use(formData.parse(options));
//   // delete from the request all empty files (size == 0)
//   app1.use(formData.format());
//   // change the file objects to fs.ReadStream 
//   app1.use(formData.stream());
//   // union the body and the files
//   app1.use(formData.union());

app1.use(cors({ origin: true }))

//express parsing json

app1.use(morgan('dev'));

//Cookie parser
app1.use(cookieParser());

//Body Parser

// parse application/x-www-form-urlencoded
// app1.use(bodyParser.json({
//   limit: '50mb'
// }));

// app1.use(bodyParser.urlencoded({
//   limit: '50mb',
//   parameterLimit: 100000,
//   extended: true 
// }));


app1.use(bodyParser.json({limit: '10mb', extended: true}))
app1.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
// parse application/json
app1.use(bodyParser.json());


//Routes setup
const users = require('./routes/users');
const { ESRCH } = require('constants');



//Setting users routes



app1.use(users);

app1.get('/', (req, res) => {
  res.send('Just a test')
})

const runtimeOpts = {
       timeoutSeconds: 540,
       memory: '512MB'
    }

//exports.app = app1//functions.runWith(runtimeOpts).https.onRequest(app1);

const PORT = process.env.PORT || 8080

// exports.app = app1.listen(process.env.PORT, () => {
//   console.log('running on ', port)
// })

exports.app = http.createServer(app1).listen(PORT, () => {
  console.log('Running on', PORT)
})