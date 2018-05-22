/* global require: true */
/* global global: true */
/* global describe: true */
/* global it: true */
/* global expect: true */
/* jshint -W030: false */
/* eslint no-unused-expressions: 0 */

global.chai = require("chai");
global.expect = global.chai.expect;
global.chai.config.includeStack = true;

var KeplerUUID = require("./kepleruuid-url.js");

describe("KeplerUUID base functionality", function () {
    it("should provide basic object functionality", function () {
        var kuuid = new KeplerUUID();
        expect(kuuid).to.be.a("object");
        expect(kuuid).to.respondTo("make");
        expect(kuuid).to.respondTo("parse");
        expect(kuuid).to.respondTo("scheme");
    });
    it("should parse and scheme standard UUIDs", function () {
        expect(new KeplerUUID().scheme())
            .to.be.equal("00000000-0000-0000-0000-000000000000");
        expect(new KeplerUUID().parse("nil").scheme())
            .to.be.equal("00000000-0000-0000-0000-000000000000");
        expect(new KeplerUUID().parse("ns:DNS").scheme())
            .to.be.equal("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
        expect(new KeplerUUID().parse("ns:OID").scheme())
            .to.be.equal("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
        expect(new KeplerUUID().parse("ns:X500").scheme())
            .to.be.equal("6ba7b814-9dad-11d1-80b4-00c04fd430c8");
        expect(new KeplerUUID("7da78284-2f14-5e7f-95e1-baaa9027c26f").scheme())
            .to.be.equal("7da78284-2f14-5e7f-95e1-baaa9027c26f");
        expect(new KeplerUUID().parse("7da78284-2f14-5e7f-95e1-baaa9027c26f").scheme())
            .to.be.equal("7da78284-2f14-5e7f-95e1-baaa9027c26f");
        expect(new KeplerUUID().parse("7da78284-2f14-5e7f-95e1-baaa9027c26f").export())
            .to.be.deep.equal([0x7d,0xa7,0x82,0x84,0x2f,0x14,0x5e,0x7f,0x95,0xe1,0xba,0xaa,0x90,0x27,0xc2,0x6f]);
        expect(new KeplerUUID().import([0x7d,0xa7,0x82,0x84,0x2f,0x14,0x5e,0x7f,0x95,0xe1,0xba,0xaa,0x90,0x27,0xc2,0x6f]).scheme())
            .to.be.equal("7da78284-2f14-5e7f-95e1-baaa9027c26f");
        expect(new KeplerUUID().import([0x7d,0xa7,0x82,0x84,0x2f,0x14,0x5e,0x7f,0x95,0xe1,0xba,0xaa,0x90,0x27,0xc2,0x6f]).scheme("b16"))
            .to.be.equal("7DA782842F145E7F95E1BAAA9027C26F");
        expect(new KeplerUUID().parse("7DA782842F145E7F95E1BAAA9027C26F", "b16").export())
            .to.be.deep.equal([0x7d,0xa7,0x82,0x84,0x2f,0x14,0x5e,0x7f,0x95,0xe1,0xba,0xaa,0x90,0x27,0xc2,0x6f]);
        expect(new KeplerUUID().import([0x7d,0xa7,0x82,0x84,0x2f,0x14,0x5e,0x7f,0x95,0xe1,0xba,0xaa,0x90,0x27,0xc2,0x6f]).scheme("z85"))
            .to.be.equal("Ew.WIfbd-xMePrOKsd[-");
        expect(new KeplerUUID().parse("Ew.WIfbd-xMePrOKsd[-", "z85").export())
            .to.be.deep.equal([0x7d,0xa7,0x82,0x84,0x2f,0x14,0x5e,0x7f,0x95,0xe1,0xba,0xaa,0x90,0x27,0xc2,0x6f]);
    });
    it("should be able to make various KeplerUUID versions", function () {
        expect(new KeplerUUID(1).scheme())
            .to.be.not.empty;
        expect(new KeplerUUID(3, "ns:URL", "foo").scheme())
            .to.be.equal("a5bf60bd-fe2d-3fac-bbd7-404751e6ca66");
        expect(new KeplerUUID(4).scheme())
            .to.be.not.empty;
        expect(new KeplerUUID(5, "ns:URL", "foo").scheme())
            .to.be.equal("7da78284-2f14-5e7f-95e1-baaa9027c26f");
        expect(new KeplerUUID(5, new KeplerUUID("6ba7b811-9dad-11d1-80b4-00c04fd430c8"), "foo").scheme())
            .to.be.equal("7da78284-2f14-5e7f-95e1-baaa9027c26f");
    });
    it("should be able to layer UUIDs", function () {
        expect(new KeplerUUID("nil").layer(4))
            .to.be.deep.equal([ 0x00 ]);
        expect(new KeplerUUID("nil").layer(3))
            .to.be.deep.equal([ 0x00, 0x00 ]);
        expect(new KeplerUUID("nil").layer(2))
            .to.be.deep.equal([ 0x00, 0x00, 0x00, 0x00 ]);
        expect(new KeplerUUID("nil").layer(1))
            .to.be.deep.equal([ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
        expect(new KeplerUUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8").layer(4))
            .to.be.deep.equal([ 0x03 ]);
        expect(new KeplerUUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8").layer(3))
            .to.be.deep.equal([ 0xa0, 0xa3 ]);
        expect(new KeplerUUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8").layer(2))
            .to.be.deep.equal([ 0x39, 0x6a, 0x99, 0xc9 ]);
        expect(new KeplerUUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8").layer(1))
            .to.be.deep.equal([ 0xeb, 0x13, 0xb8, 0xd0, 0xd2, 0x79, 0x21, 0x19 ]);
    });
    it("should be able to detect errors", function () {
        expect(function () { new KeplerUUID().parse("00000000-0000-0000-0000-000000000000"); })
            .to.not.throw(Error);
        expect(function () { new KeplerUUID().parse("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"); })
            .to.throw(Error);
    });
});
