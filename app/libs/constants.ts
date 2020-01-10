import { ImageSizeName } from '../../lib/db/mongo/model-note';

// A file for constants used on both the client and server

export const imageSizeNames: ImageSizeName[] = ['orig', 'xl', 'lg', 'md', 'sm', 'thumb'];

// Any user that is a member of a location should have one of these
// roles for that location. The roles are, from left to right, most
// permissive to least permissive.
export const roles: Role[] = ['owner', 'manager', 'member'];

export const uuidRE = /^[0-9a-f]{32}$/i;
export const mongoIdRE = /^[0-9a-f]{24}$/i; // Mongo _id regex 57acfcf5ffaf0524572d58e8
export const maxImageFilesPerUpload = 100;
export const awsBucketName = 'i.plaaant.com';

export const gisMultiplier = 10 ** 7;
export const SERVICE_NAME = 'plant';
