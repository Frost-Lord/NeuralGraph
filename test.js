const tf = require('@tensorflow/tfjs-node');
const { GenerateGraph, updateGraph } = require('./index.js');

const model = tf.sequential();
model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
model.add(tf.layers.dense({ units: 2, inputShape: [2] }));
model.add(tf.layers.dense({ units: 2, inputShape: [3] }));
model.add(tf.layers.dense({ units: 1, inputShape: [2] }));
model.compile({ loss: 'meanSquaredError', optimizer: 'sgd', metrics: ['accuracy'] });

const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);
const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);

GenerateGraph(model);

model.fit(xs, ys, {
  epochs: 100,
  callbacks: {
    onEpochEnd: async (epoch, logs) => {
      console.log(`Epoch: ${epoch} Loss: ${logs.loss * 100} Accuracy: ${logs.acc}`);
      updateGraph(epoch, logs);
    }
  }
}).then(() => {
    console.log('Training complete');
});