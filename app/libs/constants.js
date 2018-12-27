// A file for constants used on both the client and server

/** @type {ImageSizeName[]} */
const imageSizeNames = ['orig', 'xl', 'lg', 'md', 'sm', 'thumb'];

// Any user that is a member of a location should have one of these
// roles for that location. The roles are, from left to right, most
// permissive to least permissive.
/** @type {Role[]} */
const roles = ['owner', 'manager', 'member'];

module.exports = {
  uuidRE: /^[0-9a-f]{32}$/i,
  mongoIdRE: /^[0-9a-f]{24}$/i, // Mongo _id regex: 57acfcf5ffaf0524572d58e8
  maxImageFilesPerUpload: 100,
  awsBucketName: 'i.plaaant.com',
  imageSizeNames,
  gisMultiplier: 10 ** 7,
  roles,
  SERVICE_NAME: 'plant',
};
