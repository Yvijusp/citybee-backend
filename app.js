import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT;

// MODELS
import Model from './models/modelSchema.js';
import Vehicle from './models/vehicleSchema.js';

// CONNECTION TO DB
mongoose
  .connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then((result) =>
    app.listen(PORT, () => console.log(`Server is running on ${PORT} port`))
  )
  .catch((err) => console.log(err));

// ROUTES

// GET all models from database.
app.get('/models', async (req, res) => {
  let modelData = await Model.find();

  res.send(modelData);
});

// POST send a new model to database
app.post('/models', async (req, res) => {
  if (!req.body.name || !req.body.hour_price)
    return res.status(422).send({ message: 'Wrong data input' });

  let newModel = new Model(req.body);

  newModel
    .save()
    .then((result) => res.status(201).send({ message: 'Data sent' }))
    .catch((err) => console.log(err));
});

// GET all models and show how many vehicles are assigned to the model
app.get('/modelscount', async (req, res) => {
  let modelData = await Model.find();

  let modelCountData = modelData.reduce((a, v) => {
    a.push({ model: v.name, vehicleCount: v.vehicles.length });
    return a;
  }, []);

  res.send(modelCountData);
});

// GET all vehicles from database
app.get('/vehicles', async (req, res) => {
  let vehicleData = await Vehicle.find()
    .select('_id number_plate country_location model_id')
    .populate('model_id', 'name hour_price')
    .exec();

  res.send(vehicleData);
});

// POST send vehicle into database. Assign in to a model via ObjectId
app.post('/vehicles/add/:model_id', async (req, res) => {
  const model_id = req.params.model_id;

  if (!model_id)
    return res
      .status(404)
      .send({ message: "Id not found / car doesn't exist" });

  if (!req.body.number_plate || !req.body.country_location)
    return res.status(422).send({ message: 'Wrong data input' });

  let modelData = await Model.findById(model_id);

  let vehicle = new Vehicle(req.body);

  vehicle.model_id = model_id;

  vehicle
    .save()
    .then((result) => {
      modelData.vehicles.push(result._id);

      modelData.save();

      res.status(201).send({ message: 'Data saved' });
    })
    .catch((err) => console.log(err));
});

// GET vehicles from Lithuania
app.get('/vehicles/:region', async (req, res) => {
  let region = req.params.region;

  let regions = ['lt', 'lv', 'ee'];

  if (!regions.some((regionCheck) => regionCheck === region))
    return res.status(404).send({ message: 'Region not found' });

  let vehicleData = await Vehicle.find()
    .select('_id number_plate country_location model_id')
    .populate('model_id', 'name hour_price')
    .exec();

  let vehicleRegion = vehicleData.reduce((a, v) => {
    if (v.country_location.toLowerCase() === '' + region.toLowerCase()) {
      a.push(v);
    }

    return a;
  }, []);

  res.send(vehicleRegion);
});
