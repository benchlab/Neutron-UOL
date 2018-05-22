module.exports = function (grunt) {
    grunt.initConfig({
        eslint: {
            options: {
                configFile: "eslint.json"
            },
            target: [ "kepleruuid-url.js", "kepleruuid-url.test.js" ],
        },
        mochaTest: {
            "kuuid": {
                src: ["kepleruuid-url.test.js"]
            },
            options: {
                reporter: "spec"
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                report: "min"
            },
            dist: {
                src:  "kepleruuid-url.js",
                dest: "kepleruuid-url.min.js"
            }
        },
        clean: {
            clean: ["kepleruuid-url.min.js"],
            distclean: [ "node_modules" ]
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-mocha-test");

    grunt.registerTask("default", [ "eslint", "mochaTest", "uglify" ]);
};

