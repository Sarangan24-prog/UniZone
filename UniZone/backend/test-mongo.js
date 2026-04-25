const mongoose = require('mongoose');

const uri = "mongodb://mjaankishna:TLruN1wT4n7EZk17@ac-nfdulnl-shard-00-00.1g1hxir.mongodb.net:27017,ac-nfdulnl-shard-00-01.1g1hxir.mongodb.net:27017,ac-nfdulnl-shard-00-02.1g1hxir.mongodb.net:27017/?ssl=true&replicaSet=atlas-wuuoha-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("Connected successfully");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
