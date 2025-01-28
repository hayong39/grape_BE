const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../../config/mysql.js'); // MySQL 연결 모듈 가져오기
const jwt = require('jsonwebtoken'); // jwt 위해서 모듈 가져옴 
require('dotenv').config();


const SECRET_KEY = process.env.SECRET_KEY; 


// Middleware: JWT 인증
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        req.user = user; // 인증된 사용자 정보 저장
        next();
    });
};

//정보게시판 목록 조회 (인증 필요)
router.get('/', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM info ORDER BY `date` DESC';
    db.init().query(query, (err, results) => {
        if(err){
            console.error('정보게시판 목록 조회 실패: ', err);
            return res.status(500).send('서버 에러');
        }
        res.json(results);
    });
});

//정보게시판 글 작성 (인증 필요)
router.post('/', authenticateToken, (req, res) => {
    const { title, content, fileUrl } = req.body;
    const query = 'INSERT INTO info (category, title, content, author, `date`, views, likes, fileUrl) VALUES ("notice", ?, ?, ?, NOW(), 0, 0, ?)';
    db.init().query(query, [title, content, req.user.username, fileUrl], (err, results) => {
        if (err) {
            console.error('정보게시판 글 작성 실패:', err);
            return res.status(500).json({ error: '서버 에러' });
        }
        res.json({ success: true, message: '정보게시판 글이 성공적으로 등록되었습니다.' });
    });
});

// 정보게시판 글 상세 조회 (인증 필요)
router.get('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM info WHERE id = ?';
    db.init().query(query, [id], (err, results) => {
        if (err) {
            console.error('정보게시판 글 조회 실패:', err);
            return res.status(500).json({ error: '서버 에러' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: '정보게시판 글을 찾을 수 없습니다.' });
        }
        res.json(results[0]);
    });
});

// 정보게시판 글 수정 (인증 필요)
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, content, fileUrl } = req.body;
    const query = 'UPDATE info SET title = ?, content = ? fileUrl = ? WHERE id = ?';
    db.init().query(query, [title, content, fileUrl, id], (err, results) => {
        if (err) {
            console.error('정보게시판 글 수정 실패:', err);
            return res.status(500).json({ error: '서버 에러' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: '정보게시판 글을 찾을 수 없습니다.' });
        }
        res.json({ success: true, message: '정보게시판 글이 성공적으로 수정되었습니다.' });
    });
});

// 정보게시판 글 삭제 (인증 필요)
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM info WHERE id = ?';
    db.init().query(query, [id], (err, results) => {
        if (err) {
            console.error('정보게시판 글 삭제 실패:', err);
            return res.status(500).json({ error: '서버 에러' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: '정보게시판 글을 찾을 수 없습니다.' });
        }
        res.json({ success: true, message: '정보게시판 글이 성공적으로 삭제되었습니다.' });
    });
});

module.exports = router;
