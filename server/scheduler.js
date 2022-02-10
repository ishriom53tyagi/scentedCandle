const express = require('express');
var path = require('path');
const config = require('./config');
const cron = require('node-cron');
const app = express();

// node cron for Email Send
if (config.scheduler.active) {
    for (let i = 0; i < config.scheduler.configuration.length; i++) {

        cron.schedule(`${config.scheduler.configuration[i].time}`, function () {
            if (config.scheduler.configuration[i].active) {
                const fork = require('child_process').fork;
                const ls = fork(path.join(__dirname, config.child_process_path, 'main.js'));
                ls.send({ process: config.scheduler.configuration[i].process });
                console.log(`running a task every ${config.scheduler.configuration[i].time} minute`);
            }
        });
    }
}

app.listen(config.scheduler.port);
console.log("scheduler started");