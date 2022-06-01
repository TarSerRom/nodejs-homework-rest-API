const mongoose = require('mongoose');
const app = require('../app')

const {URL_DB, PORT} = process.env;



mongoose
  .connect(URL_DB, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Database connection successful, \nServer running. Use our API on port: ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.log(error.massage);
    process.exit(1);
  });

