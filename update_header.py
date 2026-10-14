with open('data.js', 'r', encoding='utf-8') as f:
    c = f.read()

target = 'window.TWCD_DATA = '
prefix = '(typeof window !== "undefined" ? window : global).TWCD_DATA = '
if c.startswith(target):
    c = prefix + c[len(target):]
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Done updating header!")
else:
    print("Prefix already applied or not matching.")
