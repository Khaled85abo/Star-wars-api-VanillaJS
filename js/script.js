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
function initState() {
  state.page = 1;
  state.previous;
  state.next;
  state.starships = {};
  state.planets = {};
  state.species = {};
  state.vehicles = {};
  state.selectedCharacter = {};
  state.peoples = {};
  state.totalPages = 9;
  state.currentArticle = 1;
  state.articlesArray;
  state.articleType;
  state.list = [];
}

function initActions() {
  document
    .querySelector(".characters > div > button:first-child")
    .addEventListener("click", PreviousPage);
  document
    .querySelector(".characters > div > button:last-child")
    .addEventListener("click", nextPage);

  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) =>
    input.addEventListener("click", () =>
      fetchExtraInfo(input.getAttribute("data-type"))
    )
  );
}

function fetchList() {
  ulLoader(true);
  removeListItems();
  api
    .fetchPeople(state.page)
    .then((res) => res.json())
    .then((data) => {
      state.previous = data.previous;
      state.next = data.next;
      const page = state.page;
      state.peoples[page] = data.results;
      renderCharactersList(data.results);
    })
    .catch((err) => console.log(err))
    .finally(() => ulLoader(false));
}

async function fetchExtraInfo(type) {
  const char = state.selectedCharacter;

  if (Object.keys(char).length === 0) {
    return;
  }
  removeExtraInfoArticle();
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
  state.page++;
  if (state.peoples[state.page]) {
    renderCharactersList(state.peoples[state.page]);
  } else {
    fetchList();
  }
}
function PreviousPage() {
  state.page--;
  if (state.peoples[state.page]) {
    renderCharactersList(state.peoples[state.page]);
  } else {
    fetchList();
  }
}

function initListItemsEventListeners() {
  document
    .querySelectorAll("li")
    .forEach((item) => item.addEventListener("click", renderCharacterDetails));
}

//#endregion
/**
 *
 * View Logic
 *
 */
//#region

function renderCharactersList(list) {
  let listItems = "";
  for (let char of list) {
    listItems += `<li>${char.name}</li>`;
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
  const preChar = document.querySelector("aside > article");
  if (preChar) {
    preChar.remove();
  }
  const character = state.peoples[state.page].find(
    (el) => el.name == e.target.innerText
  );
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
  document
    .querySelector(".extra-info")
    .insertAdjacentHTML("beforebegin", characterDetails);
  document.querySelector("input:first-of-type").checked = true;
  fetchExtraInfo(CONSTANTS.PLANET);
}

function renderMultiArticles(arr, type) {
  console.log(arr, type, state.currentArticle);

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
function initMultiArticleActions() {
  document
    .querySelector(".multi-back-btn")
    .addEventListener("click", multiBackBtnCLicked);
  document
    .querySelector(".multi-forward-btn")
    .addEventListener("click", multiForwardBtnCLicked);
}
function multiBackBtnCLicked() {
  if (state.currentArticle == 1) {
    state.currentArticle = state.articlesArray.length;
  } else {
    state.currentArticle--;
  }
  renderMultiArticles(state.articlesArray, state.articleType);
}
function multiForwardBtnCLicked() {
  if (state.currentArticle == state.articlesArray.length) {
    state.currentArticle = 1;
  } else {
    state.currentArticle++;
  }
  renderMultiArticles(state.articlesArray, state.articleType);
}

function renderPlanet(data) {
  extraInfoLoader(false);
  document.querySelector(".article").innerHTML = planetTemplate(data);
}

function removeExtraInfoArticle() {
  const extraInfoArticle = document.querySelectorAll(".extra-info  article");
  if (extraInfoArticle.length > 0) {
    for (let article of extraInfoArticle) {
      article.remove();
    }
  }
}

function removeListItems() {
  const items = document.querySelectorAll("li");
  if (items.length > 0) {
    items.forEach((item) => item.remove());
  }
}

function renderPageNumber() {
  document.querySelector(".characters  span").innerText = state.page;

  // Disabel back/forward buttons when there are no more pages to show
  const backBtn = document.querySelector(".back-btn");
  const forwardBtn = document.querySelector(".forward-btn");

  state.page == 1 ? (backBtn.disabled = true) : (backBtn.disabled = false);
  state.page == 9
    ? (forwardBtn.disabled = true)
    : (forwardBtn.disabled = false);
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
  fetchList();
  initActions();
  renderPageNumber();
  // renderTotalPageNumbers();
}

main();

//#endregion
