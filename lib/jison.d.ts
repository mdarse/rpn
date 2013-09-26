declare module 'jison' {
  class Parser {
    public yy: any;
    constructor(configuration: Object);
    parse(input: string);
  }
}
