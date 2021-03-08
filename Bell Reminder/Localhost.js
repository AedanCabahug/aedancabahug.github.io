const Express = require("express");
const Fs = require("fs");
const App = Express();
const Port = 3000;

App.get('/', function (Request, Resolution) {
    Resolution.send(Fs.readFileSync(__dirname + "/index.html", "utf8"));
});
App.use("/", Express.static(__dirname));

App.listen(Port, function () {
    console.log("Bell Reminder is now hosted on port " + Port);
});