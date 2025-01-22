require('dotenv').config();

var mysql = require("mysql2");

var db_info = {
    host: process.env.DB_HOST, // 데이터베이스 주소
    port: process.env.DB_PORT, // 데이터베이스 포트
    user: process.env.DB_USER, // 로그인 계정
    password: process.env.DB_PASSWORD, // 비밀번호
    database: process.env.DB_DATABASE, // 엑세스할 데이터베이스
};

module.exports = {
    init: function () {
      return mysql.createConnection(db_info);
    },
    connect: function (conn) {
      conn.connect(function (err) {
        if (err) console.error("mysql connection error : " + err);
        else console.log("mysql is connected successfully!");
      });
    },
};