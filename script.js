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
  state.list = [];
  state.selectedCharacter = {};
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
      figureExtraInfoType(input.getAttribute("data-type"))
    )
  );
}
function initListItemsEventListeners() {
  document
    .querySelectorAll("li")
    .forEach((item) => item.addEventListener("click", renderCharacterDetails));
}

function figureExtraInfoType(type) {
  console.log("selected character: ", state.selectedCharacter);
  if (Object.keys(state.selectedCharacter).length === 0) {
    return;
  }
  switch (type) {
    case "planet":
      fetchExtraInfo(state.selectedCharacter.homeworld, type);
      break;
    case "species":
      fetchExtraInfo(state.selectedCharacter.species, type);
      break;
    case "vehicles":
      fetchExtraInfo(state.selectedCharacter.vehicles, type);
      break;
    case "starships":
      fetchExtraInfo(state.selectedCharacter.starships, type);
      break;
  }
}

function fetchList() {
  fetch(`https://swapi.dev/api/people/?page=${state.page}`)
    .then((res) => res.json())
    .then((data) => {
      state.list = data.results;
      state.previous = data.previous;
      state.next = data.next;
      console.log(state.list);
      renderCharactersList(data.results);
    });
}

function fetchExtraInfo(api, type) {
  if (api.length === 0) {
    return;
  }

  console.log(api, type);
  if (type == undefined || type == CONSTANTS.PLANET) {
    fetch(api)
      .then((res) => res.json())
      .then((data) => renderExraInfo(data, type));
  }
  if (type === CONSTANTS.VEHICLES) {
    fetch(api[0])
      .then((res) => res.json())
      .then((data) => renderExraInfo(data, type));
  }
  if (type === CONSTANTS.SPECIES) {
    fetch(api[0])
      .then((res) => res.json())
      .then((data) => renderExraInfo(data, type));
  }
  if (type === CONSTANTS.STARSHIPS) {
    fetch(api[0])
      .then((res) => res.json())
      .then((data) => renderExraInfo(data, type));
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
  if (state.page < 9) {
    state.page++;
    fetchList();
  }
}
function PreviousPage() {
  if (state.page > 1) {
    state.page--;
    fetchList();
  }
}
function extraDetails() {}

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
  const preChar = document.querySelector("aside > article");
  if (preChar) {
    preChar.remove();
  }
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
            <p>Mass: ${mass}kg</p>
            <p>Hair color: ${hair_color}</p>
            <p>Skin color: ${skin_color}</p>
            <p>Eye color: ${eye_color}</p>
            <p>Birth year:${birth_year}</p>
            <p>Gender: ${gender}</p>
          </article>
    `;

  document
    .querySelector(".extra-info")
    .insertAdjacentHTML("beforebegin", characterDetails);
  fetchExtraInfo(character.homeworld);
}

function renderExraInfo(data, type) {
  const extraInfoArticle = document.querySelector(".extra-info  article");
  if (extraInfoArticle) {
    extraInfoArticle.remove();
  }
  const extraInfo =
    type === CONSTANTS.PLANET
      ? planetTemplate(data)
      : type === CONSTANTS.VEHICLES
      ? vehicleTemplate(data)
      : type === CONSTANTS.SPECIES
      ? specieTemplate(data)
      : starshipsTemplate(data);

  document
    .querySelector(".extra-info")
    .insertAdjacentHTML("beforeend", extraInfo);
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
              <p>Rotation period: ${rotation_period}h</p>
              <p>Orbital period: ${orbital_period}days</p>
              <p>Diameter: ${diameter}km</p>
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
              <p>Language: ${language}days</p>
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
  initActions();
  renderPageNumber();
  fetchList();
}

main();

//#endregion
