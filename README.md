
Widget to control monitor brightness on Windows. Mostly written by Claude.

![image](https://github.com/user-attachments/assets/20cc4e6c-554b-4000-888f-c49706293c8d)

I use things like this on Ubuntu/Gnome and missed it when I use Windows to game.

# Building

```bash
npm run build
```

This generates an exe in `./dist`

# Install

First, you need to put `winddcutil` on your windows path. I got mine from https://github.com/scottaxcell/winddcutil.

Then just run the exe. Either build it or use the release page.

# Auto start

Add a shortcut brightness to the exe into the auto start folder. You can find it by executing `shell:startup` in the run command window. Mine looks like this

```
C:\Users\my-name\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
```
