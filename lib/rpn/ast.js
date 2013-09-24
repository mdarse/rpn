var SourceNode = require("source-map").SourceNode,
    util = require("util"),
    inherits = util.inherits,
    hasProp = {}.hasOwnProperty;

function extend(a, b) {
  for (var x in b) if (hasProp.call(b, x)) a[x] = b[x];
}

function push(val) {
  return ["__rpn.push(", val, ");\n"];
}


function AstNode(line, column) {
  this._line = line;
  this._column = column;
}
extend(AstNode.prototype, {
  compile: function (data) {
    throw new Error("Not Yet Implemented");
  },
  compileReference: function (data) {
    return this.compile(data);
  },
  _sn: function (originalFilename, chunk) {
    return new SourceNode(this._line, this._column, originalFilename, chunk);
  }
});


function NumberNode(line, column, numberText) {
  NumberNode.super_.call(this, line, column);
  this._value = Number(numberText);
}
inherits(NumberNode, AstNode);
extend(NumberNode.prototype, {
  compile: function (data) {
    return this._sn(data.originalFilename, push(this._value.toString()));
  }
});
exports.Number = NumberNode;


function Variable(line, column, variableText) {
  Variable.super_.call(this, line, column);
  this._name = variableText;
}
inherits(Variable, AstNode);
extend(Variable.prototype, {
  compileReference: function (data) {
    return this._sn(data.originalFilename, push(["'", this._name, "'"]));
  },
  compile: function (data) {
    return this._sn(data.originalFilename, push(["__rpn_env.", this._name]));
  }
});
exports.Variable = Variable;


function Expression(line, column, operand1, operand2, operator) {
  Expression.super_.call(this, line, column);
  this._left = operand1;
  this._right = operand2;
  this._operator = operator;
}
inherits(Expression, AstNode);
extend(Expression.prototype, {
  compile: function (data) {
    var temp = "__rpn.temp";
    var output = this._sn(data.originalFilename, "");

    switch (this._operator.symbol) {
    case 'print':
      return output
        .add(this._left.compile(data))
        .add(this._right.compile(data))
        .add([temp, " = __rpn.pop();\n"])
        .add(["if (", temp, " <= 0) throw new Error('argument must be greater than 0');\n"])
        .add(["if (Math.floor(", temp, ") != ", temp,
              ") throw new Error('argument must be an integer');\n"])
        .add([this._operator.compile(data), "(__rpn.pop(), ", temp, ");\n"]);
    case '=':
      return output
        .add(this._right.compile(data))
        .add(this._left.compileReference(data))
        .add([temp, " = __rpn.pop();\n"])
        .add(["if (", temp, " in __rpn_env) throw new Error('variable is already bound');\n"])
        .add(["__rpn_env[", temp, "] ", this._operator.compile(data), " __rpn.pop();\n"]);
    case '/':
      return output
        .add(this._left.compile(data))
        .add(this._right.compile(data))
        .add([temp, " = __rpn.pop();\n"])
        .add(["if (", temp, " === 0) throw new Error('divide by zero error');\n"])
        .add(push(["__rpn.pop() ", this._operator.compile(data), " ", temp]));
    default:
      return output
        .add(this._left.compile(data))
        .add(this._right.compile(data))
        .add([temp, " = __rpn.pop();\n"])
        .add(push(["__rpn.pop() ", this._operator.compile(data), " ", temp]));
    }
  }
});
exports.Expression = Expression;


function Operator(line, column, operatorText) {
  Operator.super_.call(this, line, column);
  this.symbol = operatorText;
}
inherits(Operator, AstNode);
extend(Operator.prototype, {
  compile: function (data) {
    var chunk = (this.symbol === 'print') ? '__rpn.print' : this.symbol;
    return this._sn(data.originalFilename, chunk);
  }
});
exports.Operator = Operator;
