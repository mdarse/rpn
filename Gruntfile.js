module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      build: {
        src: ['lib/**/*'],
        filter: function(filepath) {
          // Match all Javascript
          if (/\.js$/.test(filepath)) return true;
          // Source maps
          if (/\.js.map$/.test(filepath)) return true;
          // .d.ts files with a corresponding .ts
          var TS_DEF_REGEX = /\.d\.ts$/i,
              fs = require('fs');
          if (TS_DEF_REGEX.test(filepath)&& fs.existsSync(
            filepath.replace(TS_DEF_REGEX, '.ts')
          )) return true;

          // Don't match other files
          return false;
        }
      },
      examples: {
        src: ['examples/**/*', '!examples/**/*.rpn', '!examples/test.html'],
      }
    },
    typescript: {
      base: {
        src: ['lib/**/*.ts'],
        // dest: 'lib/',
        options: {
          // module: 'commonjs', //or amd
          target: 'es5', //or es3
          // base_path: '.',
          // sourcemap: true,
          // fullSourceMapPath: true,
          // declaration: true,
        }
      }
    },
    watch: {
      ts: {
        files: ['<%= typescript.base.src %>'],
        tasks: ['build'],
        options: {
          spawn: false,
        },
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-typescript');

  // Tasks
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['typescript']);

};
