Output assets/tui-demo.mp4
Output assets/tui-demo.gif

Set Shell "bash"
Set FontFamily "Menlo"
Set FontSize 20
Set Width 1120
Set Height 780
Set Padding 22
Set Theme "Catppuccin Mocha"
Set Framerate 12
Set TypingSpeed 55ms

# Build first so the recording starts with the actual example, not compiler work.
Hide
Type "mkdir -p .local-artifacts && go build -o .local-artifacts/tlego-demo ./examples/tui-demo"
Enter
Sleep 2s
Type "clear"
Enter
Show
Type "go run ./examples/tui-demo"
Enter
Wait+Screen /ISS/
Sleep 1s

# Focus the satellite list and open the cached ISS entry.
Tab 3
Enter
Sleep 3s
Type "2"
Sleep 2s
Type "3"
Sleep 2s
Type "4"
Sleep 3s

# Track the ISS, then predict its position two hours ahead.
Type "t"
Space
Sleep 4s
Space
Right
Type "+2h"
Enter
Sleep 3s
Escape
Right
Type "f"
Type "r"
Sleep 4s

# Finish on observer settings, then return Home and quit.
Right
Sleep 3s
Escape
Type "q"
Sleep 1s
Type "q"
Sleep 500ms
