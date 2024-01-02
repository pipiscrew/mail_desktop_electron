::@echo off
:: stop any process if any
taskkill /F /IM mail_desktop_electron.exe

:: wait 1 second
timeout /t 1 /nobreak >nul

::delete existing
rmdir /s /q mail_desktop_electron-win32-x64

::compile new
call npx electron-packager . --icon=app/assets/main.ico

::delete locales
cd mail_desktop_electron-win32-x64/locales
del af.pak
del am.pak
del ar.pak
del bg.pak
del bn.pak
del ca.pak
del cs.pak
del da.pak
del de.pak
del el.pak
del en-GB.pak
del es-419.pak
del es.pak
del et.pak
del fa.pak
del fi.pak
del fil.pak
del fr.pak
del gu.pak
del he.pak
del hi.pak
del hr.pak
del hu.pak
del id.pak
del it.pak
del ja.pak
del kn.pak
del ko.pak
del lt.pak
del lv.pak
del ml.pak
del mr.pak
del ms.pak
del nb.pak
del nl.pak
del pl.pak
del pt-BR.pak
del pt-PT.pak
del ro.pak
del ru.pak
del sk.pak
del sl.pak
del sr.pak
del sv.pak
del sw.pak
del ta.pak
del te.pak
del th.pak
del tr.pak
del uk.pak
del ur.pak
del vi.pak
del zh-CN.pak
del zh-TW.pak

pause