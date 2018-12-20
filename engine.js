const wrap = require("word-wrap");
const questionGenerator = require("./questions");
const autocomplete = require("inquirer-autocomplete-prompt");

var filter = function(array) {
  return array.filter(function(x) {
    return x;
  });
};

module.exports = options => {
  const types = options.types;
  const length = Math.max(...Object.keys(types).map(key => key.length)) + 1;
  const choices = Object.entries(types).map(([key, value]) => ({
    name: `${`${key}:`.padEnd(length, " ")} ${value.description}`,
    value: key
  }));

  return {
    prompter: (cz, commit) => {
      cz.prompt.registerPrompt("autocomplete", autocomplete);
      cz.prompt(questionGenerator(options, choices)).then(answers => {
        const maxLineWidth = 100;

        const wrapOptions = {
          trim: true,
          newline: "\n",
          indent: "",
          width: maxLineWidth
        };

        // parentheses are only needed when a scope is present
        let scope = answers.scope.trim();
        scope = scope ? "(" + answers.scope.trim() + ")" : "";

        // Hard limit this line
        const head = (answers.type + scope + ": " + answers.subject.trim())
          .slice(0, maxLineWidth)
          .toLocaleLowerCase();

        // Wrap these lines at 100 characters
        const body = wrap(answers.body, wrapOptions);

        // Apply breaking change prefix, removing it if already present
        let breaking = answers.breaking ? answers.breaking.trim() : "";
        breaking = breaking
          ? "BREAKING CHANGE: " + breaking.replace(/^BREAKING CHANGE: /, "")
          : "";
        breaking = wrap(breaking, wrapOptions);

        const issues = answers.issues ? wrap(answers.issues, wrapOptions) : "";

        const footer = filter([breaking, issues]).join("\n\n");
        commit(`
          ${head}


          ${body}


          ${footer}
        `);
      });
    }
  };
};
