/**
 *
 * Imports
 *
 */
//#region
import {
  planetTemplate,
  vehicleTemplate,
  starshipsTemplate,
  specieTemplate,
} from "./templates.js";

import * as api from "./api/index.js";
import { getNumber } from "./functions.js";
//#endregion

/**
 *
 * Model Logic
 *
 */
//#region

const state = {};
const CONSTANTS = {
  PLANET: "planet",
  VEHICLES: "vehicles",
  SPECIES: "species",
  STARSHIPS: "starships",
};
// page, pageSize to avoid pagesArray

function initState() {
  state.charsPerPage = 6;
  state.totalChars;
  state.startIndex = 0;
  state.endIndex = state.charsPerPage;
  state.starships = {};
  state.planets = {};
  state.species = {};
  state.vehicles = {};
  state.selectedCharacter = {};
  state.currentArticle = 1;
  state.articlesArray;
  state.articleType;
  state.list = [];
  state.pagesArray = [];
  state.pagesArrayIndex = 0;
}

function initActions() {
  document
    .querySelector(".characters > div > button:first-child")
    .addEventListener("click", previousPage);
  document
    .querySelector(".characters > div > button:last-child")
    .addEventListener("click", nextPage);

  document
    .querySelector(".range-input > input")
    .addEventListener("input", changeCharsPerPage);
  const inputs = document.querySelectorAll("input[data-type]");
  inputs.forEach((input) =>
    input.addEventListener("click", () =>
      fetchExtraInfo(input.getAttribute("data-type"))
    )
  );
}

function createPagesArray() {
  state.pagesArray = [];
  for (let i = 0; i < Math.ceil(state.list.length / state.charsPerPage); i++) {
    createPage();
  }

  console.log("pages array: ", state.pagesArray);
}

function createPage() {
  const page = [];
  for (let i = state.startIndex; i < state.endIndex; i++) {
    if (state.list[i]) {
      page.push(state.list[i]);
    }
  }
  state.pagesArray.push(page);
  state.startIndex = state.endIndex;
  state.endIndex = state.startIndex + state.charsPerPage;
}

async function fetchAllChars(page = 1) {
  if (page == 1) ulLoader(true);
  try {
    const data = await api.fetchPeople(page);
    state.list = [...state.list, ...data.results];
    if (page == 1) {
      state.totalChars = data.count;
    }
    if (data.next) {
      page++;
      fetchAllChars(page);
    } else {
      createPagesArray();
      renderCharactersList();
      renderTotalPageNumbers();
      ulLoader(false);
    }
  } catch (err) {
    console.log(err);
  }
}

async function fetchExtraInfo(type) {
  const char = state.selectedCharacter;

  if (Object.keys(char).length === 0) {
    return;
  }
  extraInfoLoader(true);

  if (type == CONSTANTS.PLANET) {
    const num = getNumber(char.homeworld);
    if (num in state.planets) {
      renderPlanet(state.planets[num]);
    } else {
      try {
        const data = await api.fetchPlanet(num);
        state.planets[num] = data;
        renderPlanet(data);
      } catch (error) {
        console.log(error);
      }
    }
  }

  if (type === CONSTANTS.VEHICLES) {
    if (char.vehicles.length < 1) {
      renderInfoMissing(type);
      return;
    }
    let vehicles = await loopAndFetch(
      char.vehicles,
      state.vehicles,
      api.fetchVehicles
    );
    renderMultiArticles(vehicles, type);
  }

  if (type === CONSTANTS.SPECIES) {
    if (char.species.length < 1) {
      renderInfoMissing(type);
      return;
    }
    let species = await loopAndFetch(
      char.species,
      state.species,
      api.fetchSpecies
    );
    renderMultiArticles(species, type);
  }

  if (type === CONSTANTS.STARSHIPS) {
    if (char.starships.length < 1) {
      renderInfoMissing(type);
      return;
    }
    let starships = await loopAndFetch(
      char.starships,
      state.starships,
      api.fetchStarships
    );
    renderMultiArticles(starships, type);
  }
}

async function loopAndFetch(urls, stateObject, apiFetch) {
  const array = [];
  for (let url of urls) {
    const num = getNumber(url);
    if (num in stateObject) {
      array.push(stateObject[num]);
    } else {
      try {
        const data = await apiFetch(num);
        array.push(data);
        stateObject[num] = data;
      } catch (error) {
        console.log(error);
      }
    }
  }
  return array;
}

//#endregion
/**
 *
 * Controller Logic
 *
 */
//#region
function nextPage() {
  state.pagesArrayIndex++;
  renderCharactersList();
}
function previousPage() {
  state.pagesArrayIndex--;
  renderCharactersList();
}
function nextArticle() {
  if (state.currentArticle == state.articlesArray.length) {
    state.currentArticle = 1;
  } else {
    state.currentArticle++;
  }
  renderMultiArticles(state.articlesArray, state.articleType);
}
function previousArticle() {
  if (state.currentArticle == 1) {
    state.currentArticle = state.articlesArray.length;
  } else {
    state.currentArticle--;
  }
  renderMultiArticles(state.articlesArray, state.articleType);
}
function changeCharsPerPage(e) {
  state.charsPerPage = Number(e.target.value);
  state.startIndex = 0;
  state.endIndex = state.charsPerPage;
  createPagesArray();
  renderCharactersList();
  renderTotalPageNumbers();
}
function initListItemsEventListeners() {
  document
    .querySelectorAll("li")
    .forEach((item) => item.addEventListener("click", renderCharacterDetails));
}
function initMultiArticleActions() {
  document
    .querySelector(".multi-back-btn")
    .addEventListener("click", previousArticle);
  document
    .querySelector(".multi-forward-btn")
    .addEventListener("click", nextArticle);
}

//#endregion
/**
 *
 * View Logic
 *
 */
//#region

function renderCharactersList() {
  const page = state.pagesArray[state.pagesArrayIndex];
  let listItems = "";
  if (page) {
    for (let el of page) {
      listItems += `<li>${el.name}</li>`;
    }
  }
  document.querySelector(".characters > ul").innerHTML = listItems;
  initListItemsEventListeners();
  renderPageNumber();
}

function renderCharacterDetails(e) {
  document.querySelector("aside").classList.remove("hidden");
  removeListItemArrow();
  e.target.classList.add("active");
  characterInfoLoader(true);
  const character = state.list.find((el) => el.name == e.target.innerText);
  state.selectedCharacter = character;

  const {
    name,
    height,
    mass,
    hair_color,
    skin_color,
    eye_color,
    birth_year,
    gender,
  } = character;
  const characterDetails = `
     <article>
            <h5>${name}</h5>
            <p>Height: ${height}cm</p>
            <p>Mass: ${mass} kg</p>
            <p>Hair color: ${hair_color}</p>
            <p>Skin color: ${skin_color}</p>
            <p>Eye color: ${eye_color}</p>
            <p>Birth year:${birth_year}</p>
            <p>Gender: ${gender}</p>
          </article>
    `;
  characterInfoLoader(false);
  document.querySelector(".character-details").innerHTML = characterDetails;
  document.querySelector(".btns > input[data-type='planet']").checked = true;
  fetchExtraInfo(CONSTANTS.PLANET);
}

function renderMultiArticles(arr, type) {
  state.articlesArray = arr;
  state.articleType = type;
  if (state.currentArticle > state.articlesArray.length) {
    state.currentArticle = 1;
  }
  const extraInfo =
    type === CONSTANTS.VEHICLES
      ? vehicleTemplate(arr[state.currentArticle - 1])
      : type === CONSTANTS.SPECIES
      ? specieTemplate(arr[state.currentArticle - 1])
      : starshipsTemplate(arr[state.currentArticle - 1]);
  extraInfoLoader(false);
  document.querySelector(".article").innerHTML = `
  ${extraInfo}
  ${
    arr.length > 1
      ? `
      <div class="multi-div">
        <button class="multi-back-btn">◀</button>
        <span>${state.currentArticle}</span>
        <span>/</span>
        <span class="totalpages">${arr.length}</span>
        <button class="multi-forward-btn">▶</button>
      </div>
    `
      : ""
  } 
  `;
  arr.length > 1 && initMultiArticleActions();
}
function renderPlanet(data) {
  extraInfoLoader(false);
  document.querySelector(".article").innerHTML = planetTemplate(data);
}

function renderPageNumber() {
  document.querySelector(".characters  span").innerText =
    state.pagesArrayIndex + 1;
  // const firstLi = document.querySelector("li").innerText;
  // const indexOfLi = state.list.findIndex((el) => el.name == firstLi);
  // Disabel back/forward buttons when there are no more pages to show
  const backBtn = document.querySelector(".back-btn");
  const forwardBtn = document.querySelector(".forward-btn");

  backBtn.disabled = state.pagesArrayIndex == 0;
  forwardBtn.disabled =
    state.pagesArrayIndex == Math.floor(state.totalChars / state.charsPerPage);

  // state.pagesArrayIndex == 0
  //   ? (backBtn.disabled = true)
  //   : (backBtn.disabled = false);
  // state.pagesArrayIndex == Math.floor(state.totalChars / state.charsPerPage)
  //   ? (forwardBtn.disabled = true)
  //   : (forwardBtn.disabled = false);
}

function renderTotalPageNumbers() {
  document.querySelector(".totalpages").innerHTML = Math.ceil(
    state.totalChars / state.charsPerPage
  );
}

function renderInfoMissing(type) {
  const info = `
     <article>
        <h6>Inforamtion abut ${type} are not available.</h6>
    </article>
    `;
  extraInfoLoader(false);
  document.querySelector(".article").innerHTML = info;
}

function characterInfoLoader(loading) {
  const spinner = document.querySelector(".details");
  loading
    ? spinner.classList.remove("hidden")
    : spinner.classList.add("hidden");
}
function extraInfoLoader(loading) {
  const spinner = document.querySelector(".extraInfo");
  loading
    ? spinner.classList.remove("hidden")
    : spinner.classList.add("hidden");
}
function ulLoader(loading) {
  const spinner = document.querySelector(".ul-loader");
  if (loading) {
    spinner.classList.remove("hidden");
    svgLoader(true);
  } else {
    spinner.classList.add("hidden");
    svgLoader(false);
  }
}

function svgLoader(loading = false) {
  const svg = document.querySelector(".svg");
  loading ? svg.classList.add("front") : svg.classList.remove("front");
}

function removeListItemArrow() {
  document
    .querySelectorAll("li")
    .forEach((li) => li.classList.remove("active"));
}

//#endregion

/**
 *
 * Entry Point
 *
 */
//#region
function main() {
  initState();
  fetchAllChars();
  initActions();
}

main();

//#endregion
