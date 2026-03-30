import pdfplumber
import pandas as pd
import re
import os
import requests
import time
import json

COLUMNS = [
    "E01","E02","E03","E04","E05","E06","E07","E08","E09",
    "W01","W02","W03","W04","W05",
    "O01E","O02E","O03E",
    "O01","O02","O03","O04","O05","O06","O07"
]

CACHE_FILE = "mha_lat_lng_cache.json"


# === LOAD / SAVE CACHE ===
def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            return json.load(f)
    return {}

def save_cache(cache):
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2)


# === GEOCODING FUNCTION (OpenStreetMap - free) ===
def geocode_location(location, cache):
    if location in cache:
        return cache[location]

    print(f"Geocoding: {location}")

    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": location,
        "format": "json",
        "limit": 1
    }

    headers = {
        "User-Agent": "bah-parser-script"
    }

    response = requests.get(url, params=params, headers=headers)

    if response.status_code != 200:
        print(f"Failed: {location}")
        return None, None

    data = response.json()

    if len(data) == 0:
        print(f"No result: {location}")
        return None, None

    lat = float(data[0]["lat"])
    lng = float(data[0]["lon"])

    cache[location] = (lat, lng)
    save_cache(cache)

    # Respect rate limits
    time.sleep(1)

    return lat, lng


# === PDF PARSER ===
def parse_bah_pdf(pdf_path):
    rows = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            for line in text.split("\n"):
                line = line.strip()

                if (
                    not line
                    or line.startswith("MHA ")
                    or "BAH Rates" in line
                    or "Page" in line
                ):
                    continue

                parts = re.split(r"\s+", line)

                if len(parts) < 10:
                    continue

                mha_code = parts[0]

                # Find numeric start
                numeric_start = None
                for i, p in enumerate(parts):
                    if p.isdigit():
                        numeric_start = i
                        break

                if numeric_start is None:
                    continue

                mha_name = " ".join(parts[1:numeric_start])
                numbers = parts[numeric_start:]

                if len(numbers) != len(COLUMNS):
                    continue

                for rank, value in zip(COLUMNS, numbers):
                    rows.append({
                        "mha_code": mha_code,
                        "mha_name": mha_name,
                        "rank": (rank[0] + rank[2:]).lower(), # reformat ranks to current value structure (E01 -> e1)
                        "bah": int(value)
                    })

    return pd.DataFrame(rows)


# === MAIN SCRIPT ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with_dep_path = os.path.join(BASE_DIR, "2026 BAH Rates With Dependents.pdf")
without_dep_path = os.path.join(BASE_DIR, "2026 BAH Rates Without Dependents.pdf")

# Parse PDFs
df_with = parse_bah_pdf(with_dep_path).rename(columns={"bah": "with_dependents"})
df_without = parse_bah_pdf(without_dep_path).rename(columns={"bah": "without_dependents"})

# Merge
df = pd.merge(
    df_with,
    df_without,
    on=["mha_code", "mha_name", "rank"],
    how="inner"
)

# === GEOCODE ALL UNIQUE LOCATIONS ===
cache = load_cache()

unique_locations = df["mha_name"].unique()

lat_lng_map = {}

for loc in unique_locations:
    lat, lng = geocode_location(loc, cache)
    lat_lng_map[loc] = (lat, lng)

# Map back to dataframe
df["lat"] = df["mha_name"].map(lambda x: lat_lng_map[x][0])
df["lng"] = df["mha_name"].map(lambda x: lat_lng_map[x][1])

# Final column order
df = df[[
    "mha_code",
    "mha_name",
    "rank",
    "with_dependents",
    "without_dependents",
    "lat",
    "lng"
]]

# Save
df.to_csv("./public/data/bah_2026_with_coords.csv", index=False)

print("✅ Done: CSV with lat/lng created")