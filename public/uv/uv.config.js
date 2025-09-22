/*global Ultraviolet*/
// Make encode/decode lazy so this file doesn't throw if Ultraviolet isn't defined at parse time.
self.__uv$config = (function () {
    const cfg = {
        // UV proxy prefix (requests will be made to: <origin>/uv/service/<encoded>)
        prefix: '/uv/service/',
        // lazy encode/decode wrappers (will throw if Ultraviolet codec isn't available when called)
        encodeUrl: function (url) {
            if (typeof Ultraviolet !== 'undefined' && Ultraviolet.codec && Ultraviolet.codec.xor && typeof Ultraviolet.codec.xor.encode === 'function') {
                return Ultraviolet.codec.xor.encode(url);
            }
            throw new Error('Ultraviolet codec not available');
        },
        decodeUrl: function (s) {
            if (typeof Ultraviolet !== 'undefined' && Ultraviolet.codec && Ultraviolet.codec.xor && typeof Ultraviolet.codec.xor.decode === 'function') {
                return Ultraviolet.codec.xor.decode(s);
            }
            throw new Error('Ultraviolet codec not available');
        },
        handler: '/uv/uv.handler.js',
        client: '/uv/uv.client.js',
        bundle: '/uv/uv.bundle.js',
        config: '/uv/uv.config.js',
        sw: '/uv/uv.sw.js',
    };
    return cfg;
})();
