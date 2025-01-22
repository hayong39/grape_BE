const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../../config/mysql.js'); // MySQL 연결 모듈 가져오기
const jwt = require('jsonwebtoken'); // jwt 위해서 모듈 가져옴 
require('dotenv').config();
// jwt 용 비밀 키 추후에 환경변수로 옮겨야 함. 
const SECRET_KEY = process.env.SECRET_KEY; 

//로그인 페이지 
router.get('/login', (req, res) => {
    console.log('GET /auth/login called'); // 디버깅 로그

    const token = req.cookies?.jwt_token; // 안전하게 쿠키에서 토큰 읽기
    console.log(token)
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!token) {
        return res.sendFile(path.join(__dirname, '../../views', 'login.html')); // 로그인 페이지 렌더링
    }

    // 토큰 검증
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error('JWT 검증 실패:', err); // 디버깅 로그
            return res.sendFile(path.join(__dirname, '../../views', 'login.html')); // 로그인 페이지 렌더링
        }

        // 토큰이 유효하면 메인 페이지로 리다이렉트
        console.log('유효한 토큰:', user); // 디버깅 로그
        return res.json({ success : true, message: '토큰 유효' }); // 메인 페이지로 리다이렉트
    });
});


// 로그인 처리
router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const prepared_login = "select ID, PW from user_table where ID= ? and PW = ?";
    
    //아이디 비밀번호 null 확인
    if(!username || !password){
        res.send("잘못된 아이디 및 비밀번호");
    }

    
    db.init().query(prepared_login,[username.toString(), password.toString()], (err, results)=>{
        if (err) {
            console.error('로그인 쿼리 실패:', err);
            return res.status(500).send('서버 에러');
          }
        console.log(results)
        let token = null;
        if(results.length > 0) {
            const user = results[0];

            //jwt 레츠기릿 
            token = jwt.sign({ id: user.ID }, SECRET_KEY, { expiresIn: '1h' });
            res.cookie('jwt_token', token, { expires: new Date(Date.now() + 3600000), httpOnly: true })
        }else{
            res.send("아이디 혹은 비밀번호가 다릅니다.");
        }
        res.json({ success: true, message: '로그인되었습니다.', jwttoken: token }); //여기고쳐야함
        
    });

});

// 로그아웃 처리
router.get('/logout', (req, res) => {
    console.log('GET /auth/logout called'); // 디버깅 로그
    res.clearCookie('jwt_token');
    return  res.json({ success : true, message: '로그아웃되었습니다.'});
});

// 회원가입 페이지 렌더링
router.get('/register', (req, res) => {
    console.log('GET /auth/login called'); // 디버깅 로그
    res.sendFile(path.join(__dirname, '../../views', 'register.html')); // 경로 수정
});

// 회원가입 처리
router.post('/register', (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    
    //필드 확인 
    if (!username || !email || !password || !confirm_password) {
        console.log(`POST /auth/register called with username: ${username}, ${email}, ${password}`); 
        return res.status(400).send(`POST /auth/register called with username: ${username}, ${email}, ${password},${confirm_password}`);
    }

    console.log(`POST /auth/register called with username: ${username}`); // 디버깅 로그
    // sql 쿼리리
    const for_find_id_query = 'SELECT * FROM user_table WHERE ID = ?';
    const insert_user = "insert into user_table(ID,PW,email) value(?,?,?)";
    //비밀번호 검증
    if(password==confirm_password){
        db.init().query(for_find_id_query, [username.toString()], (err, results) => {
            if (err) {
              console.error('로그인 쿼리 실패:', err);
              return res.status(500).send('서버 에러');
            }
            // 중복된 id 없음
            if (results.length == 0) {
               // id 생성  
              db.init().query(insert_user,[username.toString(),password.toString(),email.toString()],(err,results)=>{
                if (err) {
                    console.error('insert 실패:', err);
                    return res.status(500).send('서버 에러');
                  }
                  res.sendFile(path.join(__dirname, '../../views', 'login.html'));
              });
              
            } else {
              // 중복된 id 존재 
              console.log(results)
              res.status(401).send('로그인 실패: 잘못된 사용자명 또는 비밀번호');
            }
          });
    }else{
        res.send("비밀번호가 다릅니다.");

    }
});


// id 및 pw 찾기기
router.get('/find', (req, res) => {
    console.log('GET /auth/login called'); // 디버깅 로그
    res.sendFile(path.join(__dirname, '../../views', 'findidpw.html')); // 경로 수정
});


module.exports = router;



