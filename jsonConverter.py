import pandas as pd
import sys
import json


file_errors_location = sys.argv[1] if len(sys.argv) > 1 else "C:/Code/google-maps2.0/Oversikt over programmet.xlsx"

df = pd.read_excel(file_errors_location)


complete = {
    "markerConfig": {
      "gridSize": 40,
      "minimumClusterSize": 3,
      "imagePath": "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
    },
    "user": {
      "iconPath": "img/points/utstilling.svg",
      "iconSize": 25
    },
    "category":{

    }
  }
  




for row_index, row_data in df.fillna("Missing").iterrows():
    category = complete["category"].get(row_data.get("Kategori"))
    if category is None:
        complete["category"][row_data.get("Kategori")] = {
            "color": row_data.get("fargekode"),
            "Ikon": row_data.get("Ikon"),
            "pages": {}
        }

    tittel = row_data.get('Tittel')
    text_location = "Missing.txt" if pd.isnull(tittel) else f"{tittel}.txt"

    complete["category"][row_data.get("Kategori")]["pages"][tittel] = {
        "URL": row_data.get("URL"),
        "Land": row_data.get("Land"),
        "textLocation": text_location,
        "1280x844": row_data.get("1280x844"),
        "1024x1024": row_data.get("1024x1024")
    }

    


print(json.dumps(complete, ensure_ascii=False, indent=4))