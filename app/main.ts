import { renderMain } from './main-render';
import { poly } from './poly';

import 'jquery';
import 'konva';
import 'typeface-roboto';
import './stylesheets/main.css';

/**
 * Check if local storage needs updating or not based on version.
 * Previously there wasn't a version associated with localStorage so we default
 * a zero if the 'version' key is missing.
 */
function updateLocalStorage(): void {
  const VERSION_KEY = 'version';
  const CURRENT_VERSION = '1';
  const UNVERSIONED = '0';
  const version = localStorage.getItem(VERSION_KEY) || UNVERSIONED;
  switch (version) {
    case UNVERSIONED:
      // eslint-disable-next-line no-console
      console.log(`Clearing localStorage version ${version}`);
      localStorage.clear();
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      break;
    case CURRENT_VERSION:
      // This is the current version - do nothing
      break;
    default:
      // eslint-disable-next-line no-console
      console.warn(`Unexpected version in localStorage ${version} - clearing storage`);
      localStorage.clear();
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      break;
  }
}

// Polyfill any new browser features we need
poly((err?: Error) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  updateLocalStorage();
  renderMain();
});
