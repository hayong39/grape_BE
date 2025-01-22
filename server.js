const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const db = require('./config/mysql.js');

const app = express();
app.use(express.json());
const conn = db.init();

const upload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, callback){
            console.log(file),
            fs.existsSync("./uploads/") ||
                fs.mkdirSync("./uploads/", { recursive: !0 }),
            callback(null, "./uploads/");
        },
        filename: function(req, file, callback){
            callback(null, file.originalname);
        },
    }),
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// app.set("port", process.env.PORT || 3000); // 포트 설정
// app.set("host", process.env.HOST || "0.0.0.0"); // 아이피 설정

app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})


// 로그인, 로그아웃, 회원가입 기능
const authRoutes = require('./routes/auth/auth');
app.use('/auth', authRoutes); 

// 공지사항 기능
const noticeRoutes = require('./routes/board/notice');
app.use('/api/board/notice', noticeRoutes); // /board 경로에 board.js 라우트 연결

