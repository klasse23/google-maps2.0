let map;

async function initMap() {
  /*
    Variables
  */
  const position = { lat: 60.79923462904757, lng: 11.025973056378175 };
  const { Map } = await google.maps.importLibrary("maps");
  const { Marker } = await google.maps.importLibrary("marker");
  map = new Map(document.getElementById("map"), {
    zoom: 16.5,
    center: position,
    mapId: "d6cfdbd4ab499329",
  });

  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(60.79923462904757, 11.025973056378175),
    new google.maps.LatLng(60.8923462904757, 11.125973056378175)
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
          if (!data[i]["image"]) {
            const marker = new Marker({
              map: map,
              position: { lat: data[i].lat, lng: data[i].long },
              title: data[i].title,
            });
          } else {
            const marker = new Marker({
              map: map,
              position: { lat: data[i].lat, lng: data[i].long },
              title: data[i].title,
              icon: data[i].image,
            });
            marker.addListener("click", () => {
              map.setZoom(20);
              map.setCenter(marker.getPosition());
              infoWindow.close();
              console.log(marker);
              infoWindow.setContent(marker.getTitle());
              infoWindow.open(marker.getMap(), marker);
            });
          }
        }

        console.log(data);
      });
  } catch {
    console.log("error");
  }
}

initMap();
