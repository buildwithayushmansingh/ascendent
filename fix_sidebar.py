import re, glob, shutil

for f in glob.glob('*.html'):
    s = open(f, encoding='utf-8').read()
    if '<aside class="sidebar"' not in s:
        continue
    shutil.copy(f, f + '.bak')

    # 1) whole old sidebar -> empty placeholder (JS fills it)
    s = re.sub(r'<aside class="sidebar">.*?</aside>',
               '<aside class="sb" id="appSidebar"></aside>', s, flags=re.S)

    # 2) old tilt script is not needed any more
    s = re.sub(r'\s*<script src="js/sidebar-tilt\.js"></script>', '', s)

    # 3) make sure sidebar.css is linked
    if 'css/sidebar.css' not in s:
        s = s.replace('<link rel="stylesheet" href="css/style.css" />',
                      '<link rel="stylesheet" href="css/style.css" />\n  <link rel="stylesheet" href="css/sidebar.css" />', 1)

    # 4) sidebar.js exactly once, right after demo-data.js
    s = re.sub(r'\s*<script src="js/sidebar\.js"></script>', '', s)
    s = s.replace('<script src="js/demo-data.js"></script>',
                  '<script src="js/demo-data.js"></script>\n  <script src="js/sidebar.js"></script>', 1)

    open(f, 'w', encoding='utf-8').write(s)
    print('updated', f)