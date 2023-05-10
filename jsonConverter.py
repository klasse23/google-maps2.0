import pandas as pd
file_errors_location = "C:\Code\google-maps2.0-1\Oversikt over programmet.xlsx"
df = pd.read_excel(file_errors_location)






complete = {
    "markerConfig": {
      "gridSize": 40,
      "minimumClusterSize": 3,
      "imagePath": "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
    },
    "player": {
      "iconPath": "img/points/utstilling.svg",
      "iconSize": 25
    },
    "category":{

    }
  }
  



count = 0
for idx, row in df.iterrows():
    print(idx, row)
    try: 
       print(complete["category"][row["Kategori"]])
    except:
        complete["category"][row["Kategori"]] = {
            "color":row["fargekode"],
            "pages":{
                
            }
        }


    complete["category"][row["Kategori"]]["pages"][row["Tittel"]] = {
            "URL": row["URL"],
            "country":row["country"],
            "img":row["img"],
            "lat": row["Latitude"],
            "lng": row["Longitude"],
            "textLocation":"",
            "1280x844":row["1280x844"],
            "1024x1024":row["1024x1024"]
        }

    


print(complete)