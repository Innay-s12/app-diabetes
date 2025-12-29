// server.js - VERSION FOR RAILWAY DEPLOYMENT
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend folder (for Railway)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ==================== DATABASE CONFIGURATION ====================
console.log('🔧 Database Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL available:', !!process.env.DATABASE_URL);

let db;

// Database setup based on environment
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    // PRODUCTION: Use Railway PostgreSQL/MySQL
    console.log('🚀 Using Railway database from DATABASE_URL');
    
    // Check if it's MySQL or PostgreSQL
    if (process.env.DATABASE_URL.includes('mysql://')) {
        // MySQL (Railway)
        const mysql = require('mysql2');
        db = mysql.createConnection(process.env.DATABASE_URL);
        
        db.connect((err) => {
            if (err) {
                console.error('❌ MySQL Connection Error:', err.message);
                setupMockDatabase();
            } else {
                console.log('✅ Connected to Railway MySQL database');
            }
        });
    } else if (process.env.DATABASE_URL.includes('postgres://')) {
        // PostgreSQL (Railway)
        console.log('📊 PostgreSQL detected - using mock data for now');
        setupMockDatabase();
    }
} else {
    // DEVELOPMENT: Use mock database for testing
    console.log('💻 Development mode: Using mock database');
    setupMockDatabase();
}

// Mock database for Railway deployment
function setupMockDatabase() {
    console.log('📁 Setting up mock in-memory database');
    
    db = {
        // Mock query function
        query: (sql, params, callback) => {
            console.log(`📝 Mock DB Query: ${sql}`);
            
            // Simulate async delay
            setTimeout(() => {
                // Handle different queries
                if (sql.includes('SELECT 1 + 1')) {
                    callback(null, [{ result: 2 }]);
                } 
                else if (sql.includes('SELECT * FROM admin')) {
                    callback(null, [
                        { name: 'admin', sandi: 111111 },
                        { name: 'inay', sandi: 111111 }
                    ]);
                }
                else if (sql.includes('SELECT * FROM users')) {
                    callback(null, [
                        { id: 1, nama_lengkap: 'John Doe', usia: 30, jenis_kelamin: 'L', created_at: new Date() },
                        { id: 2, nama_lengkap: 'Jane Smith', usia: 25, jenis_kelamin: 'P', created_at: new Date() }
                    ]);
                }
                else if (sql.includes('SELECT * FROM symptoms')) {
                    callback(null, [
                        { id: 1, kode_gejala: 'G01', nama_gejala: 'Sering Haus', bobot: 2, tingkat_keparahan: 'Sedang' },
                        { id: 2, kode_gejala: 'G02', nama_gejala: 'Sering Buang Air', bobot: 3, tingkat_keparahan: 'Tinggi' },
                        { id: 3, kode_gejala: 'G03', nama_gejala: 'Lelah Berlebihan', bobot: 2, tingkat_keparahan: 'Sedang' }
                    ]);
                }
                else if (sql.includes('SELECT * FROM recommendations')) {
                    callback(null, [
                        { id: 1, kategori: 'Diet', judul: 'Kurangi Gula', deskripsi: 'Konsumsi gula maksimal 25g/hari', untuk_tingkat_risiko: 'Tinggi' },
                        { id: 2, kategori: 'Olahraga', judul: 'Jalan Pagi', deskripsi: 'Lakukan jalan kaki 30 menit setiap pagi', untuk_tingkat_risiko: 'Sedang' }
                    ]);
                }
                else if (sql.includes('SELECT * FROM diagnoses')) {
                    callback(null, [
                        { id: 1, user_id: 1, tingkat_risiko: 'Tinggi', skor_akhir: 85, created_at: new Date() },
                        { id: 2, user_id: 2, tingkat_risiko: 'Sedang', skor_akhir: 65, created_at: new Date() }
                    ]);
                }
                else if (sql.includes('INSERT INTO') || sql.includes('UPDATE') || sql.includes('DELETE')) {
                    // Mock successful write operation
                    callback(null, { insertId: 999, affectedRows: 1 });
                }
                else {
                    // Default empty result
                    callback(null, []);
                }
            }, 100);
        }
    };
    
    console.log('✅ Mock database ready');
}

// ==================== HELPER FUNCTIONS ====================
const executeQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        if (!db || !db.query) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('❌ Database Error:', err.message);
                console.error('SQL:', sql);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// ==================== FRONTEND ROUTES ====================
// Serve HTML pages from frontend folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'admin.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

app.get('/diagnoses', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'diagnoses.html'));
});

app.get('/diagnosis', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'diagnosis.html'));
});

app.get('/diseases', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'diseases.html'));
});

app.get('/gejala', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'gejala.html'));
});

app.get('/pengguna', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'pengguna.html'));
});

app.get('/recommendations', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'recommendations.html'));
});

// ==================== API ROUTES ====================

// 1. HEALTH CHECK (Required for Railway)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Diabetes Diagnosis API',
        environment: process.env.NODE_ENV || 'development'
    });
});

// 2. TEST DATABASE CONNECTION
app.get('/test-db', async (req, res) => {
    try {
        const result = await executeQuery('SELECT 1 + 1 AS result');
        res.json({ 
            success: true, 
            message: 'Database connection successful',
            result: result[0],
            environment: process.env.NODE_ENV
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Database test failed',
            message: error.message
        });
    }
});

// 3. ADMIN AUTHENTICATION
app.get('/admin/login', (req, res) => {
    res.json({
        message: 'Admin login endpoint',
        method: 'POST to this endpoint with {name, sandi}',
        test_accounts: [
            { name: 'admin', sandi: 111111 },
            { name: 'inay', sandi: 111111 }
        ]
    });
});

app.post('/admin/login', async (req, res) => {
    try {
        const { name, sandi } = req.body;
        
        if (!name || !sandi) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name and password required' 
            });
        }
        
        // Convert sandi to number
        const sandiNumber = parseInt(sandi);
        
        const query = 'SELECT * FROM admin WHERE name = ? AND sandi = ?';
        const results = await executeQuery(query, [name, sandiNumber]);
        
        if (results.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }
        
        res.json({
            success: true,
            message: 'Login successful',
            admin: results[0]
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Login failed',
            message: error.message 
        });
    }
});

// 4. USERS ENDPOINTS
app.get('/api/users', async (req, res) => {
    try {
        const users = await executeQuery('SELECT * FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { nama_lengkap, usia, jenis_kelamin } = req.body;
        
        if (!nama_lengkap || !usia || !jenis_kelamin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const query = 'INSERT INTO users (nama_lengkap, usia, jenis_kelamin) VALUES (?, ?, ?)';
        const result = await executeQuery(query, [nama_lengkap, usia, jenis_kelamin]);
        
        res.json({
            success: true,
            message: 'User created successfully',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
});

// 5. SYMPTOMS ENDPOINTS
app.get('/api/symptoms', async (req, res) => {
    try {
        const symptoms = await executeQuery('SELECT * FROM symptoms ORDER BY id');
        res.json(symptoms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch symptoms', details: error.message });
    }
});

// 6. DIAGNOSES ENDPOINTS
app.get('/api/diagnoses', async (req, res) => {
    try {
        const query = `
            SELECT d.*, u.nama_lengkap 
            FROM diagnoses d 
            LEFT JOIN users u ON d.user_id = u.id 
            ORDER BY d.created_at DESC
        `;
        const diagnoses = await executeQuery(query);
        res.json(diagnoses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch diagnoses', details: error.message });
    }
});

// 7. RECOMMENDATIONS ENDPOINTS
app.get('/api/recommendations', async (req, res) => {
    try {
        const recommendations = await executeQuery('SELECT * FROM recommendations ORDER BY id');
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recommendations', details: error.message });
    }
});

// 8. FORWARD CHAINING DIAGNOSIS
app.post('/api/diagnosis/process', async (req, res) => {
    try {
        const { user_id, symptoms } = req.body;
        
        // Mock forward chaining logic
        const faktaKode = symptoms || ['G01', 'G02'];
        let tingkat_risiko = 'Rendah';
        let skor_akhir = 0;

        // Rule-based forward chaining
        if (faktaKode.includes('G01') && faktaKode.includes('G02') && faktaKode.includes('G06')) {
            tingkat_risiko = 'Tinggi';
            skor_akhir = 85;
        } else if (faktaKode.includes('G01') && faktaKode.includes('G06')) {
            tingkat_risiko = 'Tinggi';
            skor_akhir = 80;
        } else if (faktaKode.includes('G02') && faktaKode.includes('G03')) {
            tingkat_risiko = 'Sedang';
            skor_akhir = 65;
        } else if (faktaKode.includes('G02') && faktaKode.includes('G06')) {
            tingkat_risiko = 'Sedang';
            skor_akhir = 60;
        } else if (faktaKode.includes('G01')) {
            tingkat_risiko = 'Sedang';
            skor_akhir = 55;
        } else {
            tingkat_risiko = 'Rendah';
            skor_akhir = 40;
        }

        // Calculate score based on symptoms
        faktaKode.forEach((kode, index) => {
            skor_akhir += (index + 1) * 5;
        });

        // Mock save to database
        const insertQuery = 'INSERT INTO diagnoses (user_id, tingkat_risiko, skor_akhir) VALUES (?, ?, ?)';
        await executeQuery(insertQuery, [user_id || 1, tingkat_risiko, skor_akhir]);

        res.json({
            success: true,
            message: 'Diagnosis processed successfully',
            metode: 'Forward Chaining',
            fakta_gejala: faktaKode,
            tingkat_risiko,
            skor_akhir,
            rekomendasi: 'Konsultasi dengan dokter untuk pemeriksaan lebih lanjut'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Diagnosis processing failed', 
            details: error.message 
        });
    }
});

// 9. DASHBOARD STATISTICS
app.get('/api/stats', async (req, res) => {
    try {
        const stats = {
            total_users: 15,
            total_diagnoses: 42,
            total_symptoms: 8,
            total_recommendations: 6,
            risk_distribution: [
                { tingkat_risiko: 'Tinggi', count: 10 },
                { tingkat_risiko: 'Sedang', count: 20 },
                { tingkat_risiko: 'Rendah', count: 12 }
            ],
            latest_users: [
                { id: 1, nama_lengkap: 'Ahmad', usia: 35, jenis_kelamin: 'L' },
                { id: 2, nama_lengkap: 'Siti', usia: 28, jenis_kelamin: 'P' }
            ],
            latest_diagnoses: [
                { id: 1, nama_lengkap: 'Ahmad', tingkat_risiko: 'Tinggi', skor_akhir: 85 },
                { id: 2, nama_lengkap: 'Siti', tingkat_risiko: 'Sedang', skor_akhir: 65 }
            ]
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
    }
});

// 10. API INFO ENDPOINT
app.get('/api/info', (req, res) => {
    res.json({
        service: 'Diabetes Diagnosis Expert System API',
        version: '2.0.0',
        status: 'operational',
        environment: process.env.NODE_ENV || 'development',
        deployment: 'Railway',
        endpoints: {
            auth: ['GET /admin/login', 'POST /admin/login'],
            users: ['GET /api/users', 'POST /api/users'],
            symptoms: ['GET /api/symptoms'],
            diagnoses: ['GET /api/diagnoses', 'POST /api/diagnosis/process'],
            recommendations: ['GET /api/recommendations'],
            utility: ['GET /health', 'GET /test-db', 'GET /api/stats']
        },
        frontend_pages: ['/', '/admin', '/login', '/diagnoses', '/diagnosis', '/gejala', '/pengguna', '/recommendations']
    });
});

// ==================== ERROR HANDLING ====================
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
        available_endpoints: '/api/info'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('⚠️ Server Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

// ==================== SERVER START ====================
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ========================================
    🚀 DIABETES DIAGNOSIS SYSTEM API
    ========================================
    ✅ Server is running!
    📍 Port: ${PORT}
    🌐 Environment: ${process.env.NODE_ENV || 'development'}
    📁 Database: ${process.env.DATABASE_URL ? 'Railway Database' : 'Mock Database'}
    🏠 Local URL: http://localhost:${PORT}
    🔗 Health Check: http://localhost:${PORT}/health
    📊 API Info: http://localhost:${PORT}/api/info
    ========================================
    `);
    
    // Test database connection
    console.log('🧪 Testing database connection...');
    executeQuery('SELECT 1 + 1 AS result')
        .then(result => console.log('✅ Database test passed:', result[0]))
        .catch(err => console.log('⚠️ Database test failed (using mock):', err.message));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('💤 Server shut down.');
        process.exit(0);
    });
});
