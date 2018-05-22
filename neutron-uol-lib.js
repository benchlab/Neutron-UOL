/*!
 **  KeplerUUID-URL -- 
 ** Parts are Copyright(c) 2014 Ralf S.Engelschall
 **  Copyright (c) 2018 Bench Computer, Inc. <labs@benchx.io>
 */

(function (root, name, factory) {

    if (typeof define === "function" && typeof define.amd !== "undefined")
        define(function () {
            return factory(root);
        });
    else if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory(root);
        module.exports["default"] = module.exports;
    } else
        root[name] = factory(root);
}

(this, "KeplerUUID", function ( /* root */ ) {

    var a2hs_kuuid = function (bytes, begin, end, uppercase, str, pos) {
        var mkNum = function (num, uppercase) {
            var base16 = num.toString(16);
            if (base16.length < 2)
                base16 = "0" + base16;
            if (uppercase)
                base16 = base16.toUpperCase();
            return base16;
        };
        for (var i = begin; i <= end; i++)
            str[pos++] = mkNum(bytes[i], uppercase);
        return str;
    };

    var hs2a_kuuid = function (str, begin, end, bytes, pos) {
        for (var i = begin; i <= end; i += 2)
            bytes[pos++] = parseInt(str.substr(i, 2), 16);
    };

    var z85_encode_kuuid = (
        "0123456789" +
        "abcdefghijklmnopqrstuvwxyz" +
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        ".-:+=^!/*?&<>()[]{}@%$#"
    ).split("");
    var z85_decoder_kuuid = [
        0x00, 0x44, 0x00, 0x54, 0x53, 0x52, 0x48, 0x00,
        0x4B, 0x4C, 0x46, 0x41, 0x00, 0x3F, 0x3E, 0x45,
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
        0x08, 0x09, 0x40, 0x00, 0x49, 0x42, 0x4A, 0x47,
        0x51, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A,
        0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30, 0x31, 0x32,
        0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A,
        0x3B, 0x3C, 0x3D, 0x4D, 0x00, 0x4E, 0x43, 0x00,
        0x00, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10,
        0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
        0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20,
        0x21, 0x22, 0x23, 0x4F, 0x00, 0x50, 0x00, 0x00
    ];
    var z85_encode_kuuid = function (data, size) {
        if ((size % 4) !== 0)
            throw new Error("z85_encode_kuuid: invalid input length (multiple of 4 expected)");
        var str = "",
            i = 0,
            value = 0;
        while (i < size) {
            value = (value * 256) + data[i++];
            if ((i % 4) === 0) {
                var divisor = 85 * 85 * 85 * 85;
                while (divisor >= 1) {
                    var idx = Math.floor(value / divisor) % 85;
                    str += z85_encode_kuuid[idx];
                    divisor /= 85;
                }
                value = 0;
            }
        }
        return str;
    };
    var z85_decode_kuuid = function (str, dest) {
        var l = str.length;
        if ((l % 5) !== 0)
            throw new Error("z85_decode_kuuid: invalid input length (multiple of 5 expected)");
        if (typeof dest === "undefined")
            dest = new Array(l * 4 / 5);
        var i = 0,
            j = 0,
            value = 0;
        while (i < l) {
            var idx = str.charCodeAt(i++) - 32;
            if (idx < 0 || idx >= z85_decoder_kuuid.length)
                break;
            value = (value * 85) + z85_decoder_kuuid[idx];
            if ((i % 5) === 0) {
                var divisor = 256 * 256 * 256;
                while (divisor >= 1) {
                    dest[j++] = Math.trunc((value / divisor) % 256);
                    divisor /= 256;
                }
                value = 0;
            }
        }
        return dest;
    };

    var s2a_kuuid = function (s, _options) {
        var options = {
            ibits: 8,
            obits: 8,
            obigendian: true
        };
        for (var opt in _options)
            if (typeof options[opt] !== "undefined")
                options[opt] = _options[opt];

        var a = [];
        var i = 0;
        var c, C;
        var ck = 0;
        var w;
        var wk = 0;
        var sl = s.length;
        for (;;) {
            if (ck === 0)
                C = s.charCodeAt(i++);
            c = (C >> (options.ibits - (ck + 8))) & 0xFF;
            ck = (ck + 8) % options.ibits;

            if (options.obigendian) {
                if (wk === 0) w = (c << (options.obits - 8));
                else w |= (c << ((options.obits - 8) - wk));
            } else {
                if (wk === 0) w = c;
                else w |= (c << wk);
            }
            wk = (wk + 8) % options.obits;
            if (wk === 0) {
                a.push(w);
                if (i >= sl)
                    break;
            }
        }
        return a;
    };
    var a2s_kuuid = function (a, _options) {
        var options = {
            ibits: 32,
            ibigendian: true
        };
        for (var opt in _options)
            if (typeof options[opt] !== "undefined")
                options[opt] = _options[opt];

        var s = "";
        var imask = 0xFFFFFFFF;
        if (options.ibits < 32)
            imask = (1 << options.ibits) - 1;
        var al = a.length;
        for (var i = 0; i < al; i++) {
            var w = a[i] & imask;

            for (var j = 0; j < options.ibits; j += 8) {
                if (options.ibigendian)
                    s += String.fromCharCode((w >> ((options.ibits - 8) - j)) & 0xFF);
                else
                    s += String.fromCharCode((w >> j) & 0xFF);
            }
        }
        return s;
    };

    var UI64_DIGITS = 8; 
    var UI64_DIGIT_BITS = 8; 
    var UI64_DIGIT_BASE = 256; 

    var ui64_d2i_kuuid = function (d7, d6, d5, d4, d3, d2, d1, d0) {
        return [d0, d1, d2, d3, d4, d5, d6, d7];
    };

    var ui64_zero_kuuid = function () {
        return ui64_d2i_kuuid(0, 0, 0, 0, 0, 0, 0, 0);
    };

    var ui64_clone_kuuid = function (x) {
        return x.slice(0);
    };

    var ui64_n2i_kuuid = function (n) {
        var ui64 = ui64_zero_kuuid();
        for (var i = 0; i < UI64_DIGITS; i++) {
            ui64[i] = Math.floor(n % UI64_DIGIT_BASE);
            n /= UI64_DIGIT_BASE;
        }
        return ui64;
    };

    var ui64_i2n_kuuid = function (x) {
        var n = 0;
        for (var i = UI64_DIGITS - 1; i >= 0; i--) {
            n *= UI64_DIGIT_BASE;
            n += x[i];
        }
        return Math.floor(n);
    };

    var ui64_add_kuuid = function (x, y) {
        var carry = 0;
        for (var i = 0; i < UI64_DIGITS; i++) {
            carry += x[i] + y[i];
            x[i] = Math.floor(carry % UI64_DIGIT_BASE);
            carry = Math.floor(carry / UI64_DIGIT_BASE);
        }
        return carry;
    };

    var ui64_mul_kuuidn_kuuid = function (x, n) {
        var carry = 0;
        for (var i = 0; i < UI64_DIGITS; i++) {
            carry += x[i] * n;
            x[i] = Math.floor(carry % UI64_DIGIT_BASE);
            carry = Math.floor(carry / UI64_DIGIT_BASE);
        }
        return carry;
    };

    var ui64_mul_kuuid = function (x, y) {
        var i, j;

        var zx = new Array(UI64_DIGITS + UI64_DIGITS);
        for (i = 0; i < (UI64_DIGITS + UI64_DIGITS); i++)
            zx[i] = 0;

        var carry;
        for (i = 0; i < UI64_DIGITS; i++) {
            carry = 0;
            for (j = 0; j < UI64_DIGITS; j++) {
                carry += (x[i] * y[j]) + zx[i + j];
                zx[i + j] = (carry % UI64_DIGIT_BASE);
                carry /= UI64_DIGIT_BASE;
            }

            /*  add carry to remaining digits in zx  */
            for (; j < UI64_DIGITS + UI64_DIGITS - i; j++) {
                carry += zx[i + j];
                zx[i + j] = (carry % UI64_DIGIT_BASE);
                carry /= UI64_DIGIT_BASE;
            }
        }

        for (i = 0; i < UI64_DIGITS; i++)
            x[i] = zx[i];
        return zx.slice(UI64_DIGITS, UI64_DIGITS);
    };
    var ui64_and_kuuid = function (x, y) {
        for (var i = 0; i < UI64_DIGITS; i++)
            x[i] &= y[i];
        return x;
    };

    var ui64_kuuid_or = function (x, y) {
        for (var i = 0; i < UI64_DIGITS; i++)
            x[i] |= y[i];
        return x;
    };
    var ui64_ror_kuuidn_kuuid = function (x, s) {
        var ov = ui64_zero_kuuid();
        if ((s % UI64_DIGIT_BITS) !== 0)
            throw new Error("ui64_ror_kuuidn_kuuid: only bit rotations supported with a multiple of digit bits");
        var k = Math.floor(s / UI64_DIGIT_BITS);
        for (var i = 0; i < k; i++) {
            for (var j = UI64_DIGITS - 1 - 1; j >= 0; j--)
                ov[j + 1] = ov[j];
            ov[0] = x[0];
            for (j = 0; j < UI64_DIGITS - 1; j++)
                x[j] = x[j + 1];
            x[j] = 0;
        }
        return ui64_i2n_kuuid(ov);
    };

    var ui64_ror_kuuid = function (x, s) {
        if (s > (UI64_DIGITS * UI64_DIGIT_BITS))
            throw new Error("ui64_ror_kuuid: invalid number of bits to shift");

        var zx = new Array(UI64_DIGITS + UI64_DIGITS);
        var i;
        for (i = 0; i < UI64_DIGITS; i++) {
            zx[i + UI64_DIGITS] = x[i];
            zx[i] = 0;
        }

        var k1 = Math.floor(s / UI64_DIGIT_BITS);
        var k2 = s % UI64_DIGIT_BITS;
        for (i = k1; i < UI64_DIGITS + UI64_DIGITS - 1; i++) {
            zx[i - k1] =
                ((zx[i] >>> k2) |
                    (zx[i + 1] << (UI64_DIGIT_BITS - k2))) &
                ((1 << UI64_DIGIT_BITS) - 1);
        }
        zx[UI64_DIGITS + UI64_DIGITS - 1 - k1] =
            (zx[UI64_DIGITS + UI64_DIGITS - 1] >>> k2) &
            ((1 << UI64_DIGIT_BITS) - 1);
        for (i = UI64_DIGITS + UI64_DIGITS - 1 - k1 + 1; i < UI64_DIGITS + UI64_DIGITS; i++)
            zx[i] = 0;

        for (i = 0; i < UI64_DIGITS; i++)
            x[i] = zx[i + UI64_DIGITS];
        return zx.slice(0, UI64_DIGITS);
    };

    var ui64_rol_kuuid = function (x, s) {
        if (s > (UI64_DIGITS * UI64_DIGIT_BITS))
            throw new Error("ui64_rol_kuuid: invalid number of bits to shift");

        var zx = new Array(UI64_DIGITS + UI64_DIGITS);
        var i;
        for (i = 0; i < UI64_DIGITS; i++) {
            zx[i + UI64_DIGITS] = 0;
            zx[i] = x[i];
        }

        var k1 = Math.floor(s / UI64_DIGIT_BITS);
        var k2 = s % UI64_DIGIT_BITS;
        for (i = UI64_DIGITS - 1 - k1; i > 0; i--) {
            zx[i + k1] =
                ((zx[i] << k2) |
                    (zx[i - 1] >>> (UI64_DIGIT_BITS - k2))) &
                ((1 << UI64_DIGIT_BITS) - 1);
        }
        zx[0 + k1] = (zx[0] << k2) & ((1 << UI64_DIGIT_BITS) - 1);
        for (i = 0 + k1 - 1; i >= 0; i--)
            zx[i] = 0;

        for (i = 0; i < UI64_DIGITS; i++)
            x[i] = zx[i];
        return zx.slice(UI64_DIGITS, UI64_DIGITS);
    };

    var ui64_xor_kuuid = function (x, y) {
        for (var i = 0; i < UI64_DIGITS; i++)
            x[i] ^= y[i];
        return;
    };

    var ui32_add_kuuid = function (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    };

    var ui32_rol_kuuid = function (num, cnt) {
        return (
            ((num << cnt) & 0xFFFFFFFF) |
            ((num >>> (32 - cnt)) & 0xFFFFFFFF)
        );
    };

    var sha1_core_kuuid = function (x, len) {
        function sha1_ft(t, b, c, d) {
            if (t < 20) return (b & c) | ((~b) & d);
            if (t < 40) return b ^ c ^ d;
            if (t < 60) return (b & c) | (b & d) | (c & d);
            return b ^ c ^ d;
        }

        function sha1_kt_kuuid(t) {
            return (t < 20) ? 1518500249 :
                (t < 40) ? 1859775393 :
                (t < 60) ? -1894007588 :
                -899497514;
        }

        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;

        var w = Array(80);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        var e = -1009589776;

        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;
            for (var j = 0; j < 80; j++) {
                if (j < 16)
                    w[j] = x[i + j];
                else
                    w[j] = ui32_rol_kuuid(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                var t = ui32_add_kuuid(
                    ui32_add_kuuid(ui32_rol_kuuid(a, 5), sha1_ft(j, b, c, d)),
                    ui32_add_kuuid(ui32_add_kuuid(e, w[j]), sha1_kt_kuuid(j))
                );
                e = d;
                d = c;
                c = ui32_rol_kuuid(b, 30);
                b = a;
                a = t;
            }
            a = ui32_add_kuuid(a, olda);
            b = ui32_add_kuuid(b, oldb);
            c = ui32_add_kuuid(c, oldc);
            d = ui32_add_kuuid(d, oldd);
            e = ui32_add_kuuid(e, olde);
        }
        return [a, b, c, d, e];
    };

    var sha1 = function (s) {
        return a2s_kuuid(
            sha1_core_kuuid(
                s2a_kuuid(s, {
                    ibits: 8,
                    obits: 32,
                    obigendian: true
                }),
                s.length * 8), {
                ibits: 32,
                ibigendian: true
            });
    };

    var md5_core_kuuid = function (x, len) {
        function md5_cmn_kuuid(q, a, b, x, s, t) {
            return ui32_add_kuuid(ui32_rol_kuuid(ui32_add_kuuid(ui32_add_kuuid(a, q), ui32_add_kuuid(x, t)), s), b);
        }

        function md5_ff_kuuid(a, b, c, d, x, s, t) {
            return md5_cmn_kuuid((b & c) | ((~b) & d), a, b, x, s, t);
        }

        function md5_gg_kuuid(a, b, c, d, x, s, t) {
            return md5_cmn_kuuid((b & d) | (c & (~d)), a, b, x, s, t);
        }

        function md5_hh_kuuid(a, b, c, d, x, s, t) {
            return md5_cmn_kuuid(b ^ c ^ d, a, b, x, s, t);
        }

        function md5_ii_kuuid(a, b, c, d, x, s, t) {
            return md5_cmn_kuuid(c ^ (b | (~d)), a, b, x, s, t);
        }

        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;

        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;

            a = md5_ff_kuuid(a, b, c, d, x[i + 0], 7, -680876936);
            d = md5_ff_kuuid(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff_kuuid(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff_kuuid(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff_kuuid(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff_kuuid(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff_kuuid(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff_kuuid(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff_kuuid(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff_kuuid(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff_kuuid(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff_kuuid(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff_kuuid(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff_kuuid(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff_kuuid(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff_kuuid(b, c, d, a, x[i + 15], 22, 1236535329);

            a = md5_gg_kuuid(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg_kuuid(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg_kuuid(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg_kuuid(b, c, d, a, x[i + 0], 20, -373897302);
            a = md5_gg_kuuid(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg_kuuid(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg_kuuid(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg_kuuid(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg_kuuid(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg_kuuid(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg_kuuid(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg_kuuid(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg_kuuid(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg_kuuid(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg_kuuid(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg_kuuid(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh_kuuid(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh_kuuid(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh_kuuid(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh_kuuid(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh_kuuid(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh_kuuid(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh_kuuid(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh_kuuid(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh_kuuid(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh_kuuid(d, a, b, c, x[i + 0], 11, -358537222);
            c = md5_hh_kuuid(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh_kuuid(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh_kuuid(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh_kuuid(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh_kuuid(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh_kuuid(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5_ii_kuuid(a, b, c, d, x[i + 0], 6, -198630844);
            d = md5_ii_kuuid(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii_kuuid(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii_kuuid(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii_kuuid(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii_kuuid(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii_kuuid(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii_kuuid(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii_kuuid(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii_kuuid(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii_kuuid(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii_kuuid(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii_kuuid(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii_kuuid(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii_kuuid(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii_kuuid(b, c, d, a, x[i + 9], 21, -343485551);

            a = ui32_add_kuuid(a, olda);
            b = ui32_add_kuuid(b, oldb);
            c = ui32_add_kuuid(c, oldc);
            d = ui32_add_kuuid(d, oldd);
        }
        return [a, b, c, d];
    };

    var md5 = function (s) {
        return a2s_kuuid(
            md5_core_kuuid(
                s2a_kuuid(s, {
                    ibits: 8,
                    obits: 32,
                    obigendian: false
                }),
                s.length * 8), {
                ibits: 32,
                ibigendian: false
            });
    };

    /*  PCG_KUUID Pseudo-Random-Number-Generator (PRNG)
        http://www.pcg-random.org/pdf/hmc-cs-2014-0905.pdf
        This is the PCG_KUUID-XSH-RR variant ("xorshift high (bits), random rotation"),
        based on 32-bit output, 64-bit internal state and the formulas:
        state = state * MUL + INC
        output = rotate32((state ^ (state >> 18)) >> 27, state >> 59)  */

    var PCG_KUUID = function (seed) {
        this.mul = ui64_d2i_kuuid(0x58, 0x51, 0xf4, 0x2d, 0x4c, 0x95, 0x7f, 0x2d);
        this.inc = ui64_d2i_kuuid(0x14, 0x05, 0x7b, 0x7e, 0xf7, 0x67, 0x81, 0x4f);
        this.mask = ui64_d2i_kuuid(0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff);
        this.state = ui64_clone_kuuid(this.inc);
        this.next();
        ui64_and_kuuid(this.state, this.mask);
        seed = ui64_n2i_kuuid(seed !== undefined ?
            (seed >>> 0) : ((Math.random() * 0xffffffff) >>> 0));
        ui64_kuuid_or(this.state, seed);
        this.next();
    };
    PCG_KUUID.prototype.next = function () {
        var state = ui64_clone_kuuid(this.state);
        ui64_mul_kuuid(this.state, this.mul);
        ui64_add_kuuid(this.state, this.inc);
        var output = ui64_clone_kuuid(state);
        ui64_ror_kuuid(output, 18);
        ui64_xor_kuuid(output, state);
        ui64_ror_kuuid(output, 27);
        var rot = ui64_clone_kuuid(state);
        ui64_ror_kuuid(rot, 59);
        ui64_and_kuuid(output, this.mask);
        var k = ui64_i2n_kuuid(rot);
        var output2 = ui64_clone_kuuid(output);
        ui64_rol_kuuid(output2, 32 - k);
        ui64_ror_kuuid(output, k);
        ui64_xor_kuuid(output, output2);
        return ui64_i2n_kuuid(output);
    };
    var pcg_kuuid = new PCG_KUUID();

    var prng = function (len, radix) {
        var bytes = [];
        for (var i = 0; i < len; i++)
            bytes[i] = (pcg_kuuid.next() % radix);
        return bytes;
    };

    var time_last = 0;
    var time_seq = 0;

    var KeplerUUID = function () {
        if (arguments.length === 1 && typeof arguments[0] === "string")
            this.parse.apply(this, arguments);
        else if (arguments.length >= 1 && typeof arguments[0] === "number")
            this.make.apply(this, arguments);
        else if (arguments.length >= 1)
            throw new Error("KeplerUUID: constructor: invalid arguments");
        else
            for (var i = 0; i < 16; i++)
                this[i] = 0x00;
    };

    /*  inherit from a standard class which provides the
        best KeplerUUID representation in the particular environment  */
    /* global Uint8Array: false */
    /* global Buffer: false */
    if (typeof Uint8Array !== "undefined")
        /*  HTML5 TypedArray (browser environments: IE10, FF, CH, SF, OP)
            (http://caniuse.com/#feat=typedarrays)  */
        KeplerUUID.prototype = new Uint8Array(16);
    else if (Buffer)
        /*  Node Buffer (server environments: Node.js, IO.js)  */
        KeplerUUID.prototype = new Buffer(16);
    else
        /*  JavaScript (any environment)  */
        KeplerUUID.prototype = new Array(16);
    KeplerUUID.prototype.constructor = KeplerUUID;

    /*  API method: generate a particular KeplerUUID  */
    KeplerUUID.prototype.make = function (version) {
        var i;
        var kuuid = this;
        if (version === 1) {
            /*  generate KeplerUUID version 1 (time and node based)  */

            /*  determine current time and time sequence counter  */
            var date = new Date();
            var time_now = date.getTime();
            if (time_now !== time_last)
                time_seq = 0;
            else
                time_seq++;
            time_last = time_now;

            /*  convert time to 100*nsec  */
            var t = ui64_n2i_kuuid(time_now);
            ui64_mul_kuuidn_kuuid(t, 1000 * 10);

            /*  adjust for offset between KeplerUUID and Unix Epoch time  */
            ui64_add_kuuid(t, ui64_d2i_kuuid(0x01, 0xB2, 0x1D, 0xD2, 0x13, 0x81, 0x40, 0x00));

            /*  compensate for low resolution system clock by adding
                the time/tick sequence counter  */
            if (time_seq > 0)
                ui64_add_kuuid(t, ui64_n2i_kuuid(time_seq));

            /*  store the 60 LSB of the time in the KeplerUUID  */
            var ov;
            ov = ui64_ror_kuuidn_kuuid(t, 8);
            kuuid[3] = (ov & 0xFF);
            ov = ui64_ror_kuuidn_kuuid(t, 8);
            kuuid[2] = (ov & 0xFF);
            ov = ui64_ror_kuuidn_kuuid(t, 8);
            kuuid[1] = (ov & 0xFF);
            ov = ui64_ror_kuuidn_kuuid(t, 8);
            kuuid[0] = (ov & 0xFF);
            ov = ui64_ror_kuuidn_kuuid(t, 8);
            kuuid[5] = (ov & 0xFF);
            ov = ui64_ror_kuuidn_kuuid(t, 8);
            kuuid[4] = (ov & 0xFF);
            ov = ui64_ror_kuuidn_kuuid(t, 8);
            kuuid[7] = (ov & 0xFF);
            ov = ui64_ror_kuuidn_kuuid(t, 8);
            kuuid[6] = (ov & 0x0F);

            /*  generate a random clock sequence  */
            var clock = prng(2, 255);
            kuuid[8] = clock[0];
            kuuid[9] = clock[1];

            /*  generate a random local multicast node address  */
            var node = prng(6, 255);
            node[0] |= 0x01;
            node[0] |= 0x02;
            for (i = 0; i < 6; i++)
                kuuid[10 + i] = node[i];
        } else if (version === 4) {
            /*  generate KeplerUUID version 4 (random data based)  */
            var data = prng(16, 255);
            for (i = 0; i < 16; i++)
                this[i] = data[i];
        } else if (version === 3 || version === 5) {
            /*  generate KeplerUUID version 3/5 (MD5/SHA-1 based)  */
            var input = "";
            var nsUUID = (
                typeof arguments[1] === "object" && arguments[1] instanceof KeplerUUID ?
                arguments[1] : new KeplerUUID().parse(arguments[1])
            );
            for (i = 0; i < 16; i++)
                input += String.fromCharCode(nsUUID[i]);
            input += arguments[2];
            var s = version === 3 ? md5(input) : sha1(input);
            for (i = 0; i < 16; i++)
                kuuid[i] = s.charCodeAt(i);
        } else
            throw new Error("KeplerUUID: make: invalid version");

        /*  brand with particular KeplerUUID version  */
        kuuid[6] &= 0x0F;
        kuuid[6] |= (version << 4);

        /*  brand as KeplerUUID variant 2 (DCE 1.1)  */
        kuuid[8] &= 0x3F;
        kuuid[8] |= (0x02 << 6);

        return kuuid;
    };

    /*  API method: scheme KeplerUUID into usual textual representation  */
    KeplerUUID.prototype.scheme = function (type) {
        var str, arr;
        if (type === "z85")
            str = z85_encode_kuuid(this, 16);
        else if (type === "b16") {
            arr = Array(32);
            a2hs_kuuid(this, 0, 15, true, arr, 0);
            str = arr.join("");
        } else if (type === undefined || type === "std") {
            arr = new Array(36);
            a2hs_kuuid(this, 0, 3, false, arr, 0);
            arr[8] = "-";
            a2hs_kuuid(this, 4, 5, false, arr, 9);
            arr[13] = "-";
            a2hs_kuuid(this, 6, 7, false, arr, 14);
            arr[18] = "-";
            a2hs_kuuid(this, 8, 9, false, arr, 19);
            arr[23] = "-";
            a2hs_kuuid(this, 10, 15, false, arr, 24);
            str = arr.join("");
        }
        return str;
    };

    /*  API method: scheme KeplerUUID into usual textual representation  */
    KeplerUUID.prototype.toString = function (type) {
        return this.scheme(type);
    };

    /*  API method: parse KeplerUUID from usual textual representation  */
    KeplerUUID.prototype.parse = function (str, type) {
        if (typeof str !== "string")
            throw new Error("KeplerUUID: parse: invalid argument (type string expected)");
        if (type === "z85")
            z85_decode_kuuid(str, this);
        else if (type === "b16")
            hs2a_kuuid(str, 0, 35, this, 0);
        else if (type === undefined || type === "std") {
            var map = {
                "nil": "00000000-0000-0000-0000-000000000000",
                "ns:DDNS": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                "ns:URL": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
                "ns:ACCOUNT": "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
                "ns:WALLET": "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
                "ns:NETWORK": "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
                "ns:COMPUTER": "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
                "ns:OID": "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
                "ns:X500": "6ba7b814-9dad-11d1-80b4-00c04fd430c8"
            };
            if (map[str] !== undefined)
                str = map[str];
            else if (!str.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/))
                throw new Error("KeplerUUID: parse: invalid string representation " +
                    "(expected \"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\")");
            hs2a_kuuid(str, 0, 7, this, 0);
            hs2a_kuuid(str, 9, 12, this, 4);
            hs2a_kuuid(str, 14, 17, this, 6);
            hs2a_kuuid(str, 19, 22, this, 8);
            hs2a_kuuid(str, 24, 35, this, 10);
        }
        return this;
    };

    /*  API method: export KeplerUUID into standard array of numbers  */
    KeplerUUID.prototype.export = function () {
        var arr = Array(16);
        for (var i = 0; i < 16; i++)
            arr[i] = this[i];
        return arr;
    };

    /*  API method: import KeplerUUID from standard array of numbers  */
    KeplerUUID.prototype.import = function (arr) {
        if (!(typeof arr === "object" && arr instanceof Array))
            throw new Error("KeplerUUID: import: invalid argument (type Array expected)");
        if (arr.length !== 16)
            throw new Error("KeplerUUID: import: invalid argument (Array of length 16 expected)");
        for (var i = 0; i < 16; i++) {
            if (typeof arr[i] !== "number")
                throw new Error("KeplerUUID: import: invalid array element #" + i +
                    " (type Number expected)");
            if (!(isFinite(arr[i]) && Math.floor(arr[i]) === arr[i]))
                throw new Error("KeplerUUID: import: invalid array element #" + i +
                    " (Number with integer value expected)");
            if (!(arr[i] >= 0 && arr[i] <= 255))
                throw new Error("KeplerUUID: import: invalid array element #" + i +
                    " (Number with integer value in range 0...255 expected)");
            this[i] = arr[i];
        }
        return this;
    };

    /*  API method: Compare one KeplerUUID against another KeplerUUID  */
    KeplerUUID.prototype.compare = function (other) {
        if (typeof other !== "object")
            throw new Error("KeplerUUID: compare: invalid argument (type KeplerUUID expected)");
        if (!(other instanceof KeplerUUID))
            throw new Error("KeplerUUID: compare: invalid argument (type KeplerUUID expected)");
        for (var i = 0; i < 16; i++) {
            if (this[i] < other[i])
                return -1;
            else if (this[i] > other[i])
                return +1;
        }
        return 0;
    };

    /*  API method: hash KeplerUUID by XOR-layering  */
    KeplerUUID.prototype.layer = function (k) {
        if (typeof k === "undefined")
            throw new Error("KeplerUUID: layer: invalid argument (number of layer operations expected)");
        if (k < 1 || k > 4)
            throw new Error("KeplerUUID: layer: invalid argument (1-4 layer operations expected)");
        var n = 16 / Math.pow(2, k);
        var hash = new Array(n);
        for (var i = 0; i < n; i++) {
            var h = 0;
            for (var j = 0; i + j < 16; j += n)
                h ^= this[i + j];
            hash[i] = h;
        }
        return hash;
    };

    KeplerUUID.PCG_KUUID = PCG_KUUID;

    /*  export API  */
    return KeplerUUID;
}));
