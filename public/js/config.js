const CONFIG = {
    API_BASE_URL: '' // Empty string for relative paths
};

function getApiUrl(endpoint) {
    return CONFIG.API_BASE_URL + endpoint;
}
