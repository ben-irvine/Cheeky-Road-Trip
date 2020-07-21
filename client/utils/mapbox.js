export const renderMap = () => {
    let start = [
      this.props.currentTrip.START.longitude,
      this.props.currentTrip.START.latitude
    ]
    let midCoords = ''
    this.props.currentTrip.MID.map((element) => {
      let newString = `${element.longitude},` + `${element.latitude};`
      midCoords = midCoords + newString
    })
    let end = [
      this.props.currentTrip.END.longitude,
      this.props.currentTrip.END.latitude
    ]

    let url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + start[0] + ',' + start[1] + ';' + midCoords + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken
    request.get(url)
      .then(res => {
        let instructionsArr = []
        res.body.routes[0].legs.map((element) => {
          element.steps.map((element) => {
            instructionsArr.push(element.maneuver.instruction)
          })
        })
        this.props.dispatch(addTripInstructions(instructionsArr))
      })

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/deriyaki/ckctmc2yt2xi01iplkz3px4bd',
      accessToken: process.env.MAPBOX_SKIN_KEY,
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    })

    map.on('move', () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      })
    })

    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving'
    })

      const setPopups = (e) => {
      const popup = []
      // There's a few different ways data is layed out in the jsons because of differing sources.
      const dataStructureType1 = {
        name: e.features[0].properties.Name
      }
      const dataStructureType2 = {
        name: e.features[0].properties.NAME,
        description: e.features[0].properties.DESCRIPTION,
        openTimes: e.features[0].properties.USE_RESTRICTIONS,
      }
      const dataStructureType3 = {
        description: "<strong>Toilets :)</strong> <p>No extra information :(</p>"
      }

      const setName = () => {
        if (dataStructureType1.name != undefined) {
          return dataStructureType1.name
        } else if (dataStructureType2.name != undefined) {
          return dataStructureType2.name
        } else {
          return "Toilets :)"
        }
      }

      const addToWaypointsNoArgs = () => {
        const nameOfStop = setName()
        const midpoint = {
          buildingName: capitalize(nameOfStop),
          label: "label",
          latitude: coordinates[1],
          longitude: coordinates[0],
          streetName: "street",
        }
        this.props.dispatch(confirmAddress(midpoint, "MID"))
        this.reloadMap()
      }

      const coordinates = e.features[0].geometry.coordinates.slice()
      const setToiletDescription = (descOne, descTwo, descThree) => {
        window.addToWaypoints = addToWaypointsNoArgs
        // ^--- See page buttom for explanation and tips
        if (descOne.name != undefined) {
          return (
            `<strong>${descOne.name}</strong>
            <br>
            <button onClick='window.addToWaypoints()'>Add stop to trip</button>`
          )
        }
        else if (descOne.name == undefined && descTwo.description != "null" && descTwo.description != undefined && descTwo.openTimes != "null" && descTwo.openTimes != undefined) {
          descTwo.name = capitalize(descTwo.name)
          return (
            `<strong>${descTwo.name}</strong>
            <p>${descTwo.description}</p>
            <br>
            <p>Open: ${descTwo.openTimes}</p>
            <button onClick='window.addToWaypoints()'>Add stop to trip</button>`
          )
        }
        else if (descOne.name == undefined && descTwo.description == "null" || descTwo.openTimes == "null") {
          return (
            `<strong>${capitalize(descTwo.name)}</strong>
            <strong>Toilets</strong>
            <p>No extra information :(</p>
            <button onClick='window.addToWaypoints()'>Add stop to trip</button>`
          )
        }
        else {
          return (
            `${descThree.description}
            <button onClick='window.addToWaypoints()'>Add stop to trip</button>`
          )
        }
      }
      let description = setToiletDescription(dataStructureType1, dataStructureType2, dataStructureType3)

      function capitalize(sentence) {
        let arrayOfStrings = sentence.split(" ")
        if (arrayOfStrings.indexOf("") != -1) { // in case there's only one word (Longburn was being deleted >:c ) .length might've been useful)
          arrayOfStrings.splice(arrayOfStrings.indexOf(""), 1) // in case there's an extra space in a sentance ie "yo  dog."
        }
        let capitalizedArray = arrayOfStrings.map(string => {
          const wordBody = string.substr(1)
          return (string[0].toUpperCase() + wordBody.toLowerCase())
        })
        let capitalizedStr = capitalizedArray.join(' ')
        return (capitalizedStr)
      }
      popup[0] = {
        coordinates: coordinates,
        description: description,
        map: map
      }
      return (
        popup[0]
      )
    }

    map.on('click', 'points', (e) => {
      let marker = {
        popup:{}
      }
      marker.popup = setPopups(e)
      new mapboxgl.Popup()
      .setLngLat(marker.popup.coordinates)
      .setHTML(marker.popup.description)
      .addTo(marker.popup.map)
    })
    map.on('click', 'food_points', (e) => {
      let marker = {
        popup:{}
      }
      marker.popup = setPopups(e)
      new mapboxgl.Popup()
      .setLngLat(marker.popup.coordinates)
      .setHTML(marker.popup.description)
      .addTo(marker.popup.map)
    })
    map.on('click', 'swim-points', (e) => {
      let marker = {
        popup:{}
      }
      marker.popup = setPopups(e)
      new mapboxgl.Popup()
      .setLngLat(marker.popup.coordinates)
      .setHTML(marker.popup.description)
      .addTo(marker.popup.map)
    })

    directions.onClick = () => { }
    directions.onDragDown = () => { } // Stops user from moving waypoints because they don't set GS currently.
    map.addControl(directions, 'top-left')

    map.on('load', () => {
      directions.setOrigin([
        this.props.currentTrip.START.longitude,
        this.props.currentTrip.START.latitude,
      ])

      this.props.currentTrip.MID.map((element, i) => {
        directions.addWaypoint(i + 1, [
          element.longitude,
          element.latitude,
        ])
      })

      directions.setDestination([
        this.props.currentTrip.END.longitude,
        this.props.currentTrip.END.latitude,
      ])



      // SWIM MARKERS
      map.loadImage(
        './images/swimming.png',
        function (error, image) {
          if (error) throw error
          map.addImage('swim-marker', image)
          // Add a GeoJSON source with 2 points
          map.addSource('swim-points', {
            'type': 'geojson',
            'data': swim_data
          })

          map.addLayer({
            'id': 'swim-points',
            'type': 'symbol',
            'source': 'swim-points',
            'layout': {
              'icon-image': 'swim-marker',
              'icon-size': 0.95,
              'text-offset': [0, 1.25],
              'text-anchor': 'top'
            }
          })
        }
      )

      // BATHROOM MARKERS
      map.loadImage(
        './images/toilet-icon.png',
        function (error, image) {
          if (error) throw error
          map.addImage('custom-marker', image)
          // Add a GeoJSON source with 2 points
          map.addSource('points', {
            'type': 'geojson',
            'data': bathroomData
          })
          map.addLayer({
            'id': 'points',
            'type': 'symbol',
            'source': 'points',
            'layout': {
              'icon-image': 'custom-marker',
              'icon-size': 0.95,
              'text-offset': [0, 1.25],
              'text-anchor': 'top'
            }
          })
        }
      )

      // FOOD MARKERS
      map.loadImage(
        './images/food.png',
        function (error, image) {
          if (error) throw error
          map.addImage('food-marker', image)
          // Add a GeoJSON source with 2 points
          map.addSource('food_points', {
            'type': 'geojson',
            'data': food_data
          })

          map.addLayer({
            'id': 'food_points',
            'type': 'symbol',
            'source': 'food_points',
            'layout': {
              'icon-image': 'food-marker',
              'icon-size': 0.65,
              'text-offset': [0, 1.25],
              'text-anchor': 'top'
            }
          })
        }
      )



    })
  }