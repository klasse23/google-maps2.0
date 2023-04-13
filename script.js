let map;

async function initMap() {
  /*
    Variables
  */
  const groups = ["Food", "Money", "bank"];

  const position = { lat: 60.79923462904757, lng: 11.025973056378175 };
  const { Map } = await google.maps.importLibrary("maps");
  const { Marker } = await google.maps.importLibrary("marker");
  map = new Map(document.getElementById("map"), {
    zoom: 16.5,
    center: position,
    mapId: "d6cfdbd4ab499329",
  });

  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(70.79923462904757, 21.025973056378175),
    new google.maps.LatLng(70.8923462904757, 21.125973056378175)
  );

  let image =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/talkeetna.png";

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
    fetch("maps.json")
      .then((response) => response.json())
      .then((data) => {
        for (var i = 0; i < data.length; i++) {
          const infoWindow = new google.maps.InfoWindow();

          if (data[i].image || groups.includes(data[i].group)) {
            const title = data[i].title;
            const description = data[i].description;
            const lat = data[i].lat;
            const lng = data[i].lng;
            const icon = data[i].icon;
            const group = data[i].group;

            const marker = new Marker({
              map: map,
              position: { lat: lat, lng: lng },
              title: title,
              icon: icon,
            });
            marker.addListener("click", () => {
              map.setZoom(20);
              map.setCenter(marker.getPosition());
              infoWindow.close();
              infoWindow.setContent(marker.getTitle() + "\n\n" + description);
              infoWindow.open(marker.getMap(), marker);
            });
          } else {
          }
        }

        console.log(data);
      });
  } catch {
    console.log("error");
  }

  /*
    Player Location
  */
  const infoWindow = new google.maps.InfoWindow();

  const locationButton = document.createElement("button");

  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);
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
