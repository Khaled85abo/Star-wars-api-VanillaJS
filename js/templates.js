export { planetTemplate, specieTemplate, vehicleTemplate, starshipsTemplate };
const planetTemplate = (data) => {
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
};
const vehicleTemplate = (data) => {
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
};
const specieTemplate = (data) => {
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
};

const starshipsTemplate = (data) => {
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
};
