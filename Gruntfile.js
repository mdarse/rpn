module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      examples: {
        src: ['examples/**/*', '!examples/**/*.rpn', '!examples/test.html'],
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');

  // Tasks
  grunt.registerTask('default', ['clean']);

};
