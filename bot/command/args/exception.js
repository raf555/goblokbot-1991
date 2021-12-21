class ArgumentTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = "ArgumentTypeError";
  }
}

class ArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = "ArgumentError";
  }
}

module.exports = { ArgumentError, ArgumentTypeError };
