import re, shutil
p = 'css/style.css'
shutil.copy(p, p + '.bak')
lines = open(p).read().split('\n')
cut = next(i for i, l in enumerate(lines) if 'CRIMSON CIRCUIT THEME' in l)
root_end = next(i for i, l in enumerate(lines) if l.strip() == '}') + 1
head, mid, rest = lines[:root_end], '\n'.join(lines[root_end:cut]), lines[cut:]
rep = [
  (r'rgba\(\s*139,\s*92,\s*246,',  'rgba(var(--accent-rgb),'),
  (r'rgba\(\s*192,\s*132,\s*252,', 'rgba(var(--accent-bright-rgb),'),
  (r'rgba\(\s*168,\s*85,\s*247,',  'rgba(var(--border-bright-rgb),'),
  (r'rgba\(\s*34,\s*211,\s*238,',  'rgba(var(--accent-cyan-rgb),'),
  (r'#150f28\b', 'var(--surface)'),   (r'#1c1436\b', 'var(--surface-2)'),
  (r'#0a0714\b', 'var(--bg)'),        (r'#050310\b', 'var(--bg-deep)'),
]
for a, b in rep:
    mid = re.sub(a, b, mid, flags=re.I)
open(p, 'w').write('\n'.join(head) + '\n' + mid + '\n' + '\n'.join(rest))
print('done')