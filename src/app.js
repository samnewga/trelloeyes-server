require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const winston = require('winston');
app.use(express.json());
const uuid = require('uuid/v4');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

const cards = [
  {
    id: 1,
    title: 'Task One',
    content: 'This is card one',
  },
];
const lists = [
  {
    id: 1,
    header: 'List One',
    cardIds: [1],
  },
];

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, boilerplate!');
});

app.get('/card', (req, res) => {
  res.json(cards);
});

app.get('/list', (req, res) => {
  res.json(lists);
});

app.get('/card/:id', (req, res) => {
  const { id } = req.params;
  const card = cards.find((c) => c.id == id);

  // make sure we found a card
  if (!card) {
    logger.error(`Card with id ${id} not found.`);
    return res.status(404).send('Card Not Found');
  }

  res.json(card);
});

app.get('/list/:id', (req, res) => {
  const { id } = req.params;
  const list = lists.find((li) => li.id == id);

  // make sure we found a list
  if (!list) {
    logger.error(`List with id ${id} not found.`);
    return res.status(404).send('List Not Found');
  }

  res.json(list);
});

app.post('/list', (req, res) => {
  const { header, cardIds = [] } = req.body;

  if (!header) {
    logger.error(`Header is required`);
    return res.status(400).send('Invalid data');
  }

  // check card IDs
  if (cardIds.length > 0) {
    let valid = true;
    cardIds.forEach((cid) => {
      const card = cards.find((c) => c.id == cid);
      if (!card) {
        logger.error(`Card with id ${cid} not found in cards array.`);
        valid = false;
      }
    });

    if (!valid) {
      return res.status(400).send('Invalid data');
    }
  }

  // get an id
  const id = uuid();

  const list = {
    id,
    header,
    cardIds,
  };

  lists.push(list);

  logger.info(`List with id ${id} created`);

  res.status(201).location(`http://localhost:8000/list/${id}`).json({ id });
});

app.use(function validateBearerToken(req, res, next) {