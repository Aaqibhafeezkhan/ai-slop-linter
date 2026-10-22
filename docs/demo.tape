# Records docs/demo.gif from the build in this repository. From the repository root:
#   npm run build && vhs docs/demo.tape
# The only commands typed are ai-slop-linter and clear; test/demo.test.mjs enforces that.
Output docs/demo.gif
Set Shell "bash"
Set FontSize 15
Set Width 1600
Set Height 440
Set Padding 16
Set TypingSpeed 50ms
Set Theme "Dracula"
Set Framerate 15
Env PS1 "$ "
Hide
Type "export PATH=$PWD/scripts/vhs-bin:$PATH && clear"
Enter
Show
Type "ai-slop-linter bench/corpus/machine/pull-request.md"
Enter
Sleep 9s
Type "clear"
Enter
Type "ai-slop-linter --explain bold-label"
Enter
Sleep 9s
