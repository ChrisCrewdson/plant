import { Store } from 'redux';
import isFunction from 'lodash/isFunction';

export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const $ = require('jquery');

/**
 * Make the AJAX call to the server
 */
function jqueryAjax(options: JQueryAjaxSettings) {
  return $.ajax(options);
}

const pending: Record<string, boolean> = {};

/**
 * Flags a URL as waiting on a response from the server to prevent an identical second
 * call being made to the server.
 */
function callPending(options: JQueryAjaxSettings): boolean {
  if (!options.url) {
    return false;
  }

  if (options.type === 'GET' && pending[options.url]) {
    return true;
  }
  if (options.type === 'GET') {
    pending[options.url] = true;
  }
  return false;
}

/**
 * Clears the pending flag once a response has been received back from the server.
 */
function clearPending(options: JQueryAjaxSettings): void {
  if (options.url) {
    pending[options.url] = false;
  }
}

module.exports = (store: Store, options: AjaxOptions) => {
  if (!options.url || !isFunction(options.success) || !isFunction(options.failure)) {
    // console.error('Invalid options for ajax:', options);
  }

  const ajaxOptions: JQueryAjaxSettings = {
    type: options.type || 'GET',
    beforeSend: options.beforeSend,
    url: options.url,
    // Success: Function( Anything data, String textStatus, jqXHR jqXHR )
    success: (result) => {
      clearPending(ajaxOptions);
      if (options.success) {
        store.dispatch(options.success(result));
      }
    },
    // Error: Function( jqXHR jqXHR, String textStatus, String errorThrown )
    error: (jqXHR, textStatus, errorThrown) => {
      clearPending(ajaxOptions);
      // console.error(`${ajaxOptions.type} error for ${options.url}`, errorThrown);
      if (options.failure) {
        store.dispatch(options.failure(errorThrown));
      }
    },
  };

  if (callPending(ajaxOptions)) {
    return;
  }

  /**
   * Provides a way to show the user the progress on the upload
   */
  function progressHandlingFunction(e: ProgressEvent) {
    if (e.lengthComputable) {
      const uploadProgress = { value: e.loaded, max: e.total, note: options.note };
      if (options.progress) {
        store.dispatch(options.progress({ uploadProgress }));
      } else {
        // console.warn('options does not have progress function in progressHandlingFunction');
      }
    } else {
      // console.error('e.lengthComputable is falsy in progressHandlingFunction:',
      // e.lengthComputable);
    }
  }

  if (options.fileUpload) {
    // eslint-disable-next-line no-param-reassign
    delete options.fileUpload;
    ajaxOptions.contentType = false;
    ajaxOptions.processData = false;
    ajaxOptions.cache = false;

    // Custom XMLHttpRequest
    ajaxOptions.xhr = function xhrUpload() {
      const xhr = $.ajaxSettings.xhr();
      if (xhr.upload) { // Check if upload property exists
        xhr.upload.addEventListener('progress', progressHandlingFunction, false); // For handling the progress of the upload
      } else {
        // console.error('No upload on xhr');
      }
      return xhr;
    };
  }
  ajaxOptions.data = options.data;

  jqueryAjax(ajaxOptions);
};
