const baseUrl = "https://swapi.dev/api/";

export const fetchPeople = async (page) => {
  const getData = await fetch(`${baseUrl}people/?page=${page}`);
  const data = await getData.json();
  return data;
};
export const fetchPlanet = async (planet) => {
  const getData = await fetch(`${baseUrl}planets/${planet}`);
  const data = await getData.json();
  return data;
};
export const fetchVehicles = async (vehicle) => {
  const getData = await fetch(`${baseUrl}vehicles/${vehicle}`);
  const data = await getData.json();
  return data;
};
export const fetchSpecies = async (specie) => {
  const getData = await fetch(`${baseUrl}species/${specie}`);
  const data = await getData.json();
  return data;
};
export const fetchStarships = async (starship) => {
  const getData = await fetch(`${baseUrl}starships/${starship}`);
  const data = await getData.json();
  return data;
};
