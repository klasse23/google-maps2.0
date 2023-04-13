// Initialize and add the map
let map;

async function initMap() {
  // The location of Uluru
  const position = { lat: 60.79923462904757, lng: 11.025973056378175 };
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { Marker } = await google.maps.importLibrary("marker");

  // The map, centered at Uluru
  map = new Map(document.getElementById("map"), {
    zoom: 16.5,
    center: position,
    mapId: "d6cfdbd4ab499329",
  });

  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(62.281819, -150.287132),
    new google.maps.LatLng(62.400471, -150.005608)
  );

  let image = "https://developers.google.com/maps/documentation/javascript/";

  image += "examples/full/images/talkeetna.png";

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
      // We use the south-west and north-east
      // coordinates of the overlay to peg it to the correct position and size.
      // To do this, we need to retrieve the projection from the overlay.
      const overlayProjection = this.getProjection();
      // Retrieve the south-west and north-east coordinates of this overlay
      // in LatLngs and convert them to pixel coordinates.
      // We'll use these coordinates to resize the div.
      const sw = overlayProjection.fromLatLngToDivPixel(
        this.bounds.getSouthWest()
      );
      const ne = overlayProjection.fromLatLngToDivPixel(
        this.bounds.getNorthEast()
      );

      // Resize the image's div to fit the indicated dimensions.
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

  // The marker, positioned at Uluru
  try {
    fetch("maps.json")
      .then((response) => response.json())
      .then((data) => {
        for (var i = 0; i < data.length; i++) {
          console.log(data[i]);
          if (!data[i]["image"]) {
            console.log("dd");
            const marker = new Marker({
              map: map,
              position: { lat: data[i].lat, lng: data[i].long },
              title: data[i].title,
            });
          } else {
            console.log("yy");
            const marker = new Marker({
              map: map,
              position: { lat: data[i].lat, lng: data[i].long },
              title: data[i].title,
              icon: data[i].image,
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
