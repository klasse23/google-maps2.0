let map;
const { Map } = await google.maps.importLibrary("maps");
const { Marker } = await google.maps.importLibrary("marker");

const markerSize = 50; // This resizes both x and y

async function initMap() {
  const position = { lat: 60.79923462904757, lng: 11.025973056378175 };
  const infoWindow = new google.maps.InfoWindow();

  map = new Map(document.getElementById("map"), {
    zoom: 16.5,
    center: position,
  });

  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(60.79923462904757, 11.025973056378175),
    new google.maps.LatLng(60.8923462904757, 11.125973056378175)
  );

  let image = "img/map.svg";

  // Add the custom overlay to the map
  class USGSOverlay extends google.maps.OverlayView {
    bounds;
    image;
    div;
    constructor(bounds, image) {
      super();
      this.bounds = bounds;
      this.image = image;
    }
    /**
     * onAdd is called when the map's panes are ready and the overlay has been
     * added to the map.
     */
    onAdd() {
      this.div = document.createElement("div");
      this.div.style.borderStyle = "none";
      this.div.style.borderWidth = "0px";
      this.div.style.position = "absolute";

      // Create the img element and attach it to the div.
      const img = document.createElement("img");

      img.src = this.image;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.position = "absolute";
      this.div.appendChild(img);

      // Add the element to the "overlayLayer" pane.
      const panes = this.getPanes();

      panes.overlayLayer.appendChild(this.div);
    }
    draw() {
      const overlayProjection = this.getProjection();

      const sw = overlayProjection.fromLatLngToDivPixel(
        this.bounds.getSouthWest()
      );
      const ne = overlayProjection.fromLatLngToDivPixel(
        this.bounds.getNorthEast()
      );

      if (this.div) {
        this.div.style.left = sw.x + "px";
        this.div.style.top = ne.y + "px";
        this.div.style.width = ne.x - sw.x + "px";
        this.div.style.height = sw.y - ne.y + "px";
      }
    }
    /**
     * The onRemove() method will be called automatically from the API if
     * we ever set the overlay's map property to 'null'.
     */
    onRemove() {
      if (this.div) {
        this.div.parentNode.removeChild(this.div);
        delete this.div;
      }
    }
    /**
     *  Set the visibility to 'hidden' or 'visible'.
     */
    hide() {
      if (this.div) {
        this.div.style.visibility = "hidden";
      }
    }
    show() {
      if (this.div) {
        this.div.style.visibility = "visible";
      }
    }
    toggle() {
      if (this.div) {
        if (this.div.style.visibility === "hidden") {
          this.show();
        } else {
          this.hide();
        }
      }
    }
    toggleDOM(map) {
      if (this.getMap()) {
        this.setMap(null);
      } else {
        this.setMap(map);
      }
    }
  }

  const overlay = new USGSOverlay(bounds, image);
  overlay.setMap(map);

  /*
    FETCH
  */
  try {
    getData(infoWindow);
  } catch (err) {
    console.log("Error when fetching overlay json: ", err);
  }

  /*
    Player Location
  */

  document.addEventListener("DOMContentLoaded", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
  }
}

initMap();

async function getData(infoWindow) {
  fetch("maps.json")
    .then((response) => response.json())
    .then((data) => {
      let newData = {};

      data.forEach((item) => {
        Object.keys(item).forEach((key) => {
          newData[key] = {};
          newData[key]["shown"] = true;
          newData[key]["markers"] = [];

          let web_location = item[key]["web_location"];
          let color = item[key]["color"];

          item[key]["markers"].forEach((marker) => {
            const mark = new Marker({
              map: map,
              position: { lat: marker.lat, lng: marker.lng },
              title: marker.title,
              animation: google.maps.Animation.DROP,
              icon: {
                url: item[key].icon,
                scaledSize: new google.maps.Size(markerSize, markerSize),
              },
            });

            newData[key]["markers"].push(mark);

            mark.addListener("click", () => {
              map.setZoom(18);
              map.setCenter(mark.getPosition());
              infoWindow.close();

              if (web_location) {
                infoWindow.setContent(
                  `<div id="content">
                  <a href="` +
                    web_location +
                    `" style="text-decoration: none; font-weight: 600; color: #219EBC;"><h3>` +
                    mark.getTitle() +
                    `</h3></a>
                  <p style="">` +
                    marker.description +
                    `</p>
                  <div style="display: flex; justify-content: center; align-items: center;">
                    <a href="` +
                    web_location +
                    `"><button id="more">Les mer</button></a>
                  </div>
                </div>`
                );
              } else {
                infoWindow.setContent(
                  `<div id="content">
                <a href="` +
                    marker.web_location +
                    `" style="text-decoration: none; font-weight: 600; color: #219EBC;"><h3>` +
                    mark.getTitle() +
                    `</h3></a>
                <p style="">` +
                    marker.description +
                    `</p>
                <div style="display: flex; justify-content: center; align-items: center;">
                  <a href="` +
                    marker.web_location +
                    `"><button id="more">Les mer</button></a>
                </div>
              </div>`
                );
              }
              infoWindow.open(mark.getMap(), mark);
            });

            map.addListener("click", () => {
              infoWindow.close();
            });
          });
          //setup markers
          const filterButton = document.createElement("button");
          const str = key;
          const str2 = str.charAt(0).toUpperCase() + str.slice(1);
          filterButton.textContent = str2;
          filterButton.style.border = "2px solid " + color;
          filterButton.style.backgroundColor = color;
          filterButton.classList.add("filter-button");
          map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(
            filterButton
          );
          filterButton.addEventListener("click", () => {
            if (newData[key]["shown"]) {
              filterButton.classList.add("deactive");
              filterButton.style.backgroundColor = "#F0F0F0";
              infoWindow.close();
              newData[key]["shown"] = false;
              newData[key]["markers"].forEach((marker) => {
                marker.setMap(null);
              });
            } else {
              filterButton.classList.remove("deactive");
              filterButton.style.border = "2px solid " + color;
              filterButton.style.backgroundColor = color;
              newData[key]["shown"] = true;
              newData[key]["markers"].forEach((marker) => {
                marker.setMap(map);
              });
            }
          });
        });
      });
    });
}
