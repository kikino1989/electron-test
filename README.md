### how to get started

### Requirements
* latest version of Pathon 2
* PowerShell version 3 or higher
* Visual Studio 2017, it might work with the latest version as well.

### run
* npm i
* ionic cordova prepare
* cd C:\Program Files (x86)\Microsoft Visual Studio\Installer
* vs_installer.exe modify --installPath "C:\Program Files (x86)\Microsoft Visual Studio\2017\Community" --passive --add Microsoft.VisualStudio.Workload.NativeDesktop --add Microsoft.VisualStudio.COmponent.VC.ATLMFC --add Microsoft.VisualStudio.Component.VC.Tools.ARM64 --add Microsoft.VisualStudio.Component.VC.MFC.ARM64 --includeRecommended

### Creating a cross-compilation command prompt
Setting npm_config_arch=arm64 in the environment creates the correct arm64 .obj files, but the standard Developer Command Prompt for VS 2017 will use the x64 linker. To fix this:

Duplicate the x64_x86 Cross Tools Command Prompt for VS 2017 shortcut (e.g. by locating it in the start menu, right clicking, selecting Open File Location, copying and pasting) to somewhere convenient.
Right click the new shortcut and choose Properties.
Change the Target field to read vcvarsamd64_arm64.bat at the end instead of vcvarsamd64_x86.bat.
If done successfully, the command prompt should print something similar to this on startup:

**********************************************************************
** Visual Studio 2017 Developer Command Prompt v15.9.15
** Copyright (c) 2017 Microsoft Corporation
**********************************************************************
[vcvarsall.bat] Environment initialized for: 'x64_arm64'

### resources
https://cordova.apache.org/docs/en/10.x/guide/platforms/electron/
https://www.electronjs.org/docs/latest/tutorial/windows-arm
https://github.com/apache/cordova-electron/issues/209


### TroubleShooting building issue
* Make sure that the "VSINSTALLDIR" environment variable has a trailing '\'. For instance: "C:\Program Files (x86)\Microsoft Visual Studio\2017\Professional\"
* Make sure C:\Users\{user}\AppData\Local\node-gyp\Cache\14.18.1\arm64 is not empty. If so, download the node.lib library from https://artifacts.electronjs.org/headers/{node-version}/win-arm64/node.lib

### How to sign the individual packages
cd "C:\Program Files (x86)\Windows Kits\10\bin\10.0.15063.0\x64"
./signtool sign /n "certificate store name" /tr http://timestamp.digicert.com /td sha256 /fd sha256 /a /v "C:\path\to\.appx"