const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

let gfs;

const initGridFS = () => {
  if (mongoose.connection.db) {
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection(process.env.GRIDFS_BUCKET || 'resumes');
  } else {
    console.log('Database not connected yet, GridFS will be initialized when needed');
  }
};

const getGridFS = () => {
  if (!gfs && mongoose.connection.db) {
    initGridFS();
  }
  return gfs;
};

module.exports = { initGridFS, getGridFS };
