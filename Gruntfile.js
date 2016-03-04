module.exports = function(grunt) {

  grunt.initConfig({

    env: {
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },
    jshint: {
      options: {
          jshintrc: 'server/.jshintrc'
        },
        src: [
          'server/**/*.js',
          '!server/**/*.spec.js'
        ]
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },

    mochaTest: {
      tasks: ['env:test', 'mochaTest'],
      options: {
        reporter: 'spec',
        require: 'mocha.conf.js',
        timeout: 5000 // set default mocha spec timeout
      },
      unit: {
        src: ['server/**/*.spec.js']
      },
      integration: {
        src: ['server/**/*.integration.js']
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-env');

  grunt.registerTask('default', ['jshint', 'mochaTest']);
  grunt.registerTask('test', ['env:test', 'mochaTest']);

};
