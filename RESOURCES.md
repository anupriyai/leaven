# GitHub Actions Resources

## Knowledge

- [GitHub Actions workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
  Primary reference for triggers, inputs, permissions, jobs, runners, and steps. Use when adding or changing workflow YAML.
- [Manually running a workflow](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)
  Official guide to `workflow_dispatch` and the Actions-tab run flow. Use for the Hello workflow.
- [GitHub Actions expressions](https://docs.github.com/en/actions/concepts/workflows-and-actions/expressions)
  Explains `${{ }}` evaluation and warns that some context values are untrusted. Use when passing workflow data to commands.
- [actions/checkout](https://github.com/actions/checkout)
  Official action that places repository contents on a runner. Use before commands that need project files.
- [actions/setup-node](https://github.com/actions/setup-node)
  Official Node.js setup and npm-cache reference. Use for JavaScript and TypeScript CI jobs.
- [Dependency Review Action](https://github.com/actions/dependency-review-action)
  Official installation, availability, and policy reference for reviewing dependency changes in pull requests.
- [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
  Official reference for requiring pull requests, approving reviews, status checks, and restrictions on force pushes or deletion. Use when protecting `main`.
- [Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
  Step-by-step GitHub settings guide. Use when configuring the required approval count and CI checks.

## Wisdom (Communities)

- [GitHub Community: Actions](https://github.com/orgs/community/discussions/categories/actions)
  GitHub's practitioner forum for edge cases and workflow troubleshooting. Use after checking the official documentation and job logs.
