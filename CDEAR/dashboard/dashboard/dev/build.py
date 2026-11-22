import re,sys
t=open('src/template.html').read()
t=t.replace('/*@@STYLE@@*/',open('src/style.css').read())
t=t.replace('/*@@DATAJS@@*/',open('src/cdear_data.js').read())
t=t.replace('/*@@APPJS@@*/',open('src/app.js').read())
assert '</script>' not in open('src/app.js').read() and '</script>' not in open('src/cdear_data.js').read()
open('CDEAR_v24.html','w').write(t)
print('built CDEAR_v24.html', len(t),'bytes')
