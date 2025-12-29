// frontend/js/config.js
// Konfigurasi API untuk semua halaman

const API_CONFIG = {
    // Base URL otomatis berdasarkan environment
    BASE_URL: window.location.origin,
    
    // Semua endpoint API
    ENDPOINTS: {
        // Authentication
        ADMIN_LOGIN: '/admin/login',
        
        // Data
        USERS: '/api/users',
        SYMPTOMS: '/api/symptoms',
        DIAGNOSES: '/api/diagnoses',
        RECOMMENDATIONS: '/api/recommendations',
        
        // Operations
        DIAGNOSIS_PROCESS: '/api/diagnosis/process',
        USER_SYMPTOMS: '/api/user-symptoms',
        STATS: '/api/stats'
    },
    
    // Helper functions
    getUrl(endpoint) {
        return this.BASE_URL + endpoint;
    },
    
    async fetchApi(endpoint, options = {}) {
        const url = this.getUrl(endpoint);
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }
};

// Buat global untuk mudah diakses
window.API_CONFIG = API_CONFIG;
