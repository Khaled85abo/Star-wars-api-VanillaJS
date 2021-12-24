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
  characterTemplate,
} from "./templates.js";

import * as api from "./api/index.js";
import { getNumber } from "./functions.js";
//#endregion

/**
 *
 * ENTRY POINT
 *
 */
//#region
const state = {};

function main() {
  initState();
  initActions();
  fetchAllChars();
}

main();

//#endregion

/**
 *
 * Model Logic
 *
 */
//#region

const CONSTANTS = {
  PLANET: "planet",
  VEHICLES: "vehicles",
  SPECIES: "species",
  STARSHIPS: "starships",
};

function initState() {
  // characters list managment
  state.page = 1;
  state.charsPerPage = 6;
  state.charsCount;
  state.totalPages;
  // info section managment
  state.starships = {};
  state.planets = {};
  state.species = {};
  state.vehicles = {};
  state.selectedCharacter = {};
  state.currentArticle = 1;
  state.articlesArray;
  state.articleType;
  state.list = [];
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

async function fetchAllChars(page = 1) {
  if (page == 1) ulLoader(true);
  try {
    const data = await api.fetchPeople(page);
    state.list = [...state.list, ...data.results];
    if (page == 1) {
      state.charsCount = data.count;
    }
    if (data.next) {
      page++;
      fetchAllChars(page);
    } else {
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
  state.page++;
  renderCharactersList();
}

function previousPage() {
  state.page--;
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
  renderTotalPageNumbers();
  if (state.page > state.totalPages) {
    state.page = state.totalPages;
  }
  renderCharactersList();
}

function initListItemAction(nodeElement, char) {
  nodeElement.addEventListener("click", (e) => {
    removeListItemArrow();
    nodeElement.classList.add("active");
    renderCharacterDetails(char);
  });
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
  const ul = document.querySelector(".characters > ul");
  ul.innerHTML = "";
  let endIndex = state.page * state.charsPerPage;
  let startIndex = endIndex - state.charsPerPage;
  if (endIndex > state.list.length) {
    endIndex = state.list.length;
  }
  console.log(startIndex, endIndex);
  for (let i = startIndex; i < endIndex; i++) {
    const char = state.list[i];
    const li = document.createElement("li");
    li.innerText = char.name;
    ul.appendChild(li);
    initListItemAction(li, char);
  }
  renderPageNumber();
}

function renderCharacterDetails(char) {
  document.querySelector("aside").classList.remove("hidden");
  characterInfoLoader(true);
  // const character = state.list.find((el) => el.name == e.target.innerText);
  state.selectedCharacter = char;
  const characterDetails = characterTemplate(char);
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
  let extraInfo;
  switch (type) {
    case CONSTANTS.VEHICLES:
      extraInfo = vehicleTemplate(arr[state.currentArticle - 1]);
      break;
    case CONSTANTS.SPECIES:
      extraInfo = specieTemplate(arr[state.currentArticle - 1]);
      break;
    case CONSTANTS.STARSHIPS:
      extraInfo = starshipsTemplate(arr[state.currentArticle - 1]);
      break;
  }
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
  document.querySelector(".characters  span").innerText = state.page;
  const backBtn = document.querySelector(".back-btn");
  const forwardBtn = document.querySelector(".forward-btn");

  backBtn.disabled = state.page == 1;
  forwardBtn.disabled = state.page == state.totalPages;
}

function renderTotalPageNumbers() {
  const totalPages = Math.ceil(state.charsCount / state.charsPerPage);
  state.totalPages = totalPages;
  document.querySelector(".totalpages").innerHTML = totalPages;
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
