let map;
const { Map } = await google.maps.importLibrary("maps");
const { Marker } = await google.maps.importLibrary("marker");

const markerSize = 50 // This resizes both x and y

async function initMap() {
  const position = { lat: 60.79923462904757, lng: 11.025973056378175 };
  const infoWindow = new google.maps.InfoWindow();
 
 
  map = new Map(document.getElementById("map"), {
    zoom: 16.5,
    center: position,
  });

  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(70.79923462904757, 21.025973056378175),
    new google.maps.LatLng(70.8923462904757, 21.125973056378175)
  );

  let image = "https://developers.google.com/maps/documentation/javascript/examples/full/images/talkeetna.png";

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

    getData(infoWindow)
  } catch(err) {
    console.log("Error when fetching overlay json: ", err);
  }

  /*
    Player Location
  */
  

  document.addEventListener("DOMContentLoaded", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      console.log("yesss");
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

        Object.values(data[0]).forEach((category) => { 

            category.markers.forEach((marker) => {
              console.log(category.icon[3])

              const mark = new Marker({
                map: map,
                position: { lat: marker.lat, lng: marker.lng },
                title: marker.title,
                icon:{
                  url:category.icon,
                  scaledSize: new google.maps.Size(markerSize, markerSize)},
                  //origin: new google.maps.Point(0, 0),
                  //anchor: new google.maps.Point(100/2, 100/2),   
              });
              mark.addListener("click", () => {
                map.setZoom(18);
                map.setCenter(mark.getPosition());
                infoWindow.close();
                infoWindow.setContent(mark.getTitle() + "\n\n" );
                infoWindow.open(mark.getMap(), mark);
              });
            });
        });
      });
}