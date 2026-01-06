// ==================== IMPORT ====================
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// ==================== INIT ====================
const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ROOT ROUTE (WAJIB UNTUK RAILWAY) ====================
app.get('/', (req, res) => {
    res.status(200).send('🚀 Diabetes Diagnosis API is running');
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ==================== STATIC FRONTEND (OPSIONAL) ====================
const staticPath = path.join(__dirname, '../frontend');
if (fs.existsSync(staticPath)) {
    console.log('✅ Frontend folder found');
    app.use('/frontend', express.static(staticPath));
} else {
    console.log('⚠️ Frontend folder not found');
}

// ==================== MOCK DATABASE ====================
const mockDB = {
    query: (sql, params, callback) => {
        setTimeout(() => {
            if (sql.includes('SELECT 1 + 1')) {
                callback(null, [{ result: 2 }]);
            } else if (sql.includes('admin')) {
                callback(null, [
                    { name: 'admin', sandi: 111111 },
                    { name: 'inay', sandi: 111111 }
                ]);
            } else if (sql.includes('users')) {
                callback(null, [
                    { id: 1, nama_lengkap: 'John Doe', usia: 30, jenis_kelamin: 'L' },
                    { id: 2, nama_lengkap: 'Jane Smith', usia: 25, jenis_kelamin: 'P' }
                ]);
            } else if (sql.includes('symptoms')) {
                callback(null, [
                    { id: 1, kode_gejala: 'G01', nama_gejala: 'Sering Haus', bobot: 2 },
                    { id: 2, kode_gejala: 'G02', nama_gejala: 'Sering Buang Air', bobot: 3 },
                    { id: 3, kode_gejala: 'G03', nama_gejala: 'Lelah Berlebihan', bobot: 2 }
                ]);
            } else {
                callback(null, []);
            }
        }, 50);
    }
};

const executeQuery = (sql, params = []) =>
    new Promise((resolve, reject) => {
        mockDB.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });

// ==================== API ENDPOINTS ====================

// Test DB
app.get('/test-db', async (req, res) => {
    const result = await executeQuery('SELECT 1 + 1 AS result');
    res.json({ success: true, data: result[0] });
});

// Admin login
app.post('/admin/login', async (req, res) => {
    const { name, sandi } = req.body;
    if (!name || !sandi) {
        return res.status(400).json({ error: 'Name & sandi required' });
    }

    const admins = await executeQuery('SELECT * FROM admin');
    const admin = admins.find(a => a.name === name && a.sandi == sandi);

    if (!admin) {
        return res.status(401).json({ error: 'Login gagal' });
    }

    res.json({ success: true, admin });
});

// Users
app.get('/api/users', async (req, res) => {
    const users = await executeQuery('SELECT * FROM users');
    res.json(users);
});

// Symptoms
app.get('/api/symptoms', async (req, res) => {
    const symptoms = await executeQuery('SELECT * FROM symptoms');
    res.json(symptoms);
});

// Diagnosis
app.post('/api/diagnosis/process', async (req, res) => {
    const { symptoms = [] } = req.body;
    const score = symptoms.length * 20;

    let risk = 'Rendah';
    if (score > 70) risk = 'Tinggi';
    else if (score > 40) risk = 'Sedang';

    res.json({
        success: true,
        skor: score,
        risiko: risk,
        rekomendasi: 'Silakan konsultasi ke dokter'
    });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found'
    });
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🚀 Diabetes Diagnosis API RUNNING');
    console.log(`📍 Port : ${PORT}`);
    console.log(`🌐 URL  : http://localhost:${PORT}`);
    console.log('='.repeat(50));
});
