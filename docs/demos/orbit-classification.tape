Output .local-artifacts/orbit-classification.mp4
Output .local-artifacts/orbit-classification.gif

Set Shell "bash"
Set FontFamily "Courier New"
Set FontSize 20
Set LetterSpacing 1
Set Width 1180
Set Height 540
Set Padding 24
Set Theme "Catppuccin Mocha"
Set Framerate 12
Set TypingSpeed 35ms

Hide
Type `export PATH="$TLEGO_DEMO_BIN_DIR:$PATH"; export PS1='$ '; clear`
Enter
Sleep 500ms
Show
Type "python3 docs/demos/orbit-classification.py"
Enter
Wait+Screen /Low Earth orbit/
Sleep 10s
