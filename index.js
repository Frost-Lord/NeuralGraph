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
  trainingTime: null,
  model: null,
  ModelInfo: null,
}

let lossData = [];
let accuracyData = [];
let startTime = null;

function startElectronApp() {
  return new Promise((resolve, reject) => {
    const pathtoWindow = process.env.NODE_ENV === 'development' ? 'node_modules/neuralgraph/window.js' : 'window.js';
    const electronProcess = exec(`electron ${pathtoWindow}`);

    electronProcess.stdout.on('data', (data) => {
      console.log(data);
    });

    electronProcess.stderr.on('data', (data) => {
      console.error(data);
    });

    electronProcess.on('close', (code) => {
      //console.log(`App exited with code ${code}`);
      resolve();
    });

    electronProcess.on('error', (err) => {
      console.error('Failed to start app:', err);
      reject(err);
    });
  });
}
function GenerateGraph(model = null) {
  if (model) {
    Data.model = model;
  }
  return new Promise((resolve) => {
    startElectronApp();
    resolve();
  });
}

function updateGraph(epoch, logs) {
  lossData.push({ x: epoch, y: logs.loss * 100 });
  accuracyData.push({ x: epoch, y: logs.acc });

  const endTime = Date.now();
  let trainingTime;

  if (startTime === null) {
    startTime = endTime;
    trainingTime = 0;
  } else {
    trainingTime = ((endTime - startTime) / 1000).toFixed(2);
  }

  Data = {
    epoch: epoch,
    loss: logs.loss,
    accuracy: logs.acc,
    lossData: lossData,
    accuracyData: accuracyData,
    trainingTime: trainingTime,
    model: Data.model,
    ModelInfo: Data.ModelInfo,
  };
}

appExpress.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'loading.html'));
});

function getLayerVisualization(model) {
  const layerVisualizations = model.layers.map((layer) => {
    const weights = layer.getWeights();
    const weightsArrayPromises = weights.map(tensor => tensor.array());

    return Promise.all(weightsArrayPromises).then(weightsArray => {
      return {
        layerName: layer.name,
        weights: weightsArray,
      };
    });
  });
  return Promise.all(layerVisualizations);
}
function getModelInfo(model) {
  const config = model.getConfig();
  const layerVisualizationPromise = getLayerVisualization(model);
  return layerVisualizationPromise.then(layerVisualizations => {
    return {
      config,
      layerVisualizations,
    };
  });
}
appExpress.get('/data', async (req, res) => {
  if (Data.model) {
    Data.ModelInfo = await getModelInfo(Data.model);
  }
  res.json(Data);
});


appExpress.listen(3001, () => { });

module.exports = {
  startElectronApp,
  GenerateGraph,
  updateGraph,
};
