export const getImagePath = (fileName, folderName) => {
  return `${process.env.SERVER_URI}/uploads/${folderName}/${fileName}`;
};
