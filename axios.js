import * as Carousel from "./Carousel.js";
import axios from "axios";

// set the base url and default headers
const api = axios.create({
  baseURL: "https://api.thecatapi.com/v1",
  headers: {
    "X-Auth-Token":
      "live_JRSGN9YvGuyHRgxfsHMQcnwZaewFzlrcB5PvuWf02JylZ16l5EuRiNuwZgR4rslW",
    "Content-Type": "application/json",
  },
});

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_JRSGN9YvGuyHRgxfsHMQcnwZaewFzlrcB5PvuWf02JylZ16l5EuRiNuwZgR4rslW";

// add start time to the request object
//     const truncatedConfigUrl =
//       config.url.length > 10 ? config.url.substring(0, 10) + "..." : config.url;
//     console.log(`Request started: ${config.method.toUpperCase()} ${truncatedConfigUrl}`
//     );
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//     error;
//   }
// );

// add a request interceptor to log when requests begin, reset the progress bar
axios.interceptors.request.use(
  (config) => {
    // reset progress bar to 0% when a new request starts
    progressBar.style.width = "0%";
    document.body.style.cursor = "progress";
    config.startTime = Date.now();
    console.log(
      `Request started: ${config.method.toUpperCase()} ${truncatedConfigUrl}`
    );
    return config;
  },
  (error) => {
    document.body.style.cursor = "default";
    return Promise.reject(error);
  }
);

// add a response interceptor to log the time taken for the request
axios.interceptors.response.use(
  (response) => {
    document.body.style.cursor = "default";
    const endTime = Date.now();
    const duration = endTime - response.config.startTime;
    // compute time taken
    console.log(`Response took ${duration}ms`);
    return response;
  },
  (error) => {
    const endTime = Date.now();
    const duration = endTime - error.config.startTime;
    // compute time taken in case of error
    document.body.style.cursor = "default";
    console.log(`Request to ${error.config.url} failed after ${duration}ms`);
    return Promise.reject(error);
  }
);

// create the updateProgress function
function updateProgress(progressEvent) {
  progressBar.style.width = `${progressEvent.progress * 100}%`;
  // compute the percentage of the progress
  if (progressEvent.lengthComputable) {
    const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
    progressBar.style.width = `${percentComplete}%`;
    console.log(progressEvent);
    console.log("test");
  }
  // console.log(progressEvent.progress);
}

// original function
async function initialLoad() {
  try {
    const breedList = await api.get("/breeds"); // base URL + endpoint
    const breedData = breedList.data;
    // console.log(breedData);
    breedData.forEach((breed) => {
      // breed select
      const option = document.createElement("option");
      option.textContent = breed.name;
      option.value = breed.id;
      breedSelect.append(option);
    });
  } catch (error) {
    console.error("Error fetching breed list:", error);
  }
}
// slowing it down so we can see the progress bar
setTimeout(() => {}, 9000);

// calling the function to load it all up
initialLoad();
// when the dropdown is selected ...
breedSelect.addEventListener("change", getBreedData);

async function getBreedData(e) {
  Carousel.clear(); // reset the carousel
  infoDump.textContent = ""; // initialize to blank
  const breed_id = breedSelect.value;
  try {
    const response = await api.get(
      `/images/search?limit=10&breed_ids=${breed_id}&api_key=${API_KEY}`, // only specify the endpoint
      {
        // set up the download progress handler
        onDownloadProgress: updateProgress,
      }
    );

    const data = response.data;
    data.forEach((d) => {
      const x = Carousel.createCarouselItem(d.url, breed_id, d.id);
      Carousel.appendCarousel(x);
    });
    Carousel.start();

    const breedObj = data[0].breeds[0];
    const h1 = document.createElement("h1");
    const h2 = document.createElement("h2");
    const h3 = document.createElement("h3");
    const p = document.createElement("p");

    h1.textContent = breedObj.name;
    h2.textContent = breedObj.origin;
    h3.textContent = `(${breedObj.alt_names}) — ${breedObj.description} Life expectancy is ${breedObj.life_span} years.`;
    p.textContent = `Energy Level is: ${breedObj.energy_level} | Affection Level is: ${breedObj.affection_level} | Temperament — ${breedObj.temperament}`;
    //
    console.log(breedObj);
    // description and origin
    infoDump.appendChild(h1);
    infoDump.appendChild(h2);
    infoDump.appendChild(h3);
    infoDump.appendChild(p); 
  } catch (error) {
    console.error("Error ... can't grab that breed data:", error);
  }
}

// wikipedia_url
// console.log(favData);

// add a photo to the group
export async function favourite(imgId) { 
  

  const response = await fetch(
    '/favourites?limit=20&sub_id=user-123&order=DESC',{
        headers:{
            "content-type":"application/json",
            'x-api-key': 'YOUR-KEY'
        }
    });
    const favourites = await response.json();  
  
}

/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */

export async function favourite(imgId) {
  try {
    // Check if the image is already in the favourites
    const favData = await axios.get('/favourites', {
      params: { image_id: imgId },
    });


    if (favData.data.length > 0) {

      console.log(favData.data)
      const favItemId = favData.data[0].id;
      const deletedFav = await axios.delete(`/favourites/${favItemId}`);
      console.log(deletedFav.data, "this is deleted");
    } else {
      // If the image is not in the favourites, add it
      const addedFav = await axios.post("/favourites", {
        image_id: imgId
      });


      console.log(addedFav.data, "this is added to favourites");
    }
  } catch (error) {
    console.error('Error toggling favourite status', error);
  }
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 **/

async function getFavorites() {
  Carousel.clear()
  infoDump.textContent = ""
    const favdata = await axios.get("https://api.thecatapi.com/v1/favourites");
    favdata.data.map(image => {
const url = image.image.url
     const element =  Carousel.createCarouselItem(url)
      Carousel.appendCarousel(element)
    })
  Carousel.start()
}

getFavouritesBtn.addEventListener('click', getFavorites)