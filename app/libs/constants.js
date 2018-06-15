module.exports = {
  uuidRE: /^[0-9a-f]{32}$/i,
  // Mongo _id regex: 57acfcf5ffaf0524572d58e8
  mongoIdRE: /^[0-9a-f]{24}$/i,
  maxImageFilesPerUpload: 100,
  awsBucketName: 'i.plaaant.com',
  imageSizeNames: ['orig', 'xl', 'lg', 'md', 'sm', 'thumb'],
  gisMultiplier: 10 ** 7,

  // Any user that is a member of a location should have one of these
  // roles for that location. The roles are, from left to right, most
  // permissive to least permissive.
  roles: ['owner', 'manager', 'member'],

  SERVICE_NAME: 'plant',
};
