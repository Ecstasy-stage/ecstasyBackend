const { Utils } = require('../middleware/utils')

process.on("message", message => {
    Utils.loadThumbnail(message.userIdentifier)
    .then(videos => {
        process.send(videos);
        process.exit();
    });
});

//    // create child process.....
//    const childProcess = fork('./services/homefeed.js');

//    // send data for child process.....
//    childProcess.send({
//        userIdentifier: user.uid
//    });

//    // send response when available...
//    childProcess.on("message", videos => {
//        res.send(videos);
//    });

