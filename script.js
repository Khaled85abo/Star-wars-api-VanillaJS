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
  state.selectedCharacter = {};
  state.peoples = {};
  state.totalPages = 9;
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
  fetch(`https://swapi.dev/api/people/?page=${state.page}`)
    .then((res) => res.json())
    .then((data) => {
      state.previous = data.previous;
      state.next = data.next;
      const page = state.page;
      state.peoples[page] = data.results;
      console.log(state.peoples);
      renderCharactersList(data.results);
    })
    .catch((err) => console.log(err))
    .finally(() => ulLoader(false));
}

function fetchExtraInfo(type) {
  if (Object.keys(state.selectedCharacter).length === 0) {
    return;
  }

  removeExtraInfoArticle();
  extraInfoLoader(true);

  if (type == CONSTANTS.PLANET) {
    fetch(state.selectedCharacter.homeworld)
      .then((res) => res.json())
      .then((data) => renderExtraInfo(data, type))
      .catch((err) => console.log(err));
  }

  if (type === CONSTANTS.VEHICLES) {
    if (state.selectedCharacter.vehicles.length < 1) {
      renderInfoMissing(type);
      return;
    }

    let vehicles;
    for (api of state.selectedCharacter.vehicles) {
      fetch(api)
        .then((res) => res.json())
        .then((data) => {
          vehicles = data;
          renderExtraInfo(data, type);
        })
        .catch((err) => console.log(err));
    }
    console.log(vehicles);
  }

  if (type === CONSTANTS.SPECIES) {
    if (state.selectedCharacter.species.length < 1) {
      renderInfoMissing(type);
      return;
    }
    let species;
    for (api of state.selectedCharacter.species) {
      fetch(api)
        .then((res) => res.json())
        .then((data) => {
          renderExtraInfo(data, type);
          species = data;
        })
        .catch((err) => console.log(err));
    }
  }

  if (type === CONSTANTS.STARSHIPS) {
    if (state.selectedCharacter.starships.length < 1) {
      renderInfoMissing(type);
      return;
    }
    let starships;
    for (api of state.selectedCharacter.starships) {
      fetch(api)
        .then((res) => res.json())
        .then((data) => {
          renderExtraInfo(data, type);
          starships = data;
        })
        .catch((err) => console.log(err));
    }

    console.log(starships.length);
  }
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

function renderExtraInfo(data, type) {
  //   removeExtraInfoArticle();
  console.log(data);
  const extraInfo =
    type === CONSTANTS.PLANET
      ? planetTemplate(data)
      : type === CONSTANTS.VEHICLES
      ? vehicleTemplate(data)
      : type === CONSTANTS.SPECIES
      ? specieTemplate(data)
      : starshipsTemplate(data);

  extraInfoLoader(false);
  document
    .querySelector(".extra-info")
    .insertAdjacentHTML("beforeend", extraInfo);
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

function renderInfoMissing(type) {
  const info = `
     <article>
        <h6>Inforamtion abut ${type} are not available.</h6>
    </article>
    `;
  extraInfoLoader(false);
  document.querySelector(".extra-info").insertAdjacentHTML("beforeend", info);
}

function planetTemplate(data) {
  const {
    climate,
    diameter,
    gravity,
    orbital_period,
    rotation_period,
    terrain,
    name,
  } = data;
  const info = `
    <article>
              <h5>${name}</h5>
              <p>Rotation period: ${rotation_period} ${
    rotation_period != "0" ? " h" : ""
  }</p>
              <p>Orbital period: ${orbital_period} ${
    orbital_period != "0" ? " days" : ""
  }</p>
              <p>Diameter: ${diameter} ${diameter != "0" ? " km" : ""}</p>
              <p>Climate: ${climate}</p>
              <p>Gravity: ${gravity}</p>
              <p>terrain: ${terrain}</p>
            </article>
    `;
  return info;
}
function vehicleTemplate(data) {
  const {
    cargo_capacity,
    consumables,
    crew,
    length,
    manufacturer,
    max_atmosphering_speed,
    name,
    model,
    passengers,
  } = data;
  const info = `
    <article>
              <h5>${name}</h5>
              <p>Length: ${length}h</p>
              <p>Manufacturer: ${manufacturer}days</p>
              <p>model: ${model}</p>
              <p>Max atmospheric speed: ${max_atmosphering_speed}km</p>
              <p>Crew: ${crew}</p>
              <p>Passengers: ${passengers}</p>
            </article>
    `;
  return info;
}

function specieTemplate(data) {
  const {
    average_height,
    average_lifespan,
    classification,
    eye_colors,
    hair_colors,
    language,
    skin_colors,
    name,
  } = data;
  const info = `
    <article>
              <h5>${name}</h5>
              <p>Average height: ${average_height}h</p>
              <p>Language: ${language}</p>
              <p>Classification: ${classification}</p>
              <p>Average lifespan: ${average_lifespan}km</p>
              <p>Skin colors: ${skin_colors}</p>
              <p>Hair colors: ${hair_colors}</p>
              <p>Eye colors: ${eye_colors}</p>
            </article>
    `;
  return info;
}
function starshipsTemplate(data) {
  const {
    MGLT,
    cargo_capacity,
    consumables,
    crew,
    length,
    manufacturer,
    max_atmosphering_speed,
    model,
    passengers,
    starship_class,
    name,
  } = data;
  const info = `
    <article>
              <h5>${name}</h5>
              <p>Starship class: ${starship_class}h</p>
              <p>Langth: ${length}days</p>
              <p>Manufacturer: ${manufacturer}</p>
              <p>Model: ${model}km</p>
              <p>Passengers: ${passengers}</p>
              <p>Crew: ${crew}</p>
              <p>Consumable: ${consumables}</p>
            </article>
    `;
  return info;
}

function renderPageNumber() {
  document.querySelector(".characters  span").innerText = state.page;

  // Disabel back/forward buttons when there are no more pages to show
  const backBtn = document.querySelector(".back-btn");
  const forwardBtn = document.querySelector(".forward-btn");
  // if (state.page == 1) {
  //     backBtn.disabled = true;
  // } else if (state.page == 9) {
  //     forwardBtn.disabled = ;
  // }
  state.page == 1 ? (backBtn.disabled = true) : (backBtn.disabled = false);
  state.page == 9
    ? (forwardBtn.disabled = true)
    : (forwardBtn.disabled = false);
}

function renderTotalPageNumbers() {
  let charactersPerPage = 6;
  state.totalPages = Math.ceil(82 / charactersPerPage);
  document.querySelector(".totalpages").innerText = state.totalPages;
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
