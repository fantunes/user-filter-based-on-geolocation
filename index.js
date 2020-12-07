// Ok, so the challenge I see here is how the actual distance calculation
// should be done.
// After some thinking and research I found the haversine formula seems to be
// the answer to calculate a distance between two points and there are
// a number of examples of the formula on the web

// So after a couple of hours understanding how the calculations should be done,
// I can start the exercise properly.

// Regardless the outcome of this, it has added enourmous value to my
// professional development as I feel much more comfortable to do
// something similar moving forward.

const findDataWithinRadius = (
    {startLat, startLon}, // coords of reference
    {targetLat, targetLon}, // coords of target
    maxDistance // distance to validate
  ) => {
  const convertToRadian = degrees => degrees * Math.PI / 180; // radians = degrees * pi / 180

  // Forked and updated from: http://www.movable-type.co.uk/scripts/latlong.html
  const R = 3961; // Earth radius in miles
  const originLat = convertToRadian(startLat);
  const endLat = convertToRadian(targetLat);
  const distanceLat = convertToRadian(targetLat - startLat);
  const distanceLon = convertToRadian(targetLon - startLon);

  // haversine formula
  const h = Math.sin(distanceLat / 2) * Math.sin(distanceLat / 2) +
            Math.cos(originLat) * Math.cos(endLat) *
            Math.sin(distanceLon / 2) * Math.sin(distanceLon / 2);
  const cos = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  // Return distance between points
  return (R * cos) <= maxDistance; // Earth radius * angle in the plane
};

const fetchData = async (url) => {
  return (await fetch(url)).json();
}

const populateUsersList = (list) => {
  const listUI = document.querySelector('.js-users-list');
  const listOfUsersUI = (list.length > 0) ? list.map(user => `<li>${user.first_name} ${user.last_name} - ${user.latitude} ${user.longitude}</li>`).join('') : `<li>No users found</li>`;

  // ENHANCE: update to use insertAdjacentHTML
  listUI.innerHTML = listOfUsersUI;
}

const loadCity = () => {
  const cityName = document.querySelector('.js-city-name');
  const cityBtns = [...document.querySelectorAll('[data-city]')];

  cityBtns.map(button => button.addEventListener('click', (e) => {
    const targetCity = e.target.dataset.city;
    findUsersInLocation(targetCity);
    cityName.innerHTML = targetCity;
  }));
}

const findUsersInLocation = async (city = 'London') => {
  const usersAPI = 'https://bpdts-test-app.herokuapp.com/users';
  // Not the best or most accurate API but it provides a free access
  // which is reliable enough for this application
  const locationAPI = `https://en.wikipedia.org/w/api.php?action=query&prop=coordinates&format=json&titles=${city}`;

  try {
    const users = await fetchData(usersAPI);
    const city = await fetchData(locationAPI);
    const centrePoint = Object.values(city.query.pages)[0];

    // Filter users using function
    const usersWithinRadius = users.filter(user => {
      return findDataWithinRadius(
        {
          startLat: centrePoint.coordinates[0].lat,
          startLon: centrePoint.coordinates[0].lon
        },
        {targetLat: user.latitude, targetLon: user.longitude},
        50
      );
    });

    console.log(usersWithinRadius);

    // Users within radius
    populateUsersList(usersWithinRadius);
  } catch(error) {
    // ENHANCE: improve error messages to user
    console.error('Error ', error);
  }
}

// Start app and UI
(function() {
  loadCity();
  findUsersInLocation();
})();
