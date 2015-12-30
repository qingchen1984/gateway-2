module.exports = function(grunt) {

  grunt.initConfig({
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
        files: ['test/**/*.spec.js'],
        tasks: ['env:test', 'mochaTest']
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['jshint', 'mochaTest']);

};
