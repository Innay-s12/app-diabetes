// ==================== IMPORT ====================
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db'); // ⬅️ AMBIL DARI db.js

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== STATIC FRONTEND ====================
app.use(express.static(path.join(__dirname, '../frontend')));

// ==================== HELPER QUERY ====================
const executeQuery = async (sql, params = []) => {
    const [rows] = await db.query(sql, params);
    return rows;
};

// ==================== API ====================

// Ambil gejala
app.get('/gejala', async (req, res) => {
    try {
        const data = await executeQuery(
            'SELECT id, nama_gejala, bobot FROM symptoms ORDER BY id ASC'
        );
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Proses diagnosa
app.post('/diagnosa', async (req, res) => {
    const { nama_lengkap, usia, jenis_kelamin, gejala } = req.body;

    try {
        let user = await executeQuery(
            'SELECT id FROM users WHERE nama_lengkap = ?',
            [nama_lengkap]
        );

        let userId;
        if (user.length) {
            userId = user[0].id;
        } else {
            const result = await executeQuery(
                'INSERT INTO users (nama_lengkap, usia, jenis_kelamin) VALUES (?, ?, ?)',
                [nama_lengkap, usia, jenis_kelamin]
            );
            userId = result.insertId;
        }

        const score = (gejala.length / 5) * 100;
        let tingkat = 'Rendah';
        if (score > 70) tingkat = 'Tinggi';
        else if (score > 40) tingkat = 'Sedang';

        await executeQuery(
            'INSERT INTO diagnoses (user_id, skor_akhir, tingkat_risiko, gejala_terpilih) VALUES (?, ?, ?, ?)',
            [userId, score / 100, tingkat, JSON.stringify(gejala)]
        );

        res.json({
            success: true,
            skor_akhir: score / 100,
            tingkat_risiko: tingkat,
            diagnosis: `Anda memiliki risiko ${tingkat} terkena diabetes`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal memproses diagnosa' });
    }
});

// Statistik admin
app.get('/api/stats', async (req, res) => {
    try {
        const [u] = await executeQuery('SELECT COUNT(*) count FROM users');
        const [d] = await executeQuery('SELECT COUNT(*) count FROM diagnoses');
        const [s] = await executeQuery('SELECT COUNT(*) count FROM symptoms');

        res.json({
            total_users: u.count,
            total_diagnoses: d.count,
            total_symptoms: s.count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.status(200).send('API Sistem Diagnosa OK');
});
// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server berjalan di port ${PORT}`);
});
