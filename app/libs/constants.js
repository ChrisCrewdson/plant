module.exports = {
  uuidRE: /^[0-9a-f]{32}$/i,
  // Mongo _id regex: 57acfcf5ffaf0524572d58e8
  mongoIdRE: /^[0-9a-f]{24}$/i,
  maxImageFilesPerUpload: 100,
  awsBucketName: 'i.plaaant.com',
  imageSizeNames: ['orig', 'xl', 'lg', 'md', 'sm', 'thumb'],
  // eslint-disable-next-line no-restricted-properties
  gisMultiplier: Math.pow(10, 7),
  roles: ['owner', 'manager', 'member'],
};
