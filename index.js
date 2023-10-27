const express = require('express');
const app = express();
const AWS = require("aws-sdk");
const bodyParser = require('body-parser');
const cors = require('cors');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
});


app.use(cors());

app.use(bodyParser.json());

const s3 = new AWS.S3();

app.get('*', async (req, res) => {
  let filename = req.path.slice(1);

  try {
    let s3File = await s3.getObject({
      Bucket: process.env.BUCKET,
      Key: filename,
    }).promise();

    res.set('Content-type', s3File.ContentType);
    res.send(s3File.Body.toString()).end();
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      console.log(`No such key ${filename}`);
      res.sendStatus(404).end();
    } else {
      console.log(error);
      res.sendStatus(500).end();
    }
  }
});

app.put('*', async (req, res) => {
  let filename = req.path.slice(1);

  console.log(typeof req.body);

  await s3.putObject({
    Body: JSON.stringify(req.body),
    Bucket: process.env.BUCKET,
    Key: filename,
  }).promise();

  res.set('Content-type', 'text/plain');
  res.send('ok').end();
});

app.delete('*', async (req, res) => {
  let filename = req.path.slice(1);

  await s3.deleteObject({
    Bucket: process.env.BUCKET,
    Key: filename,
  }).promise();

  res.set('Content-type', 'text/plain');
  res.send('ok').end();
});

app.use('*', (req, res) => {
  res.sendStatus(404).end();
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
