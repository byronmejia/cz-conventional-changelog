const Fuse = require("fuse.js");

module.exports = function(options, choices) {
  const fuzzySearch = new Fuse(choices, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 200,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ["name", "value"]
  });

  return [
    {
      type: "autocomplete",
      name: "type",
      message: "Select the type of change that you're committing:",
      source: (answersSoFar, query) =>
        Promise.resolve(query ? fuzzySearch.search(query) : choices)
    },
    {
      type: "input",
      name: "scope",
      message:
        "What is the scope of this change (e.g. component or file name)? (press enter to skip)\n",
      default: options.defaultScope
    },
    {
      type: "input",
      name: "subject",
      message: "Write a short, imperative tense description of the change:\n",
      default: options.defaultSubject
    },
    {
      type: "input",
      name: "body",
      message:
        "Provide a longer description of the change: (press enter to skip)\n",
      default: options.defaultBody
    },
    {
      type: "confirm",
      name: "isBreaking",
      message: "Are there any breaking changes?",
      default: false
    },
    {
      type: "input",
      name: "breaking",
      message: "Describe the breaking changes:\n",
      when: function(answers) {
        return answers.isBreaking;
      }
    },
    {
      type: "confirm",
      name: "isIssueAffected",
      message: "Does this change affect any open issues?",
      default: options.defaultIssues ? true : false
    },
    {
      type: "input",
      name: "issues",
      message: 'Add issue references (e.g. "fix #123", "re #123".):\n',
      when: function(answers) {
        return answers.isIssueAffected;
      },
      default: options.defaultIssues ? options.defaultIssues : undefined
    }
  ];
};
