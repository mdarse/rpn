declare module 'source-map' {
  class SourceNode {
    constructor(line?: number, column?: number, source?: string, chunk?, name?: string);
    add(chunk): SourceNode;
  }
}
