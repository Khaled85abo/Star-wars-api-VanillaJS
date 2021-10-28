let pagination = 1;
let results;
renderPageNumber();
fetchData();
document.querySelector(".backward").addEventListener("click", fetchPrevious);
document.querySelector(".forward").addEventListener("click", fetchNext);

function fetchPrevious() {
  if (pagination > 1) {
    pagination--;
  }
  fetchData();
  renderPageNumber();
}
function fetchNext() {
  if (pagination < 8) {
    pagination++;
  }
  fetchData();
  renderPageNumber();
}

function renderPageNumber() {
  document.querySelector(".page-number").innerText = pagination;
}
function fetchData() {
  fetch(`https://swapi.dev/api/people/?page=${pagination}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      results = data.results;
      managePerson(data.results);
    })
    .catch((error) => console.log(error));
  /*
  try {
    const response = await fetch("https://randomuser.me/api/?results=10");
    const data = await response.json();
    console.log("success: ", data);
    renderPersons(data.results);
  } catch (error) {
    console.log(error);
  }
  */
}

function managePerson(persons) {
  // for (let person of persons) {
  //   newArr.push({
  //     img: person.picture.thumbnail,
  //     name: person.name.first + " " + person.name.last,
  //   });
  // }

  let newArr = persons.map((person) => {
    return {
      name: person.name,
      homeWorld: person.homeworld,
      gender: person.gender,
      birthYear: person.birth_year,
      mass: person.mass,
    };
  });
  renderPersons(newArr);
  console.log(newArr);
}

function renderPersons(persons) {
  let result = "";
  persons.map((per) => {
    result += `<li>
     <p> ${per.name}</p>
     </li>`;
  });
  // persons.forEach((person) => {
  //   result += `<li> <img src='${person.img}' alt='picture'/>
  //    <span> ${person.name}</span>
  //    </li>`;
  // });

  // for (person of persons) {
  //   result += `<li> <img src='${person.img}' alt='picture'/>
  //   <span> ${person.name}</span>
  //   </li>`;
  // }
  document.querySelector("ul").innerHTML = result;
  addEventListeners();
}
function addEventListeners() {
  document.querySelectorAll("ul li").forEach((li) =>
    li.addEventListener("click", (e) => {
      // console.log(e.target.innerText)
      const charechter = results.find((per) => per.name === e.target.innerText);
      console.log(charechter);
      showSideSection(charechter);
    })
  );
}

function showSideSection(per) {
  const info = `
  <article>
  <p>Height: ${per.height}</p>
  <p>Mass: ${per.mass}</p>
  <p>Hair color: ${per.hair_color}</p>
  <p>Skin color: ${per.height}</p>
  <p>Eye color: ${per.eye_color}</p>
  <p>birthYear: ${per.birth_year}</p>
  <p>Gender: ${per.gender}</p>
  </article>
  `;
  document.querySelector(".char-info").innerHTML = info;
  renderPlanet(per.homeworld);
}

function renderPlanet(url) {
  const planetSection = document.querySelector(".planet");
  planetSection.innerHTML = "";
  document.querySelector(".loading-spinner").classList.remove("hidden");

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const info = `
        <article>
        <h4> ${data.name} </h4>
        <p>Rotation Period: ${data.rotation_period}</p>
        <p>Orbital period: ${data.orbital_period}</p>
        <p>Diameter: ${data.diameter}</p>
        <p>climate: ${data.climate}</p>
        <p>Gravity: ${data.gravity}</p>
        <p>Terrain: ${data.terrain}</p>
        </article>
        `;

      document.querySelector(".loading-spinner").classList.add("hidden");
      planetSection.innerHTML = info;
    });
}

function showPlanet(planet) {
  const info = `
  <article>
  <h4> ${planet.name} </h4>
  <p>Rotation Period: ${planet.rotation_period}</p>
  <p>Orbital period: ${planet.orbital_period}</p>
  <p>Diameter: ${planet.diameter}</p>
  <p>climate: ${planet.climate}</p>
  <p>Gravity: ${planet.gravity}</p>
  <p>Terrain: ${planet.terrain}</p>
  </article>
  `;

  document.querySelector(".planet").innerHTML = info;
}
showSpinner();
function showSpinner() {
  const spinner = document.querySelector(".loading-spinner").cloneNode(true);
  spinner.classList.remove("hiden");
  return spinner;
}
