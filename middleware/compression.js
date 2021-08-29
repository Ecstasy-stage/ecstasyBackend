const compression = require('compression');

const shouldCompress = (req, res) => {
    if(req.headers['x-no-compression']) {
        return false;
    }
    return compression.filter(req, res);
}

const compress = compression({
    filter: shouldCompress,
    threshold: 0
});

module.exports = compress;