export const getNumber = (url) => {
  const splitted = url.split("/");
  const num = splitted.filter((le) => le !== "" && Number.isInteger(+le));
  return num[0];
};
