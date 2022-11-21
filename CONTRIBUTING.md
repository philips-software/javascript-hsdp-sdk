# Contributing

We'd love for you to contribute to our source code and to make the repo even better than it is today! Here are the guidelines we'd like you to follow:

- [Question or Problem?](#question)
- [Issues and Bugs](#issue)
- [Feature Requests](#feature)
- [Submission Guidelines](#submit)
- [Further Info](#info)

## <a name="question"></a> Got a Question or Problem?

Please reach out to one of the [maintainers](MAINTAINERS.md).

## <a name="issue"></a> Found an Issue?

If you find a bug in the source code or a mistake in the documentation, you can help us by submitting an issue to our GitHub Repository. Even better you can submit a Pull Request with a fix.

**Please see the [Submission Guidelines](#submit) below.**

## <a name="feature"></a> Want a Feature?

You can request a new feature by submitting an issue to our GitHub Repository. If you would like to implement a new feature then consider what kind of change it is:

- **Major Changes or New Features** that you wish to contribute to the project should be discussed in an issue so that we can better coordinate our efforts, prevent duplication of work, and help you to craft the change so that it is successfully accepted into the project.
- **Small Changes** can be crafted and submitted to the GitHub Repository as a Pull Request.

## <a name="docs"></a> Want a Doc Fix?

If you want to help improve the docs, it's a good idea to let others know what you're working on to minimize duplication of effort. Create a new issue (or comment on a related existing one) to let others know what you're working on.

For large fixes, please build and test the documentation before submitting the PR to be sure you haven't accidentally introduced any layout or formatting issues. You should also make sure that your commit message starts with "docs:" and follows the **[Commit Message Guidelines](#commit)** outlined below.

## <a name="submit"></a> Submission Guidelines

### Submitting an Issue

Before you submit your issue search the archive, maybe your question was already answered.

If your issue appears to be a bug, and hasn't been reported, open a new issue. Help us to maximize the effort we can spend fixing issues and adding new features, by not reporting duplicate issues. Providing the following information will increase the chances of your issue being dealt with quickly:

- **Overview of the Issue** - if an error is being thrown a non-minified stack
  trace helps
- **Motivation for or Use Case** - explain why this is a bug for you
- **Component Version(s)** - is it a regression?
- **Reproduce the Error** - try to describe how to reproduce the error
- **Related Issues** - has a similar issue been reported before?
- **Suggest a Fix** - if you can't fix the bug yourself, perhaps you can point
  to what might be causing the problem (line of code or commit)

**If you get help, help others. Good karma rules!**

### Submitting a Pull Request

Before you submit your merge request consider the following guidelines:

- Create a Pull Request in GitHub
- Make the required updates.
- Add a line in the CHANGELOG.md under Unreleased. This will be used form generating the release notes.
- Commit your changes using a descriptive commit message.

  ```shell
  git commit -a
  ```

  Note: the optional commit `-a` command line option will automatically "add"
  and "rm" edited files.

- Build your changes locally to ensure all the tests pass:
- Push the changes to your GitHub repository (this will update your Pull Request).

If the PR gets too outdated we may ask you to rebase and force push to update the PR:

```shell
git rebase master -i
git push origin my-fix-branch -f
```

_WARNING: Squashing or reverting commits and force-pushing thereafter may remove GitHub comments on code that were previously made by you or others in your commits. Avoid any form of rebasing unless necessary._

That's it! Thank you for your contribution!

## I want to do more commits

If you are a frequent contributor, you might want to be added to the repository, so you can manage issues and PRs yourself. Create an issue to request access.

## I want to request a new version of my changed components

Contact one of the maintainers to create a new release.

If you are a frequent contributor, you might want to be added to the repository, so you can manage issues and PRs yourself. Create an issue to request access.
