import json

moe_additions_hl_cl = [
    {'h': '𨑨迌', 'c': 'tshit-thô'},
    {'h': '去𨑨迌', 'c': 'khì tshit-thô'},
    {'h': '出外𨑨迌', 'c': 'chhut-gōa tshit-thô'},
    {'h': '𨑨', 'c': 'tshit'},
    {'h': '迌', 'c': 'thô'},
    {'h': '𤆬路', 'c': 'tshuā-lōo'},
    {'h': '相𤆬', 'c': 'sio-tshuā'},
    {'h': '𤆬', 'c': 'tshuā'},
    {'h': '𫝛', 'c': 'kāng'},
    {'h': '濟濟', 'c': 'chē-chē'},
    {'h': '濟', 'c': 'chē'},
    {'h': '袂當', 'c': 'bē-tàng'},
    {'h': '袂曉', 'c': 'bē-hiáu'},
    {'h': '袂', 'c': 'bē'},
    {'h': '佮意', 'c': 'kah-ì'},
    {'h': '佮', 'c': 'kap'},
    {'h': '予人', 'c': 'hō͘-lâng'},
    {'h': '予', 'c': 'hō͘'},
    {'h': '抾', 'c': 'khioh'},
    {'h': '抾字紙', 'c': 'khioh-jī-chóa'},
    {'h': '抾著', 'c': 'khioh-tio̍h'}
]

moe_additions_cl_hl = [
    {'c': 'tshit-thô', 'h': '𨑨迌'},
    {'c': 'chhit-thô', 'h': '𨑨迌'},
    {'c': 'thit-thô', 'h': '𨑨迌'},
    {'c': 'khì tshit-thô', 'h': '去𨑨迌'},
    {'c': 'khì chhit-thô', 'h': '去𨑨迌'},
    {'c': 'tshit', 'h': '𨑨'},
    {'c': 'chhit', 'h': '𨑨'},
    {'c': 'tshuā-lōo', 'h': '𤆬路'},
    {'c': 'chhoā-lō͘', 'h': '𤆬路'},
    {'c': 'sio-tshuā', 'h': '相𤆬'},
    {'c': 'sio-chhoā', 'h': '相𤆬'},
    {'c': 'tshuā', 'h': '𤆬'},
    {'c': 'chhoā', 'h': '𤆬'},
    {'c': 'kāng', 'h': '仝'},
    {'c': 'chē-chē', 'h': '濟濟'},
    {'c': 'tsē-tsē', 'h': '濟濟'},
    {'c': 'bē-tàng', 'h': '袂當'},
    {'c': 'bē-hiáu', 'h': '袂曉'}
]

moe_additions_hg_tg = [
    {'m': '去玩', 't': '去𨑨迌'},
    {'m': '玩耍', 't': '𨑨迌'},
    {'m': '逛逛', 't': '去𨑨迌'},
    {'m': '遊玩', 't': '𨑨迌'},
    {'m': '帶路', 't': '𤆬路'},
    {'m': '帶領', 't': '𤆬'}
]

moe_additions_ruby = [
    {'k': '𨑨迌', 'r': '<ruby><rb>𨑨 迌</rb><rp>(</rp><rt>tshit-thô</rt><rp>)</rp></ruby>'},
    {'k': '去𨑨迌', 'r': '<ruby><rb>去 𨑨 迌</rb><rp>(</rp><rt>khì tshit-thô</rt><rp>)</rp></ruby>'},
    {'k': '𨑨', 'r': '<ruby><rb>𨑨</rb><rp>(</rp><rt>tshit</rt><rp>)</rp></ruby>'},
    {'k': '迌', 'r': '<ruby><rb>迌</rb><rp>(</rp><rt>thô</rt><rp>)</rp></ruby>'},
    {'k': '𤆬路', 'r': '<ruby><rb>𤆬 路</rb><rp>(</rp><rt>tshuā-lōo</rt><rp>)</rp></ruby>'},
    {'k': '相𤆬', 'r': '<ruby><rb>相 𤆬</rb><rp>(</rp><rt>sio-tshuā</rt><rp>)</rp></ruby>'},
    {'k': '𤆬', 'r': '<ruby><rb>𤆬</rb><rp>(</rp><rt>tshuā</rt><rp>)</rp></ruby>'},
    {'k': '濟濟', 'r': '<ruby><rb>濟 濟</rb><rp>(</rp><rt>tsē-tsē</rt><rp>)</rp></ruby>'},
    {'k': '袂當', 'r': '<ruby><rb>袂 當</rb><rp>(</rp><rt>bē-tàng</rt><rp>)</rp></ruby>'}
]

with open('data/hl_cl.json', 'r', encoding='utf-8') as f: hl_cl = json.load(f)
with open('data/cl_hl.json', 'r', encoding='utf-8') as f: cl_hl = json.load(f)
with open('data/hg_tg.json', 'r', encoding='utf-8') as f: hg_tg = json.load(f)
with open('data/ruby.json', 'r', encoding='utf-8') as f: ruby = json.load(f)

hl_cl = moe_additions_hl_cl + hl_cl
cl_hl = moe_additions_cl_hl + cl_hl
hg_tg = moe_additions_hg_tg + hg_tg
ruby = moe_additions_ruby + ruby

with open('data/hl_cl.json', 'w', encoding='utf-8') as f: json.dump(hl_cl, f, ensure_ascii=False)
with open('data/cl_hl.json', 'w', encoding='utf-8') as f: json.dump(cl_hl, f, ensure_ascii=False)
with open('data/hg_tg.json', 'w', encoding='utf-8') as f: json.dump(hg_tg, f, ensure_ascii=False)
with open('data/ruby.json', 'w', encoding='utf-8') as f: json.dump(ruby, f, ensure_ascii=False)

with open('data/hg_notran.json', 'r', encoding='utf-8') as f: hg_notran = json.load(f)
with open('data/lh_notran.json', 'r', encoding='utf-8') as f: lh_notran = json.load(f)
with open('cts_maps.json', 'r', encoding='utf-8') as f: cts_maps = json.load(f)

payload = {
    'hg_tg': hg_tg,
    'hg_notran': hg_notran,
    'cl_hl': cl_hl,
    'hl_cl': hl_cl,
    'lh_notran': lh_notran,
    'ruby': ruby,
    'cts': cts_maps
}

prefix = '(typeof window !== "undefined" ? window : global).TWCD_DATA = '
with open('data.js', 'w', encoding='utf-8') as f:
    f.write(prefix + json.dumps(payload, ensure_ascii=False) + ';\n')

print('Successfully patched with MOE Extension-B characters!')
