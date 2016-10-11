const isFunction = require('lodash/isFunction');
const $ = require('jquery');

// const logger = require('../../../lib/logging/logger').create('test.ajax');

function setJwtHeader(store, request) {
  const jwt = store.getState().getIn(['user', 'jwt']);
  if(jwt) {
    request.setRequestHeader('Authorization', 'Bearer ' + jwt);
  }
}

function jqueryAjax(options) {
  return $.ajax(options);
};

const pending = {};

function callPending(options) {
  if(options.type === 'GET' && pending[options.url]) {
    return true;
  }
  if(options.type === 'GET') {
    pending[options.url] = true;
  }
  return false;
}

function clearPending(options) {
  pending[options.url] = false;
}

module.exports = (store, options) => {

  if(!options.url || !isFunction(options.success) || !isFunction(options.failure)) {
    console.error('Invalid options for ajax:', options);
  }

  const ajaxOptions = {
    type: options.type || 'GET',
    beforeSend: options.beforeSend || setJwtHeader.bind(null, store),
    url: options.url,
    // Success: Function( Anything data, String textStatus, jqXHR jqXHR )
    success: (result) => {
      clearPending(ajaxOptions);
      if(options.success) {
        store.dispatch(options.success(result));
      }
    },
    // Error: Function( jqXHR jqXHR, String textStatus, String errorThrown )
    error: (jqXHR, textStatus, errorThrown) => {
      clearPending(ajaxOptions);
      console.error(`${ajaxOptions.type} error for ${options.url}`, errorThrown);
      if(options.failure) {
        store.dispatch(options.failure(errorThrown));
      }
    }
  };

  if(callPending(ajaxOptions)) {
    return;
  }

  function progressHandlingFunction(e) {
    if(e.lengthComputable){
      const uploadProgress = {value: e.loaded, max: e.total, note: options.note};
      console.log('progressHandlingFunction', {uploadProgress});
      if(options.progress) {
        store.dispatch(options.progress({uploadProgress}));
      } else {
        console.warn('options does not have progress function in progressHandlingFunction');
      }
    } else {
      console.error('e.lengthComputable is falsey in progressHandlingFunction:', e.lengthComputable);
    }
  }

  if(options.fileUpload) {
    delete options.fileUpload;
    ajaxOptions.contentType = false;
    ajaxOptions.processData = false;
    ajaxOptions.cache = false;
    // ajaxOptions.uploadProgess = (e, position, total, percentComplete) => {
    //   console.log('uploadProgess', e, position, total, percentComplete);
    // };
    // ajaxOptions.complete = (xhr) => {
    //   console.log('complete:', xhr);
    //   // status.html(xhr.responseText);
    // };

    // Custom XMLHttpRequest
    ajaxOptions.xhr = function() {
      var xhr = $.ajaxSettings.xhr();
      if(xhr.upload){ // Check if upload property exists
        xhr.upload.addEventListener('progress', progressHandlingFunction, false); // For handling the progress of the upload
      } else {
        console.error('No upload on xhr');
      }
      return xhr;
    };
  }
  ajaxOptions.data = options.data;

  jqueryAjax(ajaxOptions);

};
