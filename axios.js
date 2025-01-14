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
setTimeout(() => {}, 10000);

// calling the function to load it all up
initialLoad();

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */

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

    const breedObj = data[0].breeds[0];     // adding elements to infoDump

    const h1 = document.createElement("h1");
    const h2 = document.createElement("h2");
    const h3 = document.createElement("h3");
    const p = document.createElement("p");

    h1.textContent = breedObj.name;
    h2.textContent = breedObj.origin;
    h3.textContent = `(${breedObj.alt_names}) — ${breedObj.description} Life expectancy is ${breedObj.life_span} years.`;
    p.textContent = `Energy Level is: ${breedObj.energy_level} | Affection Level is: ${breedObj.affection_level} | Temperament — ${breedObj.temperament}`;
    //
    // console.log(breedObj);
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

// * 3. 4. Change all of your fetch() functions to axios!
// * - axios has already been imported for you within index.js.
// * - If you've done everything correctly up to this point, this should be simple.
// * - If it is not simple, take a moment to re-evaluate your original code.
// * - Hint: Axios has the ability to set default headers. Use this to your advantage
// *   by setting a default header with your API key so that you do not have to
// *   send it manually with all of your requests! You can also set a default base URL!
// */
/**
* 5. Add axios interceptors to log the time between request and response to the console.
* - Hint: you already have access to code that does this!
* - Add a console.log statement to indicate when requests begin.
* - As an added challenge, try to do this on your own without referencing the lesson material.
*/

/**
* 6. Next, we'll create a progress bar to indicate the request is in progress.
* - The progressBar element has already been created for you.
*  - You need only to modify its "width" style property to align with the request progress.
* - In your request interceptor, set the width of the progressBar element to 0%.
*  - This is to reset the progress with each request.
* - Research the axios onDownloadProgress config option.
* - Create a function "updateProgress" that receives a ProgressEvent object.
*  - Pass this function to the axios onDownloadProgress config option in your event handler.
* - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
*  - Update the progress of the request using the properties you are given.
* - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
*   once or twice per request to this API. This is still a concept worth familiarizing yourself
*   with for future projects.
*/

/**
* 7. As a final element of progress indication, add the following to your axios interceptors:
* - In your request interceptor, set the body element's cursor style to "progress."
* - In your response interceptor, remove the progress cursor style from the body element.
*/


// add a request interceptor to log when requests begin, reset the progress bar
axios.interceptors.request.use(
  (config) => {
    // reset progress bar to 0% when a new request starts
    progressBar.style.width = "0%";
    document.body.style.cursor = 'progress';
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


// add a photo to the group
export async function favourite(imgId) {
  const response = await fetch(
    "/favourites?limit=20&sub_id=user-123&order=DESC",
    {
      headers: {
        "content-type": "application/json",
        "x-api-key": "YOUR-KEY",
      },
    }
  );
  const favourites = await response.json();
}
//   try {                                    // check if the image is already in the group
//     const favData = await axios.get("/favourites", {
//       params: { image_id: imgId },
//     });

//     console.log("Response from GET /favourites:", favData);

//     if (favData.data && favData.data.length > 0) {
//       console.log(favData.data[0].id);
//       const favItemId = favData.data[0].id;
//       if (!favItemId) {
//         console.error("Error: favItemId is undefined or null.");
//         return;
//       }
//       const deletedFav = await axios.delete(`/favourites/${favItemId}`);
//       // alert("Image removed from favourites");
//       console.log(deletedFav.data, "this has been deleted from Favourites");
//     } else {
//       // if the image is not in the group, add it
//       const addedFav = await axios.post("/favourites", {
//         image_id: imgId,
//       });
//       // alert("Image added to Favourites");
//       console.log("Response from POST /favourites:", addedFav);
//     }
//   } catch (error) {
//     console.error("Error in favourite function:", error);
//   }
// }

// async function getFavorites() {
//   Carousel.clear();
//   infoDump.textContent = "";
//   const favdata = await axios.get("/favourites");
//   favdata.data.map((image) => {
//     const url = image.image.url;
//     const element = Carousel.createCarouselItem(url);
//     Carousel.appendCarousel(element);
//   });
//   Carousel.start();
// }

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
  Carousel.clear();
  infoDump.textContent = "";
  const favdata = await axios.get("https://api.thecatapi.com/v1/favourites");
  favdata.data.map((image) => {
    const url = image.image.url;
    const element = Carousel.createCarouselItem(url);
    Carousel.appendCarousel(element);
  });
  Carousel.start();
}

getFavouritesBtn.addEventListener("click", getFavorites);
