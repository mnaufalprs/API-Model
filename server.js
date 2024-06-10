const Hapi = require('@hapi/hapi');
const tf = require('@tensorflow/tfjs-node');
const path = require('path');

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    // Load TensorFlow.js model
    let model;
    const modelPath = path.resolve(__dirname, '/home/naufal/hiracareCoba/model_js/model.json');
    try {
        model = await tf.loadLayersModel(`file://${modelPath}`);
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Error loading the model:', error);
        process.exit(1);
    }

    // Define the route POST /predict
    server.route({
        method: 'POST',
        path: '/predict',
        handler: async (request, h) => {
            try {
                console.log('Request payload:', request.payload);
                const { food_item } = request.payload;

                if (!food_item) {
                    return h.response({ error: 'food_item is required' }).code(400);
                }

                // Predicting
                const inputTensor = tf.tensor2d([[null, food_item]]);
                const prediction = model.predict(inputTensor);
                const predictedCalories = prediction.dataSync()[0];

                console.log('Predicted calories:', predictedCalories);
                return { food_item, predictedCalories };
            } catch (error) {
                console.error('Error in prediction handler:', error);
                return h.response({ error: error.message }).code(500);
            }
        }
    });

    // Start the server
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();




