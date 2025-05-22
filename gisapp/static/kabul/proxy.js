const GEOSERVER_URL = 'http://localhost:8080/geoserver/wms';

function initGeoServerProxy() {
    return {
        proxyRequest: async function(url) {
            const geoserverUrl = new URL(GEOSERVER_URL);
            const requestUrl = new URL(url, window.location.origin);
            
            // Copy parameters from the original request
            const params = requestUrl.searchParams;
            geoserverUrl.search = params.toString();
            
            try {
                const response = await fetch(geoserverUrl.toString(), {
                    method: 'GET',
                    headers: {
                        'Accept': 'image/png',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`GeoServer request failed: ${response.status}`);
                }
                
                return response;
            } catch (error) {
                console.error('GeoServer proxy error:', error);
                throw error;
            }
        }
    };
}

const geoserverProxy = initGeoServerProxy();
console.log('GeoServer proxy initialized - Version 7 (Enhanced layer support)');