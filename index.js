const { exec } = require('child_process');
const path = require('path');
const express = require('express');
const appExpress = express();
const cors = require("cors");
const bodyParser = require("body-parser");


appExpress.use(bodyParser.urlencoded({ extended: false }));
appExpress.use(bodyParser.json());
appExpress.use(cors());

let Data = {
    epoch: null,
    loss: null,
    accuracy: null,
    lossData: null,
    accuracyData: null,
}

let lossData = [];
let accuracyData = [];

function startElectronApp() {
  return new Promise((resolve, reject) => {
    const electronProcess = exec('electron node_modules/neuralgraph/window.js');

    electronProcess.stdout.on('data', (data) => {
      console.log(data);
    });

    electronProcess.stderr.on('data', (data) => {
      console.error(data);
    });

    electronProcess.on('close', (code) => {
      console.log(`Electron app exited with code ${code}`);
      resolve();
    });

    electronProcess.on('error', (err) => {
      console.error('Failed to start Electron app:', err);
      reject(err);
    });
  });
}
function GenerateGraph() {
  return new Promise((resolve) => {
    startElectronApp();
    resolve();
  });
}

function updateGraph(epoch, loss, accuracy) {
  lossData.push({ x: epoch, y: loss * 100 });
  accuracyData.push({ x: epoch, y: accuracy });

  Data = {
    epoch: epoch,
    loss: loss,
    accuracy: accuracy,
    lossData: lossData,
    accuracyData: accuracyData,
  };
}

appExpress.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'loading.html'));
});

appExpress.get('/data', (req, res) => {
    res.json(Data);
});
  

appExpress.listen(3001, () => {});

module.exports = {
  startElectronApp,
  GenerateGraph,
  updateGraph,
};
