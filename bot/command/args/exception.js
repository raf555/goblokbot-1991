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

class ArgumentConstraintError extends Error {
  constructor(message) {
    super(message);
    this.name = "ArgumentConstraintError";
  }
}

module.exports = { ArgumentError, ArgumentTypeError, ArgumentConstraintError };
