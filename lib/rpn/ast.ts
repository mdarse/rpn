/// <reference path="../node.d.ts" />
/// <reference path="../source-map.d.ts" />

import sourceMap = require("source-map");
import SourceNode = sourceMap.SourceNode;

export module AST {
  function push(val) {
    return ["__rpn.push(", val, ");\n"];
  }

  export class Node {
    _line: number;
    _column: number
    constructor(line: number, column: number) {
      this._line = line;
      this._column = column;
    }
    compile(data): SourceNode {
      throw new Error("Not Yet Implemented");
    }
    compileReference(data): SourceNode {
      return this.compile(data);
    }
    _sn(originalFilename: string, chunk) {
      return new sourceMap.SourceNode(this._line, this._column, originalFilename, chunk);
    }
  }

  export class NumberNode extends Node {
    _value: number;
    constructor(line: number, column: number, numberText: string) {
      super(line, column);
      this._value = Number(numberText);
    }
    compile(data): SourceNode {
      return this._sn(data.originalFilename, push(this._value.toString()));
    }
  }

  export class Variable extends Node {
    _name: string;
    constructor(line: number, column: number, variableText: string) {
      super(line, column);
      this._name = variableText;
    }
    compileReference(data): SourceNode {
      return this._sn(data.originalFilename, push(["'", this._name, "'"]));
    }
    compile(data): SourceNode {
      return this._sn(data.originalFilename, push(["__rpn_env.", this._name]));
    }
  }

  export class Expression extends Node {
    _left: Node;
    _right: Node;
    _operator: Operator;
    constructor(line, column, operand1, operand2, operator) {
      super(line, column);
      this._left = operand1;
      this._right = operand2;
      this._operator = operator;
    }
    compile(data): SourceNode {
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
  }

  export class Operator extends Node {
    symbol: string;
    constructor(line, column, operatorText) {
      super(line, column);
      this.symbol = operatorText;
    }
    compile(data): SourceNode {
      var chunk = (this.symbol === 'print') ? '__rpn.print' : this.symbol;
      return this._sn(data.originalFilename, chunk);
    }
  }
}
