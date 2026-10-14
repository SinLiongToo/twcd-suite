import csv
import json

kipsutian_csv = r"C:\Users\tu-hs\.gemini\antigravity\brain\d1af6291-308f-43b4-884d-e7adccf0b2b0\scratch\KipSutianData.csv"
audio_dict = {}

with open(kipsutian_csv, mode="r", encoding="utf-8-sig") as f:
    r = csv.reader(f)
    next(r)
    for row in r:
        if len(row) > 5:
            hanji_raw = row[2].strip()
            audio_raw = row[5].strip()
            if audio_raw and "(" in audio_raw:
                clean_h = hanji_raw.split("(")[0].split("（")[0].strip()
                if clean_h and clean_h not in audio_dict:
                    audio_dict[clean_h] = audio_raw

# Add 台 / 臺 aliases
for k, v in list(audio_dict.items()):
    if "臺" in k:
        k_tai = k.replace("臺", "台")
        if k_tai not in audio_dict:
            audio_dict[k_tai] = v
    elif "台" in k:
        k_tai = k.replace("台", "臺")
        if k_tai not in audio_dict:
            audio_dict[k_tai] = v

print(f"Total audio entries indexed: {len(audio_dict)}")
with open("data/audio_map.json", "w", encoding="utf-8") as f:
    json.dump(audio_dict, f, ensure_ascii=False)

# Update data.js
with open("data/hl_cl.json", "r", encoding="utf-8") as f: hl_cl = json.load(f)
with open("data/cl_hl.json", "r", encoding="utf-8") as f: cl_hl = json.load(f)
with open("data/hg_tg.json", "r", encoding="utf-8") as f: hg_tg = json.load(f)
with open("data/ruby.json", "r", encoding="utf-8") as f: ruby = json.load(f)
with open("data/hg_notran.json", "r", encoding="utf-8") as f: hg_notran = json.load(f)
with open("data/lh_notran.json", "r", encoding="utf-8") as f: lh_notran = json.load(f)
with open("cts_maps.json", "r", encoding="utf-8") as f: cts_maps = json.load(f)

payload = {
    "hg_tg": hg_tg,
    "hg_notran": hg_notran,
    "cl_hl": cl_hl,
    "hl_cl": hl_cl,
    "lh_notran": lh_notran,
    "ruby": ruby,
    "cts": cts_maps,
    "audio": audio_dict
}

prefix = "(typeof window !== \"undefined\" ? window : global).TWCD_DATA = "
with open("data.js", "w", encoding="utf-8") as f:
    f.write(prefix + json.dumps(payload, ensure_ascii=False) + ";\n")

print("Successfully updated data.js with audio dictionary!")
