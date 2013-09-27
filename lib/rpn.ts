/// <reference path="jison.d.ts" />
/// <reference path="source-map.d.ts" />

import jison = require('jison');
import sourceMap = require("source-map");
import lex = require("./rpn/lex");
import bnf = require("./rpn/bnf");

var parser = new jison.Parser({
  lex: lex.lex,
  bnf: bnf.bnf
});

parser.yy = require("./rpn/ast").AST;

function getPreamble () {
  return new sourceMap.SourceNode(null, null, null, "")
    .add("var __rpn = {};\n")
    .add("__rpn._stack = [];\n")
    .add("__rpn.temp = 0;\n")
    .add("var __rpn_env = {};\n")

    .add("__rpn.push = function (val) {\n")
    .add("  __rpn._stack.push(val);\n")
    .add("};\n")

    .add("__rpn.pop = function () {\n")
    .add("  if (__rpn._stack.length > 0) {\n")
    .add("    return __rpn._stack.pop();\n")
    .add("  }\n")
    .add("  else {\n")
    .add("    throw new Error('can\\\'t pop from empty stack');\n")
    .add("  }\n")
    .add("};\n")

    .add("__rpn.print = function (val, repeat) {\n")
    .add("  while (repeat-- > 0) {\n")
    .add("    var el = document.createElement('div');\n")
    .add("    var txt = document.createTextNode(val);\n")
    .add("    el.appendChild(txt);\n")
    .add("    document.body.appendChild(el);\n")
    .add("  }\n")
    .add("};\n");
}

exports.compile = function (input, data) {
  var expressions = parser.parse(input.toString());
  var preamble = getPreamble();

  var result = new sourceMap.SourceNode(null, null, null, preamble);
  result.add(expressions.map(function (exp) {
    return exp.compile(data);
  }));

  return result;
};
