module.exports = function (grunt) {
    grunt.initConfig({
        eslint: {
            options: {
                configFile: "eslint.json"
            },
            target: [ "neutron-uol-lib.js", "neutron-uol-lib.test.js" ],
        },
        mochaTest: {
            "kuuid": {
                src: ["neutron-uol-lib.test.js"]
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
                src:  "neutron-uol-lib.js",
                dest: "neutron-uol-lib.min.js"
            }
        },
        clean: {
            clean: ["neutron-uol-lib.min.js"],
            distclean: [ "node_modules" ]
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-mocha-test");

    grunt.registerTask("default", [ "eslint", "mochaTest", "uglify" ]);
};

