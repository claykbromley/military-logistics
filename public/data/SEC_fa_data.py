# Processes raw SEC data of registered financial advisors into a usable CSV
# Download current data from the SEC website and change file_path to the download location
# https://www.sec.gov/data-research/sec-markets-data/information-about-registered-investment-advisers-exempt-reporting-advisers
# Download the data named "Registered Investment Advisers, [month] [year]"
# This will take hours to run. Verify proper operation before running fully
# After running, verify no businesses are located at lat: 0, long: 0

import pandas as pd
import requests

file_path = r"C:/Replace/With/File/Name/file.xlsx"  # Replace with the actual path
df = pd.read_excel(file_path)
API_KEY = "AIzaSyAdrCyFkQA2fmt-Lup40KN4qhI2yKpRLbI"

def geocode_address(address):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": API_KEY
    }
    response = requests.get(url, params=params).json()

    if response["status"] != "OK":
        return None, None

    location = response["results"][0]["geometry"]["location"]
    return location["lat"], location["lng"]

data = pd.DataFrame(columns=['name', 'address', 'lat', 'long', 'website'])
data_noaddy = pd.DataFrame(columns=['name', 'website'])
for idx, entry in df.iterrows():
    if idx%100 == 0: print(idx)
    if idx%1000 == 0:
        data.to_csv('SEC_fa_data.csv', index=False)
        data_noaddy = data_noaddy.dropna(subset=['website'])
        data_noaddy.to_csv('SEC_fa_noaddy_data.csv', index=False)

    name = entry['Primary Business Name']
    address = str(entry['Main Office Street Address 1'])
    city = entry['Main Office City']
    state = entry['Main Office State']
    country = str(entry['Main Office Country']).upper()
    zip = entry['Main Office Postal Code'] | ""
    website = entry['Website Address']

    if address.lower() == "nan":
        new_data = pd.DataFrame({'name':[name], 'website':[website]})
        data_noaddy = pd.concat([data_noaddy, new_data], ignore_index=True)
    else:
        if country=='United States': address = f"{address}, {city}, {state} {zip}"
        else: address = f"{address}, {city} {zip}, {country}"

        try: lat, long = geocode_address(address)
        except:
            lat = 0
            long = 0
        new_data = pd.DataFrame({'name':[name], 'address':[address], 'lat':[lat], 'long':[long], 'website':[website]})
        data = pd.concat([data, new_data], ignore_index=True)

data.to_csv('SEC_fa_data.csv', index=False)
data_noaddy = data_noaddy.dropna(subset=['website'])
data_noaddy.to_csv('SEC_fa_noaddy_data.csv', index=False)