const express = require('express');
const app = express();
const pid = process.pid;
const saveXmlFile = require('./xmlSpecific');
const logger = require('./logger');

app.get('/', function (req, res) {
    const file = req.query.file;
    saveXmlFile(file)
        .then(val => {
            res.send({
                process: pid,
                file: file,
                result: val
            });
        })
        .catch(err => {
            logger.error({
                message: `Catch on server`,
                data: file,
                error: err
            });
            res.send({
                result: false
            });
        });
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Started process ${pid}`);
});
