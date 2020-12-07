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

const populateUsersList = (users) => {
  const listUI = document.querySelector('.js-users-list');
  const listOfUsersUI = users.map(user => `<li>${user.first_name} ${user.last_name} - ${user.latitude} ${user.longitude}</li>`).join('');

  // ENHANCE: update to use insertAdjacentHTML
  listUI.innerHTML = listOfUsersUI;
}

const findUsersInLocation = async () => {
  const usersDataURL = 'https://bpdts-test-app.herokuapp.com/users';
  try {
    const users = await fetchData(usersDataURL);
    // London - ENHANCE: able to use other cities
    const centrePoint = {
      lat: 51.50722222,
      lon: -0.1275
    }
    // Filter users using function
    const usersWithinRadius = users.filter(user => {
      return findDataWithinRadius(
        {startLat: centrePoint.lat, startLon: centrePoint.lon},
        {targetLat: user.latitude, targetLon: user.longitude},
        50
      );
    });

    // Users within
    populateUsersList(usersWithinRadius);
  } catch(error) {
    // ENHANCE: improve error messages to user
    console.error('Error ', error);
  }
}

findUsersInLocation();