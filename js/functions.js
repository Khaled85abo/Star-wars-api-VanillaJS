export const getNumber = (url) => {
  const splitted = url.split("/");
  const spacehipNum = splitted.filter(
    (le) => le !== "" && Number.isInteger(+le)
  );
  return spacehipNum[0];
};
