export const isValidCoordinates = (latitude, longitude) =>
  Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
