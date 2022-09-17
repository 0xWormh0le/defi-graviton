# graviton is the working title of the editor

# Usage
## Without Docker
1. Install all requirements besides Docker
2. Run './run_app.sh'

## Testing
To execute tests run 'yarn test'

## With Docker
We use Docker for deployment. Since the build process is slower its not recommended to use it for development.
TODO@Christian figurte out if the code can be directly copied to the image without building to avoid that

1. Install Docker
MacOs: https://docs.docker.com/docker-for-mac/install/
Debian/Ubuntu: https://docs.docker.com/install/linux/docker-ce/ubuntu/
2. Execute './docker_build.sh' every time you update code
3. Execute './docker_run.sh' to run the image
4. Open browser and go to 'http://localhost:3001/'
5. Execute './docker_stop.sh' to stop the current image

# Requirements
## Homebrew
Homebrew is a package manager for MacOs (and Linux) and makes set-up easier. Once we determined all dependencies we can replace them through direct checkouts if required
See https://brew.sh/

Install homebrew by executing '/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"'

## Node
### MacOs
Execute 'brew update && brew install node'

### Debian/Ubuntu
Execute 'sudo apt-get update && sudo apt-get install nodejs'

## NPM
After installing node execute 'npm install npm@latest -g'


## Yarn
### MacOS
https://yarnpkg.com/lang/en/docs/install/#mac-stable

### Debian Ubuntu
https://yarnpkg.com/lang/en/docs/install/#debian-stable

# CI

## Slack

Github is posting to channel #ci for new pushes to master, merge requests, and pipeline changes

## Asana

Currently the Asana integration is taking a detour over the gitlab issue tracker

Find the gitlab issue id in the issue tracker (Asana tasks are synced seamlessly, they have the same name and same description).

Add the gitlab issue id to the commit message. Example: "Issue: #11", only the #11 is required however it's better to make clear
that it's describing the issue.
Push the commit and it will be updated in the gitlab issue tracker and in Asana.

# Version

## Version file
The repository includes a file called "version.txt" in the root folder. This is the current version of the app and should be
changed every time a certain extension to the code is made. The file is used to display the current version in the webui.

Bump the version with the python script "bump_version.py". Usage: $'python scripts/bump_version.py --minor --verbose'
Add the version.txt file to your commit after bumping it.

## Git Tags
Once we reach a certain version we use git tags to be able to easily check out certain versions of the code. Git tags should be set
for release candidates or when bumping the minor version after adding a significant feature.

## Coding Conventions

### Philosophy
Why have coding guidelines? Why not let each developer use their own style and patterns at will? In our experience, there are a few good reasons:
 
1. reading code becomes easier. You can actually discern patterns visually without having to read each token. This greatly speeds up reading each others' code
2. It speeds up writing code. If you have simple rules to follow when writing code, you don't have to make judgements about how it looks. You have more brainpower left to think about the important things (such as if you have an off-by-1 error..., potential NPEs, semantic bugs, ...)
3. they should encapsulate shared experience of many developers, and hence help one developer not make the same error another did in the past

The style standard itself doesn't matter too much. I have personally worked in four distinct coding standards and adapted to each. Here we aim to try to be consistent so that while we code, we can do most code formatting with the IDE or w/o thinking; and having the same design "patterns" for the same cases is important. Personally, if I see a pattern that feels "foreign" or "odd", I first try to understand the logic behind the pattern. I then present the logic I have (pros, cons--technical or design facts). The decision for what to do should be based on the technical facts as much as is possible. If an arbitrary choice must be made, then each pattern should be listed and pros/cons of each, and an attempt to explain when and why one might choose one or another (tie goes to coin flip)

Our standards should free us to think in higher abstractions, and come up with new patterns, rather than enforcing just what we've always done or seen.

All standards are always open to discussion amongst contributors to the java developers group, and these are subject to change (though hopefully not drastically and frequently, else, we'll not have consistent code)

### General

### Optimize for developer speed
We are a startup and the key advantage we have over established players that we can move faster! 

But moving faster doesn't just happen by itself. A key piece to achieve it is for you to focus on what matters and that is a) speed to getting impactfull code shipped and b) writing code in a way that makes it easy to read, extend and debug with out ever prematurely over optimizing stuff

For example: Storage is cheap, CPU cycles are cheap, bandwidth is cheap...but time to getting code shipped is expensive.

In short: Great UX > computing resources!

#### Use a linter to make code easier to review
We care about our sanity, so we use a linter on our codebase.

Linters will help you make your code similar to ours. By follow a strict set of rules, you can be certain that the whole code base will be consistent.

We use ESLint and the config file for it is in the repo root folder.

### No comments
If you have to write comments to explain your code you should probably just refactor your code to be more readable.

A common way to do so is to just wrap the code you just wrote a comment for into a method and name it with the comment you were about to write.

#### Break things intentionally
Whether you notice it or not, there is most likely a architecture and design in place for things. So ask around first before making changes to avoid breaking in unintentionally.

#### No magic numbers
The term magic number or magic constant refers to the anti-pattern of using numbers directly in source code. This has been referred to as breaking one of the oldest rules of programming, dating back to the COBOL, FORTRAN and PL/1 manuals of the 1960s. The use of unnamed magic numbers in code obscures the developers' intent in choosing that number, increases opportunities for subtle errors (e.g. is every digit correct in 3.14159265358979323846 and is this equal to 3.14159?) and makes it more difficult for the program to be adapted and extended in the future. Replacing all significant magic numbers with named constants makes programs easier to read, understand and maintain.

#### Your first draft is not always the best one
Many of you already know this. The first iteration is not always the best one.

You should look at your first iteration of coding and think about the features that you might have missed.

Take your time to think about how you want to proceed even before writing a single line of code and when you’re done with implementing a feature or fixing a bug, look at your changes and think how you can make it better.

#### Split your code into multiple smaller functions
Splitting your bigger functions into multiple smaller functions will make the smaller functions more reusable. They will also become much easier to test.

You can also create many utility files which can help you remove duplicate code from multiple files.

After creating multiple files, look at them and you will see that there are many duplicated lines of code. You can take these lines are create a utility file. You can then reuse the same utility file across multiple files.

#### Create multiple files instead of writing a big file
Reviewing one big file is always harder than reviewing multiple smaller files.

If you split your code into multiple smaller files and each file contains only one logic, then it becomes very easy for the reviewer to review that file.

#### Be very careful while naming your files/methods.variables/etc
Another thing you should remember here is that if you name your objects according to the job that they perform, it will also help you in the future as well as other developers to understand what the file actually does.

After looking at the name of the file/method/variable, other developers should understand what the file is supposed to do.

For instance, dropdown.js is a good name but it’s very generic and if you use it in multiple places in the same directory, you might name it like topDropdown.js, bottomDropdown.js, which is bad.

A better way will be to prefix them with the job that they are supposed to perform. For instance, userDropdown.js, fileDropdown.js, etc.

#### Pull from master often
Our code base moves fast and you can fall behind very quick if you only pull from master once every couple days. I recommend doing it 2-3 a day to avoid trouble.

#### Avoid For/While loops
Rather use forEach whenever possible as it creates more readable and robust code.

### React specific
#### Always use prop-types to define all the props in your components
prop types will help you check if the desired type of prop is getting passed into your component or not.

If the proper type of a specific prop is not passed into your component, then the package will throw a warning in the console of your browser.

### Typescript specific
#### Don't use @ts-ignore in production code
There is always a better way to do it.

If there really issn't just put the code into a .jsx file instead.

#### Use types
It's easy, we use TypeScript to get type safety...using "any" all over sabotages that effort. Thank you
