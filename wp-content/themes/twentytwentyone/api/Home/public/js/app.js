/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/array-intersect/dist/array-intersect.module.js":
/*!*********************************************************************!*\
  !*** ./node_modules/array-intersect/dist/array-intersect.module.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var intersect = function intersect(first) {
  for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    rest[_key - 1] = arguments[_key];
  }

  return rest.reduce(function (accum, current) {
    return accum.filter(function (x) {
      return current.indexOf(x) !== -1;
    });
  }, first);
};

/* harmony default export */ __webpack_exports__["default"] = (intersect);


/***/ }),

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || defaults.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "./node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ (function(module) {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ (function(module) {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ (function(module) {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process/browser.js */ "./node_modules/process/browser.js");


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/env/data.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/env/data.js ***!
  \********************************************/
/***/ (function(module) {

module.exports = {
  "version": "0.24.0"
};

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ (function(module) {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ (function(module) {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ (function(module) {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ (function(module) {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ (function(module) {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "./node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/babel-helper-vue-jsx-merge-props/index.js":
/*!****************************************************************!*\
  !*** ./node_modules/babel-helper-vue-jsx-merge-props/index.js ***!
  \****************************************************************/
/***/ (function(module) {

var nestRE = /^(attrs|props|on|nativeOn|class|style|hook)$/

module.exports = function mergeJSXProps (objs) {
  return objs.reduce(function (a, b) {
    var aa, bb, key, nestedKey, temp
    for (key in b) {
      aa = a[key]
      bb = b[key]
      if (aa && nestRE.test(key)) {
        // normalize class
        if (key === 'class') {
          if (typeof aa === 'string') {
            temp = aa
            a[key] = aa = {}
            aa[temp] = true
          }
          if (typeof bb === 'string') {
            temp = bb
            b[key] = bb = {}
            bb[temp] = true
          }
        }
        if (key === 'on' || key === 'nativeOn' || key === 'hook') {
          // merge functions
          for (nestedKey in bb) {
            aa[nestedKey] = mergeFn(aa[nestedKey], bb[nestedKey])
          }
        } else if (Array.isArray(aa)) {
          a[key] = aa.concat(bb)
        } else if (Array.isArray(bb)) {
          a[key] = [aa].concat(bb)
        } else {
          for (nestedKey in bb) {
            aa[nestedKey] = bb[nestedKey]
          }
        }
      } else {
        a[key] = b[key]
      }
    }
    return a
  }, {})
}

function mergeFn (a, b) {
  return function () {
    a && a.apply(this, arguments)
    b && b.apply(this, arguments)
  }
}


/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/App.vue?vue&type=script&lang=js&":
/*!**************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/App.vue?vue&type=script&lang=js& ***!
  \**************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_createContent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/createContent */ "./src/components/createContent.vue");
/* harmony import */ var _components_editContent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/editContent */ "./src/components/editContent.vue");
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["default"] = ({
  name: "App",
  components: {
    CreateContent: _components_createContent__WEBPACK_IMPORTED_MODULE_0__["default"],
    EditContent: _components_editContent__WEBPACK_IMPORTED_MODULE_1__["default"]
  },
  data: function data() {
    return {
      columns: ["id", "page", "type", "content", "position_in_page", "status", "Opciones"],
      headings: {
        id: "id",
        content: "Contenido",
        position_in_page: "Posición en la pagina",
        status: "Estado",
        type: "Tipo de contenido",
        page: "Pagina"
      },
      filterByColumn: false,
      sortable: ["id"],
      data: [],
      data_edit: {}
    };
  },
  mounted: function mounted() {
    this.getContent();
  },
  methods: {
    getContent: function getContent() {
      var _this = this;

      var loader = this.$loading.show();
      axios.get("/admin/home/get-home-content").then(function (res) {
        loader.hide();
        var _res$data = res.data,
            transaction = _res$data.transaction,
            data = _res$data.data;

        if (transaction.status === true) {
          _this.data = data;
        } else {
          _this.$swal({
            icon: "error",
            text: "Ocurrio un problema al momento de obtener los contenidos."
          });
        }
      })["catch"](function (err) {
        loader.hide();
        console.log(err);

        _this.$swal({
          icon: "error",
          text: "Ocurrio un momento al obtener los contenidos."
        });
      });
    },
    openModal: function openModal(id, data) {
      this.data_edit = data;
      $(id).modal('show');
    }
  }
});

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/createContent.vue?vue&type=script&lang=js&":
/*!***********************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/createContent.vue?vue&type=script&lang=js& ***!
  \***********************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["default"] = ({
  name: "createContent",
  data: function data() {
    return {
      content: {
        position: null,
        type: {
          id: 1,
          name: ""
        },
        content: null
      },
      contentTypes: [],
      image_content: null
    };
  },
  mounted: function mounted() {
    this.getTypes();
  },
  methods: {
    getTypes: function getTypes() {
      var _this = this;

      var loader = this.$loading.show();
      axios.get("/admin/general/get-content-types").then(function (res) {
        loader.hide();
        var _res$data = res.data,
            transaction = _res$data.transaction,
            data = _res$data.data;

        if (transaction.status) {
          _this.contentTypes = data;
        } else {
          _this.$swal({
            icon: "error",
            text: "No se pudo obtener los tipos de contenido."
          });
        }
      })["catch"](function (err) {
        console.log(err);

        _this.$swal({
          icon: "error",
          text: "No se pudo obtener los tipos de contenido."
        });
      });
    },
    selectedFile: function selectedFile(e) {
      var _this2 = this;

      var image = e.target.files[0];
      console.log(image);
      this.content.content = image;
      var reader = new FileReader();
      reader.readAsDataURL(image);

      reader.onload = function (event) {
        _this2.image_content = event.target.result;
      };
    },
    setContent: function setContent() {
      var _this3 = this;

      var formData = new FormData();
      formData.append("content", this.content.content);
      formData.append("type", this.content.type.id);
      formData.append("position", this.content.position);
      formData.append("page", 1);
      var loader = this.$loading.show();
      axios.post("admin/home/set-content", formData).then(function (res) {
        loader.hide();
        var _res$data2 = res.data,
            transaction = _res$data2.transaction,
            message = _res$data2.message;

        if (transaction.status === true) {
          _this3.$emit("createContent");

          _this3.$swal({
            icon: "success",
            text: "Se creo exitosamente el contenido"
          });

          $("#createContent").modal("hide");
        } else {
          _this3.$swal({
            icon: "error",
            text: message.content
          });
        }
      })["catch"](function (err) {
        loader.hide();
        console.log(err);

        _this3.$swal({
          icon: "error",
          text: "Ocurrio un problema al momento de crear el contenido."
        });
      });
    }
  }
});

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/editContent.vue?vue&type=script&lang=js&":
/*!*********************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/editContent.vue?vue&type=script&lang=js& ***!
  \*********************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["default"] = ({
  name: "EditContent",
  props: {
    data_edit: {
      required: true
    }
  },
  data: function data() {
    return {
      contentTypes: [],
      content: "",
      image_content: ""
    };
  },
  mounted: function mounted() {
    this.getTypes();
    console.log(this.data_edit);
  },
  methods: {
    getTypes: function getTypes() {
      var _this = this;

      var loader = this.$loading.show();
      axios.get("/admin/general/get-content-types").then(function (res) {
        loader.hide();
        var _res$data = res.data,
            transaction = _res$data.transaction,
            data = _res$data.data;

        if (transaction.status) {
          _this.contentTypes = data;
        } else {
          _this.$swal({
            icon: "error",
            text: "No se pudo obtener los tipos de contenido."
          });
        }
      })["catch"](function (err) {
        console.log(err);

        _this.$swal({
          icon: "error",
          text: "No se pudo obtener los tipos de contenido."
        });
      });
    },
    selectedFile: function selectedFile(e) {
      var _this2 = this;

      var image = e.target.files[0];
      this.data_edit.content = image;
      var reader = new FileReader();
      reader.readAsDataURL(image);

      reader.onload = function (event) {
        _this2.image_content = event.target.result;
      };
    },
    setContent: function setContent() {
      var _this3 = this;

      var formData = new FormData();
      formData.append("content", this.data_edit.content);

      if (this.data_edit.type.id) {
        formData.append("type", this.data_edit.type.id);
      } else {
        formData.append("type", this.data_edit.type);
      }

      formData.append("position", this.data_edit.position_in_page);
      formData.append("page", 1);
      formData.append("id", this.data_edit.id);
      var loader = this.$loading.show();
      axios.post("admin/home/edit-content", formData).then(function (res) {
        loader.hide();
        var _res$data2 = res.data,
            transaction = _res$data2.transaction,
            message = _res$data2.message;

        if (transaction.status === true) {
          _this3.$emit("editContent");

          _this3.$swal({
            icon: "success",
            text: "Se edito exitosamente el contenido"
          });

          $("#editContent").modal("hide");
        } else {
          _this3.$swal({
            icon: "error",
            text: message.content
          });
        }
      })["catch"](function (err) {
        loader.hide();
        console.log(err);

        _this3.$swal({
          icon: "error",
          text: "Ocurrio un problema al momento de crear el contenido."
        });
      });
    }
  }
});

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/sweetalert2/dist/sweetalert2.min.css":
/*!*******************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/sweetalert2/dist/sweetalert2.min.css ***!
  \*******************************************************************************************************************************************************************************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".swal2-popup.swal2-toast{box-sizing:border-box;grid-column:1/4!important;grid-row:1/4!important;grid-template-columns:1fr 99fr 1fr;padding:1em;overflow-y:hidden;background:#fff;box-shadow:0 0 1px rgba(0,0,0,.075),0 1px 2px rgba(0,0,0,.075),1px 2px 4px rgba(0,0,0,.075),1px 3px 8px rgba(0,0,0,.075),2px 4px 16px rgba(0,0,0,.075);pointer-events:all}.swal2-popup.swal2-toast>*{grid-column:2}.swal2-popup.swal2-toast .swal2-title{margin:.5em 1em;padding:0;font-size:1em;text-align:initial}.swal2-popup.swal2-toast .swal2-loading{justify-content:center}.swal2-popup.swal2-toast .swal2-input{height:2em;margin:.5em;font-size:1em}.swal2-popup.swal2-toast .swal2-validation-message{font-size:1em}.swal2-popup.swal2-toast .swal2-footer{margin:.5em 0 0;padding:.5em 0 0;font-size:.8em}.swal2-popup.swal2-toast .swal2-close{grid-column:3/3;grid-row:1/99;align-self:center;width:.8em;height:.8em;margin:0;font-size:2em}.swal2-popup.swal2-toast .swal2-html-container{margin:.5em 1em;padding:0;font-size:1em;text-align:initial}.swal2-popup.swal2-toast .swal2-html-container:empty{padding:0}.swal2-popup.swal2-toast .swal2-loader{grid-column:1;grid-row:1/99;align-self:center;width:2em;height:2em;margin:.25em}.swal2-popup.swal2-toast .swal2-icon{grid-column:1;grid-row:1/99;align-self:center;width:2em;min-width:2em;height:2em;margin:0 .5em 0 0}.swal2-popup.swal2-toast .swal2-icon .swal2-icon-content{display:flex;align-items:center;font-size:1.8em;font-weight:700}.swal2-popup.swal2-toast .swal2-icon.swal2-success .swal2-success-ring{width:2em;height:2em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line]{top:.875em;width:1.375em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=left]{left:.3125em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=right]{right:.3125em}.swal2-popup.swal2-toast .swal2-actions{justify-content:flex-start;height:auto;margin:0;margin-top:.5em;padding:0 .5em}.swal2-popup.swal2-toast .swal2-styled{margin:.25em .5em;padding:.4em .6em;font-size:1em}.swal2-popup.swal2-toast .swal2-success{border-color:#a5dc86}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line]{position:absolute;width:1.6em;height:3em;transform:rotate(45deg);border-radius:50%}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line][class$=left]{top:-.8em;left:-.5em;transform:rotate(-45deg);transform-origin:2em 2em;border-radius:4em 0 0 4em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line][class$=right]{top:-.25em;left:.9375em;transform-origin:0 1.5em;border-radius:0 4em 4em 0}.swal2-popup.swal2-toast .swal2-success .swal2-success-ring{width:2em;height:2em}.swal2-popup.swal2-toast .swal2-success .swal2-success-fix{top:0;left:.4375em;width:.4375em;height:2.6875em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line]{height:.3125em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line][class$=tip]{top:1.125em;left:.1875em;width:.75em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line][class$=long]{top:.9375em;right:.1875em;width:1.375em}.swal2-popup.swal2-toast .swal2-success.swal2-icon-show .swal2-success-line-tip{animation:swal2-toast-animate-success-line-tip .75s}.swal2-popup.swal2-toast .swal2-success.swal2-icon-show .swal2-success-line-long{animation:swal2-toast-animate-success-line-long .75s}.swal2-popup.swal2-toast.swal2-show{animation:swal2-toast-show .5s}.swal2-popup.swal2-toast.swal2-hide{animation:swal2-toast-hide .1s forwards}.swal2-container{display:grid;position:fixed;z-index:1060;top:0;right:0;bottom:0;left:0;box-sizing:border-box;grid-template-areas:\"top-start     top            top-end\" \"center-start  center         center-end\" \"bottom-start  bottom-center  bottom-end\";grid-template-rows:minmax(min-content,auto) minmax(min-content,auto) minmax(min-content,auto);height:100%;padding:.625em;overflow-x:hidden;transition:background-color .1s;-webkit-overflow-scrolling:touch}.swal2-container.swal2-backdrop-show,.swal2-container.swal2-noanimation{background:rgba(0,0,0,.4)}.swal2-container.swal2-backdrop-hide{background:0 0!important}.swal2-container.swal2-bottom-start,.swal2-container.swal2-center-start,.swal2-container.swal2-top-start{grid-template-columns:minmax(0,1fr) auto auto}.swal2-container.swal2-bottom,.swal2-container.swal2-center,.swal2-container.swal2-top{grid-template-columns:auto minmax(0,1fr) auto}.swal2-container.swal2-bottom-end,.swal2-container.swal2-center-end,.swal2-container.swal2-top-end{grid-template-columns:auto auto minmax(0,1fr)}.swal2-container.swal2-top-start>.swal2-popup{align-self:start}.swal2-container.swal2-top>.swal2-popup{grid-column:2;align-self:start;justify-self:center}.swal2-container.swal2-top-end>.swal2-popup,.swal2-container.swal2-top-right>.swal2-popup{grid-column:3;align-self:start;justify-self:end}.swal2-container.swal2-center-left>.swal2-popup,.swal2-container.swal2-center-start>.swal2-popup{grid-row:2;align-self:center}.swal2-container.swal2-center>.swal2-popup{grid-column:2;grid-row:2;align-self:center;justify-self:center}.swal2-container.swal2-center-end>.swal2-popup,.swal2-container.swal2-center-right>.swal2-popup{grid-column:3;grid-row:2;align-self:center;justify-self:end}.swal2-container.swal2-bottom-left>.swal2-popup,.swal2-container.swal2-bottom-start>.swal2-popup{grid-column:1;grid-row:3;align-self:end}.swal2-container.swal2-bottom>.swal2-popup{grid-column:2;grid-row:3;justify-self:center;align-self:end}.swal2-container.swal2-bottom-end>.swal2-popup,.swal2-container.swal2-bottom-right>.swal2-popup{grid-column:3;grid-row:3;align-self:end;justify-self:end}.swal2-container.swal2-grow-fullscreen>.swal2-popup,.swal2-container.swal2-grow-row>.swal2-popup{grid-column:1/4;width:100%}.swal2-container.swal2-grow-column>.swal2-popup,.swal2-container.swal2-grow-fullscreen>.swal2-popup{grid-row:1/4;align-self:stretch}.swal2-container.swal2-no-transition{transition:none!important}.swal2-popup{display:none;position:relative;box-sizing:border-box;grid-template-columns:minmax(0,100%);width:32em;max-width:100%;padding:0 0 1.25em;border:none;border-radius:5px;background:#fff;color:#545454;font-family:inherit;font-size:1rem}.swal2-popup:focus{outline:0}.swal2-popup.swal2-loading{overflow-y:hidden}.swal2-title{position:relative;max-width:100%;margin:0;padding:.8em 1em 0;color:inherit;font-size:1.875em;font-weight:600;text-align:center;text-transform:none;word-wrap:break-word}.swal2-actions{display:flex;z-index:1;box-sizing:border-box;flex-wrap:wrap;align-items:center;justify-content:center;width:auto;margin:1.25em auto 0;padding:0}.swal2-actions:not(.swal2-loading) .swal2-styled[disabled]{opacity:.4}.swal2-actions:not(.swal2-loading) .swal2-styled:hover{background-image:linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1))}.swal2-actions:not(.swal2-loading) .swal2-styled:active{background-image:linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2))}.swal2-loader{display:none;align-items:center;justify-content:center;width:2.2em;height:2.2em;margin:0 1.875em;animation:swal2-rotate-loading 1.5s linear 0s infinite normal;border-width:.25em;border-style:solid;border-radius:100%;border-color:#2778c4 transparent #2778c4 transparent}.swal2-styled{margin:.3125em;padding:.625em 1.1em;transition:box-shadow .1s;box-shadow:0 0 0 3px transparent;font-weight:500}.swal2-styled:not([disabled]){cursor:pointer}.swal2-styled.swal2-confirm{border:0;border-radius:.25em;background:initial;background-color:#7066e0;color:#fff;font-size:1em}.swal2-styled.swal2-confirm:focus{box-shadow:0 0 0 3px rgba(112,102,224,.5)}.swal2-styled.swal2-deny{border:0;border-radius:.25em;background:initial;background-color:#dc3741;color:#fff;font-size:1em}.swal2-styled.swal2-deny:focus{box-shadow:0 0 0 3px rgba(220,55,65,.5)}.swal2-styled.swal2-cancel{border:0;border-radius:.25em;background:initial;background-color:#6e7881;color:#fff;font-size:1em}.swal2-styled.swal2-cancel:focus{box-shadow:0 0 0 3px rgba(110,120,129,.5)}.swal2-styled.swal2-default-outline:focus{box-shadow:0 0 0 3px rgba(100,150,200,.5)}.swal2-styled:focus{outline:0}.swal2-styled::-moz-focus-inner{border:0}.swal2-footer{justify-content:center;margin:1em 0 0;padding:1em 1em 0;border-top:1px solid #eee;color:inherit;font-size:1em}.swal2-timer-progress-bar-container{position:absolute;right:0;bottom:0;left:0;grid-column:auto!important;height:.25em;overflow:hidden;border-bottom-right-radius:5px;border-bottom-left-radius:5px}.swal2-timer-progress-bar{width:100%;height:.25em;background:rgba(0,0,0,.2)}.swal2-image{max-width:100%;margin:2em auto 1em}.swal2-close{z-index:2;align-items:center;justify-content:center;width:1.2em;height:1.2em;margin-top:0;margin-right:0;margin-bottom:-1.2em;padding:0;overflow:hidden;transition:color .1s,box-shadow .1s;border:none;border-radius:5px;background:0 0;color:#ccc;font-family:serif;font-family:monospace;font-size:2.5em;cursor:pointer;justify-self:end}.swal2-close:hover{transform:none;background:0 0;color:#f27474}.swal2-close:focus{outline:0;box-shadow:inset 0 0 0 3px rgba(100,150,200,.5)}.swal2-close::-moz-focus-inner{border:0}.swal2-html-container{z-index:1;justify-content:center;margin:1em 1.6em .3em;padding:0;overflow:auto;color:inherit;font-size:1.125em;font-weight:400;line-height:normal;text-align:center;word-wrap:break-word;word-break:break-word}.swal2-checkbox,.swal2-file,.swal2-input,.swal2-radio,.swal2-select,.swal2-textarea{margin:1em 2em 3px}.swal2-file,.swal2-input,.swal2-textarea{box-sizing:border-box;width:auto;transition:border-color .1s,box-shadow .1s;border:1px solid #d9d9d9;border-radius:.1875em;background:inherit;box-shadow:inset 0 1px 1px rgba(0,0,0,.06),0 0 0 3px transparent;color:inherit;font-size:1.125em}.swal2-file.swal2-inputerror,.swal2-input.swal2-inputerror,.swal2-textarea.swal2-inputerror{border-color:#f27474!important;box-shadow:0 0 2px #f27474!important}.swal2-file:focus,.swal2-input:focus,.swal2-textarea:focus{border:1px solid #b4dbed;outline:0;box-shadow:inset 0 1px 1px rgba(0,0,0,.06),0 0 0 3px rgba(100,150,200,.5)}.swal2-file::placeholder,.swal2-input::placeholder,.swal2-textarea::placeholder{color:#ccc}.swal2-range{margin:1em 2em 3px;background:#fff}.swal2-range input{width:80%}.swal2-range output{width:20%;color:inherit;font-weight:600;text-align:center}.swal2-range input,.swal2-range output{height:2.625em;padding:0;font-size:1.125em;line-height:2.625em}.swal2-input{height:2.625em;padding:0 .75em}.swal2-file{width:75%;margin-right:auto;margin-left:auto;background:inherit;font-size:1.125em}.swal2-textarea{height:6.75em;padding:.75em}.swal2-select{min-width:50%;max-width:100%;padding:.375em .625em;background:inherit;color:inherit;font-size:1.125em}.swal2-checkbox,.swal2-radio{align-items:center;justify-content:center;background:#fff;color:inherit}.swal2-checkbox label,.swal2-radio label{margin:0 .6em;font-size:1.125em}.swal2-checkbox input,.swal2-radio input{flex-shrink:0;margin:0 .4em}.swal2-input-label{display:flex;justify-content:center;margin:1em auto 0}.swal2-validation-message{align-items:center;justify-content:center;margin:1em 0 0;padding:.625em;overflow:hidden;background:#f0f0f0;color:#666;font-size:1em;font-weight:300}.swal2-validation-message::before{content:\"!\";display:inline-block;width:1.5em;min-width:1.5em;height:1.5em;margin:0 .625em;border-radius:50%;background-color:#f27474;color:#fff;font-weight:600;line-height:1.5em;text-align:center}.swal2-icon{position:relative;box-sizing:content-box;justify-content:center;width:5em;height:5em;margin:2.5em auto .6em;border:.25em solid transparent;border-radius:50%;border-color:#000;font-family:inherit;line-height:5em;cursor:default;-webkit-user-select:none;user-select:none}.swal2-icon .swal2-icon-content{display:flex;align-items:center;font-size:3.75em}.swal2-icon.swal2-error{border-color:#f27474;color:#f27474}.swal2-icon.swal2-error .swal2-x-mark{position:relative;flex-grow:1}.swal2-icon.swal2-error [class^=swal2-x-mark-line]{display:block;position:absolute;top:2.3125em;width:2.9375em;height:.3125em;border-radius:.125em;background-color:#f27474}.swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=left]{left:1.0625em;transform:rotate(45deg)}.swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=right]{right:1em;transform:rotate(-45deg)}.swal2-icon.swal2-error.swal2-icon-show{animation:swal2-animate-error-icon .5s}.swal2-icon.swal2-error.swal2-icon-show .swal2-x-mark{animation:swal2-animate-error-x-mark .5s}.swal2-icon.swal2-warning{border-color:#facea8;color:#f8bb86}.swal2-icon.swal2-warning.swal2-icon-show{animation:swal2-animate-error-icon .5s}.swal2-icon.swal2-warning.swal2-icon-show .swal2-icon-content{animation:swal2-animate-i-mark .5s}.swal2-icon.swal2-info{border-color:#9de0f6;color:#3fc3ee}.swal2-icon.swal2-info.swal2-icon-show{animation:swal2-animate-error-icon .5s}.swal2-icon.swal2-info.swal2-icon-show .swal2-icon-content{animation:swal2-animate-i-mark .8s}.swal2-icon.swal2-question{border-color:#c9dae1;color:#87adbd}.swal2-icon.swal2-question.swal2-icon-show{animation:swal2-animate-error-icon .5s}.swal2-icon.swal2-question.swal2-icon-show .swal2-icon-content{animation:swal2-animate-question-mark .8s}.swal2-icon.swal2-success{border-color:#a5dc86;color:#a5dc86}.swal2-icon.swal2-success [class^=swal2-success-circular-line]{position:absolute;width:3.75em;height:7.5em;transform:rotate(45deg);border-radius:50%}.swal2-icon.swal2-success [class^=swal2-success-circular-line][class$=left]{top:-.4375em;left:-2.0635em;transform:rotate(-45deg);transform-origin:3.75em 3.75em;border-radius:7.5em 0 0 7.5em}.swal2-icon.swal2-success [class^=swal2-success-circular-line][class$=right]{top:-.6875em;left:1.875em;transform:rotate(-45deg);transform-origin:0 3.75em;border-radius:0 7.5em 7.5em 0}.swal2-icon.swal2-success .swal2-success-ring{position:absolute;z-index:2;top:-.25em;left:-.25em;box-sizing:content-box;width:100%;height:100%;border:.25em solid rgba(165,220,134,.3);border-radius:50%}.swal2-icon.swal2-success .swal2-success-fix{position:absolute;z-index:1;top:.5em;left:1.625em;width:.4375em;height:5.625em;transform:rotate(-45deg)}.swal2-icon.swal2-success [class^=swal2-success-line]{display:block;position:absolute;z-index:2;height:.3125em;border-radius:.125em;background-color:#a5dc86}.swal2-icon.swal2-success [class^=swal2-success-line][class$=tip]{top:2.875em;left:.8125em;width:1.5625em;transform:rotate(45deg)}.swal2-icon.swal2-success [class^=swal2-success-line][class$=long]{top:2.375em;right:.5em;width:2.9375em;transform:rotate(-45deg)}.swal2-icon.swal2-success.swal2-icon-show .swal2-success-line-tip{animation:swal2-animate-success-line-tip .75s}.swal2-icon.swal2-success.swal2-icon-show .swal2-success-line-long{animation:swal2-animate-success-line-long .75s}.swal2-icon.swal2-success.swal2-icon-show .swal2-success-circular-line-right{animation:swal2-rotate-success-circular-line 4.25s ease-in}.swal2-progress-steps{flex-wrap:wrap;align-items:center;max-width:100%;margin:1.25em auto;padding:0;background:inherit;font-weight:600}.swal2-progress-steps li{display:inline-block;position:relative}.swal2-progress-steps .swal2-progress-step{z-index:20;flex-shrink:0;width:2em;height:2em;border-radius:2em;background:#2778c4;color:#fff;line-height:2em;text-align:center}.swal2-progress-steps .swal2-progress-step.swal2-active-progress-step{background:#2778c4}.swal2-progress-steps .swal2-progress-step.swal2-active-progress-step~.swal2-progress-step{background:#add8e6;color:#fff}.swal2-progress-steps .swal2-progress-step.swal2-active-progress-step~.swal2-progress-step-line{background:#add8e6}.swal2-progress-steps .swal2-progress-step-line{z-index:10;flex-shrink:0;width:2.5em;height:.4em;margin:0 -1px;background:#2778c4}[class^=swal2]{-webkit-tap-highlight-color:transparent}.swal2-show{animation:swal2-show .3s}.swal2-hide{animation:swal2-hide .15s forwards}.swal2-noanimation{transition:none}.swal2-scrollbar-measure{position:absolute;top:-9999px;width:50px;height:50px;overflow:scroll}.swal2-rtl .swal2-close{margin-right:initial;margin-left:0}.swal2-rtl .swal2-timer-progress-bar{right:0;left:auto}@keyframes swal2-toast-show{0%{transform:translateY(-.625em) rotateZ(2deg)}33%{transform:translateY(0) rotateZ(-2deg)}66%{transform:translateY(.3125em) rotateZ(2deg)}100%{transform:translateY(0) rotateZ(0)}}@keyframes swal2-toast-hide{100%{transform:rotateZ(1deg);opacity:0}}@keyframes swal2-toast-animate-success-line-tip{0%{top:.5625em;left:.0625em;width:0}54%{top:.125em;left:.125em;width:0}70%{top:.625em;left:-.25em;width:1.625em}84%{top:1.0625em;left:.75em;width:.5em}100%{top:1.125em;left:.1875em;width:.75em}}@keyframes swal2-toast-animate-success-line-long{0%{top:1.625em;right:1.375em;width:0}65%{top:1.25em;right:.9375em;width:0}84%{top:.9375em;right:0;width:1.125em}100%{top:.9375em;right:.1875em;width:1.375em}}@keyframes swal2-show{0%{transform:scale(.7)}45%{transform:scale(1.05)}80%{transform:scale(.95)}100%{transform:scale(1)}}@keyframes swal2-hide{0%{transform:scale(1);opacity:1}100%{transform:scale(.5);opacity:0}}@keyframes swal2-animate-success-line-tip{0%{top:1.1875em;left:.0625em;width:0}54%{top:1.0625em;left:.125em;width:0}70%{top:2.1875em;left:-.375em;width:3.125em}84%{top:3em;left:1.3125em;width:1.0625em}100%{top:2.8125em;left:.8125em;width:1.5625em}}@keyframes swal2-animate-success-line-long{0%{top:3.375em;right:2.875em;width:0}65%{top:3.375em;right:2.875em;width:0}84%{top:2.1875em;right:0;width:3.4375em}100%{top:2.375em;right:.5em;width:2.9375em}}@keyframes swal2-rotate-success-circular-line{0%{transform:rotate(-45deg)}5%{transform:rotate(-45deg)}12%{transform:rotate(-405deg)}100%{transform:rotate(-405deg)}}@keyframes swal2-animate-error-x-mark{0%{margin-top:1.625em;transform:scale(.4);opacity:0}50%{margin-top:1.625em;transform:scale(.4);opacity:0}80%{margin-top:-.375em;transform:scale(1.15)}100%{margin-top:0;transform:scale(1);opacity:1}}@keyframes swal2-animate-error-icon{0%{transform:rotateX(100deg);opacity:0}100%{transform:rotateX(0);opacity:1}}@keyframes swal2-rotate-loading{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes swal2-animate-question-mark{0%{transform:rotateY(-360deg)}100%{transform:rotateY(0)}}@keyframes swal2-animate-i-mark{0%{transform:rotateZ(45deg);opacity:0}25%{transform:rotateZ(-25deg);opacity:.4}50%{transform:rotateZ(15deg);opacity:.8}75%{transform:rotateZ(-5deg);opacity:1}100%{transform:rotateX(0);opacity:1}}body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown){overflow:hidden}body.swal2-height-auto{height:auto!important}body.swal2-no-backdrop .swal2-container{background-color:transparent!important;pointer-events:none}body.swal2-no-backdrop .swal2-container .swal2-popup{pointer-events:all}body.swal2-no-backdrop .swal2-container .swal2-modal{box-shadow:0 0 10px rgba(0,0,0,.4)}@media print{body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown){overflow-y:scroll!important}body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown)>[aria-hidden=true]{display:none}body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown) .swal2-container{position:static!important}}body.swal2-toast-shown .swal2-container{box-sizing:border-box;width:360px;max-width:100%;background-color:transparent;pointer-events:none}body.swal2-toast-shown .swal2-container.swal2-top{top:0;right:auto;bottom:auto;left:50%;transform:translateX(-50%)}body.swal2-toast-shown .swal2-container.swal2-top-end,body.swal2-toast-shown .swal2-container.swal2-top-right{top:0;right:0;bottom:auto;left:auto}body.swal2-toast-shown .swal2-container.swal2-top-left,body.swal2-toast-shown .swal2-container.swal2-top-start{top:0;right:auto;bottom:auto;left:0}body.swal2-toast-shown .swal2-container.swal2-center-left,body.swal2-toast-shown .swal2-container.swal2-center-start{top:50%;right:auto;bottom:auto;left:0;transform:translateY(-50%)}body.swal2-toast-shown .swal2-container.swal2-center{top:50%;right:auto;bottom:auto;left:50%;transform:translate(-50%,-50%)}body.swal2-toast-shown .swal2-container.swal2-center-end,body.swal2-toast-shown .swal2-container.swal2-center-right{top:50%;right:0;bottom:auto;left:auto;transform:translateY(-50%)}body.swal2-toast-shown .swal2-container.swal2-bottom-left,body.swal2-toast-shown .swal2-container.swal2-bottom-start{top:auto;right:auto;bottom:0;left:0}body.swal2-toast-shown .swal2-container.swal2-bottom{top:auto;right:auto;bottom:0;left:50%;transform:translateX(-50%)}body.swal2-toast-shown .swal2-container.swal2-bottom-end,body.swal2-toast-shown .swal2-container.swal2-bottom-right{top:auto;right:0;bottom:0;left:auto}", ""]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/vue-loading-overlay/dist/vue-loading.css":
/*!***********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/vue-loading-overlay/dist/vue-loading.css ***!
  \***********************************************************************************************************************************************************************************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".vld-shown {\n  overflow: hidden;\n}\n\n.vld-overlay {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  align-items: center;\n  display: none;\n  justify-content: center;\n  overflow: hidden;\n  z-index: 9999;\n}\n\n.vld-overlay.is-active {\n  display: flex;\n}\n\n.vld-overlay.is-full-page {\n  z-index: 9999;\n  position: fixed;\n}\n\n.vld-overlay .vld-background {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  background: #fff;\n  opacity: 0.5;\n}\n\n.vld-overlay .vld-icon, .vld-parent {\n  position: relative;\n}\n\n", ""]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/vue-select/dist/vue-select.css":
/*!*************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/vue-select/dist/vue-select.css ***!
  \*************************************************************************************************************************************************************************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".v-select{position:relative;font-family:inherit}.v-select,.v-select *{box-sizing:border-box}@keyframes vSelectSpinner{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}.vs__fade-enter-active,.vs__fade-leave-active{pointer-events:none;transition:opacity .15s cubic-bezier(1,.5,.8,1)}.vs__fade-enter,.vs__fade-leave-to{opacity:0}.vs--disabled .vs__clear,.vs--disabled .vs__dropdown-toggle,.vs--disabled .vs__open-indicator,.vs--disabled .vs__search,.vs--disabled .vs__selected{cursor:not-allowed;background-color:#f8f8f8}.v-select[dir=rtl] .vs__actions{padding:0 3px 0 6px}.v-select[dir=rtl] .vs__clear{margin-left:6px;margin-right:0}.v-select[dir=rtl] .vs__deselect{margin-left:0;margin-right:2px}.v-select[dir=rtl] .vs__dropdown-menu{text-align:right}.vs__dropdown-toggle{-webkit-appearance:none;appearance:none;display:flex;padding:0 0 4px;background:none;border:1px solid rgba(60,60,60,.26);border-radius:4px;white-space:normal}.vs__selected-options{display:flex;flex-basis:100%;flex-grow:1;flex-wrap:wrap;padding:0 2px;position:relative}.vs__actions{display:flex;align-items:center;padding:4px 6px 0 3px}.vs--searchable .vs__dropdown-toggle{cursor:text}.vs--unsearchable .vs__dropdown-toggle{cursor:pointer}.vs--open .vs__dropdown-toggle{border-bottom-color:transparent;border-bottom-left-radius:0;border-bottom-right-radius:0}.vs__open-indicator{fill:rgba(60,60,60,.5);transform:scale(1);transition:transform .15s cubic-bezier(1,-.115,.975,.855);transition-timing-function:cubic-bezier(1,-.115,.975,.855)}.vs--open .vs__open-indicator{transform:rotate(180deg) scale(1)}.vs--loading .vs__open-indicator{opacity:0}.vs__clear{fill:rgba(60,60,60,.5);padding:0;border:0;background-color:transparent;cursor:pointer;margin-right:8px}.vs__dropdown-menu{display:block;box-sizing:border-box;position:absolute;top:calc(100% - 1px);left:0;z-index:1000;padding:5px 0;margin:0;width:100%;max-height:350px;min-width:160px;overflow-y:auto;box-shadow:0 3px 6px 0 rgba(0,0,0,.15);border:1px solid rgba(60,60,60,.26);border-top-style:none;border-radius:0 0 4px 4px;text-align:left;list-style:none;background:#fff}.vs__no-options{text-align:center}.vs__dropdown-option{line-height:1.42857143;display:block;padding:3px 20px;clear:both;color:#333;white-space:nowrap;cursor:pointer}.vs__dropdown-option--highlight{background:#5897fb;color:#fff}.vs__dropdown-option--deselect{background:#fb5858;color:#fff}.vs__dropdown-option--disabled{background:inherit;color:rgba(60,60,60,.5);cursor:inherit}.vs__selected{display:flex;align-items:center;background-color:#f0f0f0;border:1px solid rgba(60,60,60,.26);border-radius:4px;color:#333;line-height:1.4;margin:4px 2px 0;padding:0 .25em;z-index:0}.vs__deselect{display:inline-flex;-webkit-appearance:none;appearance:none;margin-left:4px;padding:0;border:0;cursor:pointer;background:none;fill:rgba(60,60,60,.5);text-shadow:0 1px 0 #fff}.vs--single .vs__selected{background-color:transparent;border-color:transparent}.vs--single.vs--loading .vs__selected,.vs--single.vs--open .vs__selected{position:absolute;opacity:.4}.vs--single.vs--searching .vs__selected{display:none}.vs__search::-webkit-search-cancel-button{display:none}.vs__search::-ms-clear,.vs__search::-webkit-search-decoration,.vs__search::-webkit-search-results-button,.vs__search::-webkit-search-results-decoration{display:none}.vs__search,.vs__search:focus{-webkit-appearance:none;appearance:none;line-height:1.4;font-size:1em;border:1px solid transparent;border-left:none;outline:none;margin:4px 0 0;padding:0 7px;background:none;box-shadow:none;width:0;max-width:100%;flex-grow:1;z-index:1}.vs__search::placeholder{color:inherit}.vs--unsearchable .vs__search{opacity:1}.vs--unsearchable:not(.vs--disabled) .vs__search{cursor:pointer}.vs--single.vs--searching:not(.vs--open):not(.vs--loading) .vs__search{opacity:.2}.vs__spinner{align-self:center;opacity:0;font-size:5px;text-indent:-9999em;overflow:hidden;border:.9em solid hsla(0,0%,39.2%,.1);border-left-color:rgba(60,60,60,.45);transform:translateZ(0);animation:vSelectSpinner 1.1s linear infinite;transition:opacity .1s}.vs__spinner,.vs__spinner:after{border-radius:50%;width:5em;height:5em}.vs--loading .vs__spinner{opacity:1}", ""]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./src/assets/css/style.css":
/*!******************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./src/assets/css/style.css ***!
  \******************************************************************************************************************************************************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, "input::-webkit-outer-spin-button,\r\ninput::-webkit-inner-spin-button {\r\n    -webkit-appearance: none;\r\n    margin: 0;\r\n}\r\n\r\ninput[type=number] {\r\n    -moz-appearance: textfield;\r\n}\r\n\r\ninput[type=search] {\r\n    border: none;\r\n}\r\n\r\ninput[type=search]:focus {\r\n    border: none !important;\r\n    box-shadow: none !important;\r\n}\r\n\r\n.form-control {\r\n    height: 42px !important;\r\n}", ""]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/App.vue?vue&type=style&index=0&lang=css&":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/App.vue?vue&type=style&index=0&lang=css& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, "\n.textStatus {\r\n  color: #ffffff;\r\n  font-weight: 600;\r\n  padding: 5px 10px;\r\n  border-radius: 20px;\n}\r\n", ""]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ (function(module) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join("");
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === "string") {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, ""]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/debounce/index.js":
/*!****************************************!*\
  !*** ./node_modules/debounce/index.js ***!
  \****************************************/
/***/ (function(module) {

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear' 
 * that is a function which will clear the timer to prevent previously scheduled executions. 
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */
function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  };

  var debounced = function(){
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };

  debounced.clear = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  debounced.flush = function() {
    if (timeout) {
      result = func.apply(context, args);
      context = args = null;
      
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

// Adds compatibility for ES modules
debounce.debounce = debounce;

module.exports = debounce;


/***/ }),

/***/ "./node_modules/lodash.clonedeep/index.js":
/*!************************************************!*\
  !*** ./node_modules/lodash.clonedeep/index.js ***!
  \************************************************/
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {boolean} [isFull] Specify a clone including symbols.
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      if (isHostObject(value)) {
        return object ? value : {};
      }
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (!isArr) {
    var props = isFull ? getAllKeys(value) : keys(value);
  }
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
  });
  return result;
}

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(proto) {
  return isObject(proto) ? objectCreate(proto) : {};
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var result = new buffer.constructor(buffer.length);
  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
  return arrayReduce(array, addMapEntry, new map.constructor);
}

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
  return arrayReduce(array, addSetEntry, new set.constructor);
}

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Copies own symbol properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return cloneSymbol(object);
  }
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, true, true);
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = cloneDeep;


/***/ }),

/***/ "./node_modules/merge/lib/src/index.js":
/*!*********************************************!*\
  !*** ./node_modules/merge/lib/src/index.js ***!
  \*********************************************/
/***/ (function(module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isPlainObject = exports.clone = exports.recursive = exports.merge = exports.main = void 0;
module.exports = exports = main;
exports["default"] = main;
function main() {
    var items = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        items[_i] = arguments[_i];
    }
    return merge.apply(void 0, items);
}
exports.main = main;
main.clone = clone;
main.isPlainObject = isPlainObject;
main.recursive = recursive;
function merge() {
    var items = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        items[_i] = arguments[_i];
    }
    return _merge(items[0] === true, false, items);
}
exports.merge = merge;
function recursive() {
    var items = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        items[_i] = arguments[_i];
    }
    return _merge(items[0] === true, true, items);
}
exports.recursive = recursive;
function clone(input) {
    if (Array.isArray(input)) {
        var output = [];
        for (var index = 0; index < input.length; ++index)
            output.push(clone(input[index]));
        return output;
    }
    else if (isPlainObject(input)) {
        var output = {};
        for (var index in input)
            output[index] = clone(input[index]);
        return output;
    }
    else {
        return input;
    }
}
exports.clone = clone;
function isPlainObject(input) {
    return input && typeof input === 'object' && !Array.isArray(input);
}
exports.isPlainObject = isPlainObject;
function _recursiveMerge(base, extend) {
    if (!isPlainObject(base))
        return extend;
    for (var key in extend) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype')
            continue;
        base[key] = (isPlainObject(base[key]) && isPlainObject(extend[key])) ?
            _recursiveMerge(base[key], extend[key]) :
            extend[key];
    }
    return base;
}
function _merge(isClone, isRecursive, items) {
    var result;
    if (isClone || !isPlainObject(result = items.shift()))
        result = {};
    for (var index = 0; index < items.length; ++index) {
        var item = items[index];
        if (!isPlainObject(item))
            continue;
        for (var key in item) {
            if (key === '__proto__' || key === 'constructor' || key === 'prototype')
                continue;
            var value = isClone ? clone(item[key]) : item[key];
            result[key] = isRecursive ? _recursiveMerge(result[key], value) : value;
        }
    }
    return result;
}


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/***/ (function(module) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/sweetalert2/dist/sweetalert2.min.css":
/*!***********************************************************!*\
  !*** ./node_modules/sweetalert2/dist/sweetalert2.min.css ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_sweetalert2_min_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!../../postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./sweetalert2.min.css */ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/sweetalert2/dist/sweetalert2.min.css");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_sweetalert2_min_css__WEBPACK_IMPORTED_MODULE_1__["default"], options);



/* harmony default export */ __webpack_exports__["default"] = (_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_sweetalert2_min_css__WEBPACK_IMPORTED_MODULE_1__["default"].locals || {});

/***/ }),

/***/ "./node_modules/vue-loading-overlay/dist/vue-loading.css":
/*!***************************************************************!*\
  !*** ./node_modules/vue-loading-overlay/dist/vue-loading.css ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_vue_loading_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!../../postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./vue-loading.css */ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/vue-loading-overlay/dist/vue-loading.css");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_vue_loading_css__WEBPACK_IMPORTED_MODULE_1__["default"], options);



/* harmony default export */ __webpack_exports__["default"] = (_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_vue_loading_css__WEBPACK_IMPORTED_MODULE_1__["default"].locals || {});

/***/ }),

/***/ "./node_modules/vue-select/dist/vue-select.css":
/*!*****************************************************!*\
  !*** ./node_modules/vue-select/dist/vue-select.css ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_vue_select_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!../../postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./vue-select.css */ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/vue-select/dist/vue-select.css");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_vue_select_css__WEBPACK_IMPORTED_MODULE_1__["default"], options);



/* harmony default export */ __webpack_exports__["default"] = (_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_vue_select_css__WEBPACK_IMPORTED_MODULE_1__["default"].locals || {});

/***/ }),

/***/ "./src/assets/css/style.css":
/*!**********************************!*\
  !*** ./src/assets/css/style.css ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_style_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!../../../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./style.css */ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./src/assets/css/style.css");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_style_css__WEBPACK_IMPORTED_MODULE_1__["default"], options);



/* harmony default export */ __webpack_exports__["default"] = (_node_modules_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_style_css__WEBPACK_IMPORTED_MODULE_1__["default"].locals || {});

/***/ }),

/***/ "./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/App.vue?vue&type=style&index=0&lang=css&":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/App.vue?vue&type=style&index=0&lang=css& ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!../node_modules/vue-loader/lib/index.js??vue-loader-options!./App.vue?vue&type=style&index=0&lang=css& */ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/App.vue?vue&type=style&index=0&lang=css&");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_1__["default"], options);



/* harmony default export */ __webpack_exports__["default"] = (_node_modules_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_1__["default"].locals || {});

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./src/App.vue":
/*!*********************!*\
  !*** ./src/App.vue ***!
  \*********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _App_vue_vue_type_template_id_7ba5bd90___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App.vue?vue&type=template&id=7ba5bd90& */ "./src/App.vue?vue&type=template&id=7ba5bd90&");
/* harmony import */ var _App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./App.vue?vue&type=script&lang=js& */ "./src/App.vue?vue&type=script&lang=js&");
/* harmony import */ var _App_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./App.vue?vue&type=style&index=0&lang=css& */ "./src/App.vue?vue&type=style&index=0&lang=css&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");



;


/* normalize component */

var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _App_vue_vue_type_template_id_7ba5bd90___WEBPACK_IMPORTED_MODULE_0__.render,
  _App_vue_vue_type_template_id_7ba5bd90___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/App.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./src/components/createContent.vue":
/*!******************************************!*\
  !*** ./src/components/createContent.vue ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _createContent_vue_vue_type_template_id_691a3506___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createContent.vue?vue&type=template&id=691a3506& */ "./src/components/createContent.vue?vue&type=template&id=691a3506&");
/* harmony import */ var _createContent_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./createContent.vue?vue&type=script&lang=js& */ "./src/components/createContent.vue?vue&type=script&lang=js&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
  _createContent_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _createContent_vue_vue_type_template_id_691a3506___WEBPACK_IMPORTED_MODULE_0__.render,
  _createContent_vue_vue_type_template_id_691a3506___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/components/createContent.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./src/components/editContent.vue":
/*!****************************************!*\
  !*** ./src/components/editContent.vue ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _editContent_vue_vue_type_template_id_7854c5af___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./editContent.vue?vue&type=template&id=7854c5af& */ "./src/components/editContent.vue?vue&type=template&id=7854c5af&");
/* harmony import */ var _editContent_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./editContent.vue?vue&type=script&lang=js& */ "./src/components/editContent.vue?vue&type=script&lang=js&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
  _editContent_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _editContent_vue_vue_type_template_id_7854c5af___WEBPACK_IMPORTED_MODULE_0__.render,
  _editContent_vue_vue_type_template_id_7854c5af___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/components/editContent.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./src/App.vue?vue&type=script&lang=js&":
/*!**********************************************!*\
  !*** ./src/App.vue?vue&type=script&lang=js& ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_clonedRuleSet_5_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!../node_modules/vue-loader/lib/index.js??vue-loader-options!./App.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/App.vue?vue&type=script&lang=js&");
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_babel_loader_lib_index_js_clonedRuleSet_5_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./src/components/createContent.vue?vue&type=script&lang=js&":
/*!*******************************************************************!*\
  !*** ./src/components/createContent.vue?vue&type=script&lang=js& ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_clonedRuleSet_5_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_createContent_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./createContent.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/createContent.vue?vue&type=script&lang=js&");
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_babel_loader_lib_index_js_clonedRuleSet_5_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_createContent_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./src/components/editContent.vue?vue&type=script&lang=js&":
/*!*****************************************************************!*\
  !*** ./src/components/editContent.vue?vue&type=script&lang=js& ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_clonedRuleSet_5_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_editContent_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./editContent.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/editContent.vue?vue&type=script&lang=js&");
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_babel_loader_lib_index_js_clonedRuleSet_5_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_editContent_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./src/App.vue?vue&type=style&index=0&lang=css&":
/*!******************************************************!*\
  !*** ./src/App.vue?vue&type=style&index=0&lang=css& ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_style_loader_dist_cjs_js_node_modules_css_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_8_0_rules_0_use_2_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../node_modules/style-loader/dist/cjs.js!../node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!../node_modules/vue-loader/lib/index.js??vue-loader-options!./App.vue?vue&type=style&index=0&lang=css& */ "./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-8[0].rules[0].use[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/App.vue?vue&type=style&index=0&lang=css&");


/***/ }),

/***/ "./src/App.vue?vue&type=template&id=7ba5bd90&":
/*!****************************************************!*\
  !*** ./src/App.vue?vue&type=template&id=7ba5bd90& ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_template_id_7ba5bd90___WEBPACK_IMPORTED_MODULE_0__.render; },
/* harmony export */   "staticRenderFns": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_template_id_7ba5bd90___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns; }
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_template_id_7ba5bd90___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../node_modules/vue-loader/lib/index.js??vue-loader-options!./App.vue?vue&type=template&id=7ba5bd90& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/App.vue?vue&type=template&id=7ba5bd90&");


/***/ }),

/***/ "./src/components/createContent.vue?vue&type=template&id=691a3506&":
/*!*************************************************************************!*\
  !*** ./src/components/createContent.vue?vue&type=template&id=691a3506& ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_createContent_vue_vue_type_template_id_691a3506___WEBPACK_IMPORTED_MODULE_0__.render; },
/* harmony export */   "staticRenderFns": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_createContent_vue_vue_type_template_id_691a3506___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns; }
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_createContent_vue_vue_type_template_id_691a3506___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./createContent.vue?vue&type=template&id=691a3506& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/createContent.vue?vue&type=template&id=691a3506&");


/***/ }),

/***/ "./src/components/editContent.vue?vue&type=template&id=7854c5af&":
/*!***********************************************************************!*\
  !*** ./src/components/editContent.vue?vue&type=template&id=7854c5af& ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_editContent_vue_vue_type_template_id_7854c5af___WEBPACK_IMPORTED_MODULE_0__.render; },
/* harmony export */   "staticRenderFns": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_editContent_vue_vue_type_template_id_7854c5af___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns; }
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_editContent_vue_vue_type_template_id_7854c5af___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./editContent.vue?vue&type=template&id=7854c5af& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/editContent.vue?vue&type=template&id=7854c5af&");


/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/App.vue?vue&type=template&id=7ba5bd90&":
/*!*******************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/App.vue?vue&type=template&id=7ba5bd90& ***!
  \*******************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": function() { return /* binding */ render; },
/* harmony export */   "staticRenderFns": function() { return /* binding */ staticRenderFns; }
/* harmony export */ });
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "col-lg-12" }, [
    _c("div", { staticClass: "container" }, [
      _c("div", { staticClass: "card mw-100" }, [
        _c(
          "div",
          { staticClass: "card-body" },
          [
            _vm._m(0),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "col-md-12" },
              [
                _c("v-client-table", {
                  staticClass: "table-striped",
                  attrs: {
                    columns: _vm.columns,
                    data: _vm.data,
                    options: {
                      headings: _vm.headings,
                      sortable: _vm.sortable,
                      filterByColumn: _vm.filterByColumn,
                    },
                  },
                  scopedSlots: _vm._u(
                    [
                      {
                        key: "content",
                        fn: function (props) {
                          return _vm._t("default", function () {
                            return [
                              props.row.type !== "Image"
                                ? _c("span", [
                                    _vm._v(_vm._s(props.row.content)),
                                  ])
                                : _c("img", {
                                    attrs: {
                                      src: props.row.content,
                                      alt: "Image Content",
                                      width: "120",
                                    },
                                  }),
                            ]
                          })
                        },
                      },
                      {
                        key: "status",
                        fn: function (props) {
                          return _vm._t("default", function () {
                            return [
                              _c(
                                "span",
                                {
                                  staticClass: "textStatus",
                                  style: {
                                    backgroundColor: props.row.color_status,
                                  },
                                },
                                [_vm._v(_vm._s(props.row.status))]
                              ),
                            ]
                          })
                        },
                      },
                      {
                        key: "Opciones",
                        fn: function (props) {
                          return _vm._t("default", function () {
                            return [
                              _c(
                                "button",
                                {
                                  staticClass: "btn btn-outline-primary",
                                  attrs: { type: "button" },
                                  on: {
                                    click: function ($event) {
                                      return _vm.openModal(
                                        "#editContent",
                                        props.row
                                      )
                                    },
                                  },
                                },
                                [_vm._v("Editar")]
                              ),
                              _vm._v(" "),
                              _c(
                                "button",
                                {
                                  staticClass: "btn btn-outline-danger",
                                  attrs: { type: "button" },
                                },
                                [_vm._v("Eliminar")]
                              ),
                            ]
                          })
                        },
                      },
                    ],
                    null,
                    true
                  ),
                }),
              ],
              1
            ),
            _vm._v(" "),
            _c("CreateContent", { on: { createContent: _vm.getContent } }),
            _vm._v(" "),
            _c("EditContent", {
              attrs: { data_edit: _vm.data_edit },
              on: { editContent: _vm.getContent },
            }),
          ],
          1
        ),
      ]),
    ]),
  ])
}
var staticRenderFns = [
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "col-md-12" }, [
      _c(
        "button",
        {
          staticClass: "btn btn-primary",
          attrs: {
            type: "button",
            "data-toggle": "modal",
            "data-target": "#createContent",
          },
        },
        [_vm._v("Crear contenido\n          ")]
      ),
    ])
  },
]
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/createContent.vue?vue&type=template&id=691a3506&":
/*!****************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/createContent.vue?vue&type=template&id=691a3506& ***!
  \****************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": function() { return /* binding */ render; },
/* harmony export */   "staticRenderFns": function() { return /* binding */ staticRenderFns; }
/* harmony export */ });
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "modal fade",
      attrs: {
        id: "createContent",
        tabindex: "-1",
        "aria-labelledby": "exampleModalLabel",
        "aria-hidden": "true",
      },
    },
    [
      _c(
        "div",
        { staticClass: "modal-dialog modal-dialog-centered modal-md" },
        [
          _c("div", { staticClass: "modal-content" }, [
            _vm._m(0),
            _vm._v(" "),
            _c("div", { staticClass: "modal-body" }, [
              _c("div", { staticClass: "container" }, [
                _c("form", { staticClass: "row" }, [
                  _c("div", { staticClass: "col-md-6" }, [
                    _vm._m(1),
                    _vm._v(" "),
                    _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.content.position,
                          expression: "content.position",
                        },
                      ],
                      staticClass: "form-control input-number",
                      attrs: { type: "number" },
                      domProps: { value: _vm.content.position },
                      on: {
                        input: function ($event) {
                          if ($event.target.composing) {
                            return
                          }
                          _vm.$set(_vm.content, "position", $event.target.value)
                        },
                      },
                    }),
                  ]),
                  _vm._v(" "),
                  _c(
                    "div",
                    { staticClass: "col-md-6" },
                    [
                      _vm._m(2),
                      _vm._v(" "),
                      _c("v-select", {
                        attrs: { options: _vm.contentTypes, label: "name" },
                        model: {
                          value: _vm.content.type,
                          callback: function ($$v) {
                            _vm.$set(_vm.content, "type", $$v)
                          },
                          expression: "content.type",
                        },
                      }),
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c("div", { staticClass: "col-md-12" }, [
                    _vm._m(3),
                    _vm._v(" "),
                    _vm.content.type.id == 1
                      ? _c("textarea", {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.content.content,
                              expression: "content.content",
                            },
                          ],
                          staticClass: "form-control",
                          domProps: { value: _vm.content.content },
                          on: {
                            input: function ($event) {
                              if ($event.target.composing) {
                                return
                              }
                              _vm.$set(
                                _vm.content,
                                "content",
                                $event.target.value
                              )
                            },
                          },
                        })
                      : _c("div", { staticClass: "col-md-12" }, [
                          _c("div", { staticClass: "col-md-12" }, [
                            _c(
                              "label",
                              {
                                staticClass: "btn btn-info",
                                attrs: { for: "image" },
                              },
                              [
                                _vm._v(
                                  "\n                    Seleccionar imagen\n                  "
                                ),
                              ]
                            ),
                            _vm._v(" "),
                            _c("input", {
                              staticStyle: { display: "none" },
                              attrs: { type: "file", id: "image" },
                              on: {
                                change: function ($event) {
                                  $event.preventDefault()
                                  return _vm.selectedFile.apply(null, arguments)
                                },
                              },
                            }),
                          ]),
                          _vm._v(" "),
                          _c("div", { staticClass: "col-md-12" }, [
                            _vm.image_content
                              ? _c("img", {
                                  attrs: {
                                    src: _vm.image_content,
                                    alt: "Image Content",
                                    width: "150",
                                  },
                                })
                              : _vm._e(),
                          ]),
                        ]),
                  ]),
                ]),
              ]),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "modal-footer" }, [
              _c(
                "button",
                {
                  staticClass: "btn btn-secondary",
                  attrs: { type: "button", "data-dismiss": "modal" },
                },
                [_vm._v("Close")]
              ),
              _vm._v(" "),
              _c(
                "button",
                {
                  staticClass: "btn btn-primary",
                  attrs: { type: "button" },
                  on: {
                    click: function ($event) {
                      $event.preventDefault()
                      return _vm.setContent.apply(null, arguments)
                    },
                  },
                },
                [_vm._v("Guardar")]
              ),
            ]),
          ]),
        ]
      ),
    ]
  )
}
var staticRenderFns = [
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "modal-header" }, [
      _c(
        "h5",
        { staticClass: "modal-title", attrs: { id: "exampleModalLabel" } },
        [_vm._v("Crear contenido para la pagina home")]
      ),
      _vm._v(" "),
      _c(
        "button",
        {
          staticClass: "close",
          attrs: {
            type: "button",
            "data-dismiss": "modal",
            "aria-label": "Close",
          },
        },
        [_c("span", { attrs: { "aria-hidden": "true" } }, [_vm._v("×")])]
      ),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", [_c("b", [_vm._v("Posición")])])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "text-sm-left" }, [
      _c("b", [_vm._v("Tipo de contenido")]),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", [_c("b", [_vm._v("Contenido")])])
  },
]
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/editContent.vue?vue&type=template&id=7854c5af&":
/*!**************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/editContent.vue?vue&type=template&id=7854c5af& ***!
  \**************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": function() { return /* binding */ render; },
/* harmony export */   "staticRenderFns": function() { return /* binding */ staticRenderFns; }
/* harmony export */ });
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "modal fade",
      attrs: {
        id: "editContent",
        tabindex: "-1",
        "aria-labelledby": "exampleModalLabel",
        "aria-hidden": "true",
      },
    },
    [
      _c(
        "div",
        { staticClass: "modal-dialog modal-dialog-centered modal-md" },
        [
          _c("div", { staticClass: "modal-content" }, [
            _vm._m(0),
            _vm._v(" "),
            _c("div", { staticClass: "modal-body" }, [
              _c("div", { staticClass: "container" }, [
                _c("form", { staticClass: "row" }, [
                  _c("div", { staticClass: "col-md-6" }, [
                    _vm._m(1),
                    _vm._v(" "),
                    _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.data_edit.position_in_page,
                          expression: "data_edit.position_in_page",
                        },
                      ],
                      staticClass: "form-control input-number",
                      attrs: { type: "number" },
                      domProps: { value: _vm.data_edit.position_in_page },
                      on: {
                        input: function ($event) {
                          if ($event.target.composing) {
                            return
                          }
                          _vm.$set(
                            _vm.data_edit,
                            "position_in_page",
                            $event.target.value
                          )
                        },
                      },
                    }),
                  ]),
                  _vm._v(" "),
                  _c(
                    "div",
                    { staticClass: "col-md-6" },
                    [
                      _vm._m(2),
                      _vm._v(" "),
                      _c("v-select", {
                        attrs: { options: _vm.contentTypes, label: "name" },
                        model: {
                          value: _vm.data_edit.type,
                          callback: function ($$v) {
                            _vm.$set(_vm.data_edit, "type", $$v)
                          },
                          expression: "data_edit.type",
                        },
                      }),
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c("div", { staticClass: "col-md-12" }, [
                    _vm._m(3),
                    _vm._v(" "),
                    (
                      _vm.data_edit.type && _vm.data_edit.type.id
                        ? _vm.data_edit.type.id == "1"
                        : _vm.data_edit.type == "Text"
                    )
                      ? _c("textarea", {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.data_edit.content,
                              expression: "data_edit.content",
                            },
                          ],
                          staticClass: "form-control",
                          domProps: { value: _vm.data_edit.content },
                          on: {
                            input: function ($event) {
                              if ($event.target.composing) {
                                return
                              }
                              _vm.$set(
                                _vm.data_edit,
                                "content",
                                $event.target.value
                              )
                            },
                          },
                        })
                      : _c("div", { staticClass: "col-md-12" }, [
                          _c("div", { staticClass: "col-md-12" }, [
                            _c(
                              "label",
                              {
                                staticClass: "btn btn-info",
                                attrs: { for: "image" },
                              },
                              [
                                _vm._v(
                                  "\n                    Seleccionar imagen\n                  "
                                ),
                              ]
                            ),
                            _vm._v(" "),
                            _c("input", {
                              staticStyle: { display: "none" },
                              attrs: { type: "file", id: "image" },
                              on: {
                                change: function ($event) {
                                  $event.preventDefault()
                                  return _vm.selectedFile.apply(null, arguments)
                                },
                              },
                            }),
                          ]),
                          _vm._v(" "),
                          _c("div", { staticClass: "col-md-12" }, [
                            _vm.image_content != ""
                              ? _c("img", {
                                  attrs: {
                                    src: _vm.image_content,
                                    alt: "Image Content",
                                    width: "150",
                                  },
                                })
                              : _c("img", {
                                  attrs: {
                                    src: _vm.data_edit.content,
                                    alt: "Image Content",
                                    width: "150",
                                  },
                                }),
                          ]),
                        ]),
                  ]),
                ]),
              ]),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "modal-footer" }, [
              _c(
                "button",
                {
                  staticClass: "btn btn-secondary",
                  attrs: { type: "button", "data-dismiss": "modal" },
                },
                [_vm._v("Close")]
              ),
              _vm._v(" "),
              _c(
                "button",
                {
                  staticClass: "btn btn-primary",
                  attrs: { type: "button" },
                  on: {
                    click: function ($event) {
                      $event.preventDefault()
                      return _vm.setContent.apply(null, arguments)
                    },
                  },
                },
                [_vm._v("Guardar")]
              ),
            ]),
          ]),
        ]
      ),
    ]
  )
}
var staticRenderFns = [
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "modal-header" }, [
      _c(
        "h5",
        { staticClass: "modal-title", attrs: { id: "exampleModalLabel" } },
        [_vm._v("Editar Contenido")]
      ),
      _vm._v(" "),
      _c(
        "button",
        {
          staticClass: "close",
          attrs: {
            type: "button",
            "data-dismiss": "modal",
            "aria-label": "Close",
          },
        },
        [_c("span", { attrs: { "aria-hidden": "true" } }, [_vm._v("×")])]
      ),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", [_c("b", [_vm._v("Posición")])])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "text-sm-left" }, [
      _c("b", [_vm._v("Tipo de contenido")]),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", [_c("b", [_vm._v("Contenido")])])
  },
]
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-loader/lib/runtime/componentNormalizer.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ normalizeComponent; }
/* harmony export */ });
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
        injectStyles.call(
          this,
          (options.functional ? this.parent : this).$root.$options.shadowRoot
        )
      }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}


/***/ }),

/***/ "./node_modules/vue-loading-overlay/dist/vue-loading.min.js":
/*!******************************************************************!*\
  !*** ./node_modules/vue-loading-overlay/dist/vue-loading.min.js ***!
  \******************************************************************/
/***/ (function(module) {

!function(t,e){ true?module.exports=e():0}("undefined"!=typeof self?self:this,(function(){return function(t){var e={};function i(n){if(e[n])return e[n].exports;var r=e[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,i),r.l=!0,r.exports}return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)i.d(n,r,function(e){return t[e]}.bind(null,r));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=1)}([function(t,e,i){},function(t,e,i){"use strict";i.r(e);var n="undefined"!=typeof window?window.HTMLElement:Object,r={mounted:function(){this.enforceFocus&&document.addEventListener("focusin",this.focusIn)},methods:{focusIn:function(t){if(this.isActive&&t.target!==this.$el&&!this.$el.contains(t.target)){var e=this.container?this.container:this.isFullPage?null:this.$el.parentElement;(this.isFullPage||e&&e.contains(t.target))&&(t.preventDefault(),this.$el.focus())}}},beforeDestroy:function(){document.removeEventListener("focusin",this.focusIn)}};function a(t,e,i,n,r,a,o,s){var l,u="function"==typeof t?t.options:t;if(e&&(u.render=e,u.staticRenderFns=i,u._compiled=!0),n&&(u.functional=!0),a&&(u._scopeId="data-v-"+a),o?(l=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),r&&r.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(o)},u._ssrRegister=l):r&&(l=s?function(){r.call(this,(u.functional?this.parent:this).$root.$options.shadowRoot)}:r),l)if(u.functional){u._injectStyles=l;var c=u.render;u.render=function(t,e){return l.call(e),c(t,e)}}else{var d=u.beforeCreate;u.beforeCreate=d?[].concat(d,l):[l]}return{exports:t,options:u}}var o=a({name:"spinner",props:{color:{type:String,default:"#000"},height:{type:Number,default:64},width:{type:Number,default:64}}},(function(){var t=this.$createElement,e=this._self._c||t;return e("svg",{attrs:{viewBox:"0 0 38 38",xmlns:"http://www.w3.org/2000/svg",width:this.width,height:this.height,stroke:this.color}},[e("g",{attrs:{fill:"none","fill-rule":"evenodd"}},[e("g",{attrs:{transform:"translate(1 1)","stroke-width":"2"}},[e("circle",{attrs:{"stroke-opacity":".25",cx:"18",cy:"18",r:"18"}}),e("path",{attrs:{d:"M36 18c0-9.94-8.06-18-18-18"}},[e("animateTransform",{attrs:{attributeName:"transform",type:"rotate",from:"0 18 18",to:"360 18 18",dur:"0.8s",repeatCount:"indefinite"}})],1)])])])}),[],!1,null,null,null).exports,s=a({name:"dots",props:{color:{type:String,default:"#000"},height:{type:Number,default:240},width:{type:Number,default:60}}},(function(){var t=this.$createElement,e=this._self._c||t;return e("svg",{attrs:{viewBox:"0 0 120 30",xmlns:"http://www.w3.org/2000/svg",fill:this.color,width:this.width,height:this.height}},[e("circle",{attrs:{cx:"15",cy:"15",r:"15"}},[e("animate",{attrs:{attributeName:"r",from:"15",to:"15",begin:"0s",dur:"0.8s",values:"15;9;15",calcMode:"linear",repeatCount:"indefinite"}}),e("animate",{attrs:{attributeName:"fill-opacity",from:"1",to:"1",begin:"0s",dur:"0.8s",values:"1;.5;1",calcMode:"linear",repeatCount:"indefinite"}})]),e("circle",{attrs:{cx:"60",cy:"15",r:"9","fill-opacity":"0.3"}},[e("animate",{attrs:{attributeName:"r",from:"9",to:"9",begin:"0s",dur:"0.8s",values:"9;15;9",calcMode:"linear",repeatCount:"indefinite"}}),e("animate",{attrs:{attributeName:"fill-opacity",from:"0.5",to:"0.5",begin:"0s",dur:"0.8s",values:".5;1;.5",calcMode:"linear",repeatCount:"indefinite"}})]),e("circle",{attrs:{cx:"105",cy:"15",r:"15"}},[e("animate",{attrs:{attributeName:"r",from:"15",to:"15",begin:"0s",dur:"0.8s",values:"15;9;15",calcMode:"linear",repeatCount:"indefinite"}}),e("animate",{attrs:{attributeName:"fill-opacity",from:"1",to:"1",begin:"0s",dur:"0.8s",values:"1;.5;1",calcMode:"linear",repeatCount:"indefinite"}})])])}),[],!1,null,null,null).exports,l=a({name:"bars",props:{color:{type:String,default:"#000"},height:{type:Number,default:40},width:{type:Number,default:40}}},(function(){var t=this.$createElement,e=this._self._c||t;return e("svg",{attrs:{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 30 30",height:this.height,width:this.width,fill:this.color}},[e("rect",{attrs:{x:"0",y:"13",width:"4",height:"5"}},[e("animate",{attrs:{attributeName:"height",attributeType:"XML",values:"5;21;5",begin:"0s",dur:"0.6s",repeatCount:"indefinite"}}),e("animate",{attrs:{attributeName:"y",attributeType:"XML",values:"13; 5; 13",begin:"0s",dur:"0.6s",repeatCount:"indefinite"}})]),e("rect",{attrs:{x:"10",y:"13",width:"4",height:"5"}},[e("animate",{attrs:{attributeName:"height",attributeType:"XML",values:"5;21;5",begin:"0.15s",dur:"0.6s",repeatCount:"indefinite"}}),e("animate",{attrs:{attributeName:"y",attributeType:"XML",values:"13; 5; 13",begin:"0.15s",dur:"0.6s",repeatCount:"indefinite"}})]),e("rect",{attrs:{x:"20",y:"13",width:"4",height:"5"}},[e("animate",{attrs:{attributeName:"height",attributeType:"XML",values:"5;21;5",begin:"0.3s",dur:"0.6s",repeatCount:"indefinite"}}),e("animate",{attrs:{attributeName:"y",attributeType:"XML",values:"13; 5; 13",begin:"0.3s",dur:"0.6s",repeatCount:"indefinite"}})])])}),[],!1,null,null,null).exports,u=a({name:"vue-loading",mixins:[r],props:{active:Boolean,programmatic:Boolean,container:[Object,Function,n],isFullPage:{type:Boolean,default:!0},enforceFocus:{type:Boolean,default:!0},lockScroll:{type:Boolean,default:!1},transition:{type:String,default:"fade"},canCancel:Boolean,onCancel:{type:Function,default:function(){}},color:String,backgroundColor:String,blur:{type:String,default:"2px"},opacity:Number,width:Number,height:Number,zIndex:Number,loader:{type:String,default:"spinner"}},data:function(){return{isActive:this.active}},components:{Spinner:o,Dots:s,Bars:l},beforeMount:function(){this.programmatic&&(this.container?(this.isFullPage=!1,this.container.appendChild(this.$el)):document.body.appendChild(this.$el))},mounted:function(){this.programmatic&&(this.isActive=!0),document.addEventListener("keyup",this.keyPress)},methods:{cancel:function(){this.canCancel&&this.isActive&&(this.hide(),this.onCancel.apply(null,arguments))},hide:function(){var t=this;this.$emit("hide"),this.$emit("update:active",!1),this.programmatic&&(this.isActive=!1,setTimeout((function(){var e;t.$destroy(),void 0!==(e=t.$el).remove?e.remove():e.parentNode.removeChild(e)}),150))},disableScroll:function(){this.isFullPage&&this.lockScroll&&document.body.classList.add("vld-shown")},enableScroll:function(){this.isFullPage&&this.lockScroll&&document.body.classList.remove("vld-shown")},keyPress:function(t){27===t.keyCode&&this.cancel()}},watch:{active:function(t){this.isActive=t},isActive:function(t){t?this.disableScroll():this.enableScroll()}},computed:{bgStyle:function(){return{background:this.backgroundColor,opacity:this.opacity,backdropFilter:"blur(".concat(this.blur,")")}}},beforeDestroy:function(){document.removeEventListener("keyup",this.keyPress)}},(function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("transition",{attrs:{name:t.transition}},[i("div",{directives:[{name:"show",rawName:"v-show",value:t.isActive,expression:"isActive"}],staticClass:"vld-overlay is-active",class:{"is-full-page":t.isFullPage},style:{zIndex:t.zIndex},attrs:{tabindex:"0","aria-busy":t.isActive,"aria-label":"Loading"}},[i("div",{staticClass:"vld-background",style:t.bgStyle,on:{click:function(e){return e.preventDefault(),t.cancel(e)}}}),i("div",{staticClass:"vld-icon"},[t._t("before"),t._t("default",[i(t.loader,{tag:"component",attrs:{color:t.color,width:t.width,height:t.height}})]),t._t("after")],2)])])}),[],!1,null,null,null).exports,c=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return{show:function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:e,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:i,a={programmatic:!0},o=Object.assign({},e,n,a),s=new(t.extend(u))({el:document.createElement("div"),propsData:o}),l=Object.assign({},i,r);return Object.keys(l).map((function(t){s.$slots[t]=l[t]})),s}}};i(0);u.install=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=c(t,e,i);t.$loading=n,t.prototype.$loading=n};e.default=u}]).default}));

/***/ }),

/***/ "./node_modules/vue-pagination-2/compiled/Pagination.js":
/*!**************************************************************!*\
  !*** ./node_modules/vue-pagination-2/compiled/Pagination.js ***!
  \**************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
    value: true
}));

var _template = __webpack_require__(/*! ./template */ "./node_modules/vue-pagination-2/compiled/template.js");

var _template2 = _interopRequireDefault(_template);

var _RenderlessPagination = __webpack_require__(/*! ./RenderlessPagination */ "./node_modules/vue-pagination-2/compiled/RenderlessPagination.js");

var _RenderlessPagination2 = _interopRequireDefault(_RenderlessPagination);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["default"] = {
    name: 'Pagination',
    components: { RenderlessPagination: _RenderlessPagination2.default },
    provide: function provide() {
        var _this = this;

        return {
            Page: function Page() {
                return _this.value;
            },
            perPage: function perPage() {
                return _this.perPage;
            },
            records: function records() {
                return _this.records;
            }
        };
    },
    render: function render(h) {
        return h('renderless-pagination', { scopedSlots: {
                default: function _default(props) {
                    return props.override ? h(props.override, {
                        attrs: { props: props }
                    }) : (0, _template2.default)(props)(h);
                }
            }
        });
    },

    props: {
        value: {
            type: Number,
            required: true,
            validator: function validator(val) {
                return val > 0;
            }
        },
        records: {
            type: Number,
            required: true
        },
        perPage: {
            type: Number,
            default: 25
        },
        options: {
            type: Object
        }
    },
    data: function data() {
        return {
            aProps: {
                role: "button"
            }
        };
    }
};
module.exports = exports['default'];

/***/ }),

/***/ "./node_modules/vue-pagination-2/compiled/RenderlessPagination.js":
/*!************************************************************************!*\
  !*** ./node_modules/vue-pagination-2/compiled/RenderlessPagination.js ***!
  \************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
    value: true
}));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _config = __webpack_require__(/*! ./config */ "./node_modules/vue-pagination-2/compiled/config.js");

var _config2 = _interopRequireDefault(_config);

var _merge = __webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js");

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["default"] = {
    inject: ['Page', 'records', 'perPage'],
    props: {
        itemClass: {
            required: false,
            default: 'VuePagination__pagination-item'
        }
    },
    render: function render() {
        var _this = this;

        return this.$scopedSlots.default({
            override: this.opts.template,
            showPagination: this.totalPages > 1,
            pages: this.pages,
            pageEvents: function pageEvents(page) {
                return {
                    click: function click() {
                        return _this.setPage(page);
                    },
                    keydown: function keydown(e) {
                        if (e.key === 'ArrowRight') {
                            _this.next();
                        }

                        if (e.key === 'ArrowLeft') {
                            _this.prev();
                        }
                    }
                };
            },
            activeClass: this.activeClass,
            hasEdgeNav: this.opts.edgeNavigation && this.totalChunks > 1,
            setPage: this.setPage,
            setFirstPage: this.setPage.bind(this, 1),
            setLastPage: this.setPage.bind(this, this.totalPages),
            hasChunksNav: this.opts.chunksNavigation === 'fixed',
            setPrevChunk: this.prevChunk,
            setNextChunk: this.nextChunk,
            setPrevPage: this.prev,
            firstPageProps: {
                class: this.Theme.link,
                disabled: this.page === 1
            },
            lastPageProps: {
                class: this.Theme.link,
                disabled: this.page === this.totalPages
            },
            prevProps: {
                class: this.Theme.link,
                disabled: !!this.allowedPageClass(this.page - 1)
            },
            nextProps: {
                class: this.Theme.link,
                disabled: !!this.allowedPageClass(this.page + 1)
            },
            pageClasses: function pageClasses(page) {
                return _this.itemClass + ' ' + _this.Theme.item + ' ' + _this.activeClass(page);
            },
            prevChunkProps: {
                class: this.Theme.link,
                disabled: !this.allowedChunk(-1)
            },
            nextChunkProps: {
                class: this.Theme.link,
                disabled: !this.allowedChunk(1)
            },
            setNextPage: this.next,
            theme: {
                nav: this.Theme.nav,
                list: 'VuePagination__pagination ' + this.Theme.list,
                item: this.Theme.item,
                disabled: this.Theme.disabled,
                prev: this.itemClass + ' ' + this.itemClass + '-prev-page ' + this.Theme.item + ' ' + this.Theme.prev + ' ' + this.allowedPageClass(this.page - 1),
                next: this.itemClass + '  ' + this.itemClass + '-next-page ' + this.Theme.item + ' ' + this.Theme.next + ' ' + this.allowedPageClass(this.page + 1),
                prevChunk: this.itemClass + ' ' + this.Theme.item + ' ' + this.Theme.prev + ' ' + this.itemClass + '-prev-chunk ' + this.allowedChunkClass(-1),
                nextChunk: this.itemClass + ' ' + this.Theme.item + ' ' + this.Theme.next + ' ' + this.itemClass + '-next-chunk ' + this.allowedChunkClass(1),
                firstPage: this.itemClass + ' ' + this.Theme.item + ' ' + (this.page === 1 ? this.Theme.disabled : '') + ' ' + this.itemClass + '-first-page',
                lastPage: this.itemClass + ' ' + this.Theme.item + ' ' + (this.page === this.totalPages ? this.Theme.disabled : '') + ' ' + this.itemClass + '-last-page',
                link: this.Theme.link,
                page: this.itemClass + ' ' + this.Theme.item,
                wrapper: this.Theme.wrapper,
                count: 'VuePagination__count ' + this.Theme.count
            },
            hasRecords: this.hasRecords,
            count: this.count,
            texts: this.opts.texts,
            opts: this.opts,
            allowedChunkClass: this.allowedChunkClass,
            allowedPageClass: this.allowedPageClass,
            setChunk: this.setChunk,
            prev: this.prev,
            next: this.next,
            totalPages: this.totalPages,
            totalChunks: this.totalChunks,
            page: this.Page(),
            records: this.records(),
            perPage: this.perPage(),
            formatNumber: this.formatNumber
        });
    },

    data: function data() {
        return {
            firstPage: this.$parent.value,
            For: this.$parent.for,
            Options: this.$parent.options
        };
    },
    watch: {
        page: function page(val) {
            if (this.opts.chunksNavigation === 'scroll' && this.allowedPage(val) && !this.inDisplay(val)) {
                if (val === this.totalPages) {
                    var first = val - this.opts.chunk + 1;
                    this.firstPage = first >= 1 ? first : 1;
                } else {
                    this.firstPage = val;
                }
            }

            this.$parent.$emit('paginate', val);
        }
    },
    computed: {
        Records: function Records() {
            return this.records();
        },
        PerPage: function PerPage() {
            return this.perPage();
        },
        opts: function opts() {
            return _merge2.default.recursive((0, _config2.default)(), this.Options);
        },
        Theme: function Theme() {

            if (_typeof(this.opts.theme) === 'object') {
                return this.opts.theme;
            }

            var themes = {
                bootstrap3: __webpack_require__(/*! ./themes/bootstrap3 */ "./node_modules/vue-pagination-2/compiled/themes/bootstrap3.js"),
                bootstrap4: __webpack_require__(/*! ./themes/bootstrap4 */ "./node_modules/vue-pagination-2/compiled/themes/bootstrap4.js"),
                bulma: __webpack_require__(/*! ./themes/bulma */ "./node_modules/vue-pagination-2/compiled/themes/bulma.js")
            };

            if (_typeof(themes[this.opts.theme]) === undefined) {
                throw 'vue-pagination-2: the theme ' + this.opts.theme + ' does not exist';
            }

            return themes[this.opts.theme];
        },
        page: function page() {
            return this.Page();
        },

        pages: function pages() {

            if (!this.Records) return [];

            return range(this.paginationStart, this.pagesInCurrentChunk);
        },
        totalPages: function totalPages() {
            return this.Records ? Math.ceil(this.Records / this.PerPage) : 1;
        },
        totalChunks: function totalChunks() {
            return Math.ceil(this.totalPages / this.opts.chunk);
        },
        currentChunk: function currentChunk() {
            return Math.ceil(this.page / this.opts.chunk);
        },
        paginationStart: function paginationStart() {
            if (this.opts.chunksNavigation === 'scroll') {
                return this.firstPage;
            }

            return (this.currentChunk - 1) * this.opts.chunk + 1;
        },
        pagesInCurrentChunk: function pagesInCurrentChunk() {
            return this.paginationStart + this.opts.chunk <= this.totalPages ? this.opts.chunk : this.totalPages - this.paginationStart + 1;
        },
        hasRecords: function hasRecords() {
            return parseInt(this.Records) > 0;
        },

        count: function count() {

            if (/{page}/.test(this.opts.texts.count)) {

                if (this.totalPages <= 1) return '';

                return this.opts.texts.count.replace('{page}', this.page).replace('{pages}', this.totalPages);
            }

            var parts = this.opts.texts.count.split('|');
            var from = (this.page - 1) * this.PerPage + 1;
            var to = this.page == this.totalPages ? this.Records : from + this.PerPage - 1;
            var i = Math.min(this.Records == 1 ? 2 : this.totalPages == 1 ? 1 : 0, parts.length - 1);

            return parts[i].replace('{count}', this.formatNumber(this.Records)).replace('{from}', this.formatNumber(from)).replace('{to}', this.formatNumber(to));
        }
    },
    methods: {
        setPage: function setPage(page) {
            if (this.allowedPage(page)) {
                this.paginate(page);
            }
        },
        paginate: function paginate(page) {
            var _this2 = this;

            this.$parent.$emit('input', page);

            this.$nextTick(function () {
                if (_this2.$el) {
                    _this2.$el.querySelector('li.' + _this2.Theme.active + ' a').focus();
                }
            });
        },

        next: function next() {
            return this.setPage(this.page + 1);
        },
        prev: function prev() {
            return this.setPage(this.page - 1);
        },
        inDisplay: function inDisplay(page) {

            var start = this.firstPage;
            var end = start + this.opts.chunk - 1;

            return page >= start && page <= end;
        },

        nextChunk: function nextChunk() {
            return this.setChunk(1);
        },
        prevChunk: function prevChunk() {
            return this.setChunk(-1);
        },
        setChunk: function setChunk(direction) {
            this.setPage((this.currentChunk - 1 + direction) * this.opts.chunk + 1);
        },
        allowedPage: function allowedPage(page) {
            return page >= 1 && page <= this.totalPages;
        },
        allowedChunk: function allowedChunk(direction) {
            return direction == 1 && this.currentChunk < this.totalChunks || direction == -1 && this.currentChunk > 1;
        },
        allowedPageClass: function allowedPageClass(direction) {
            return this.allowedPage(direction) ? '' : this.Theme.disabled;
        },
        allowedChunkClass: function allowedChunkClass(direction) {
            return this.allowedChunk(direction) ? '' : this.Theme.disabled;
        },
        activeClass: function activeClass(page) {
            return this.page == page ? this.Theme.active : '';
        },
        formatNumber: function formatNumber(num) {

            if (!this.opts.format) return num;

            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }
};


function range(start, count) {
    return Array.apply(0, Array(count)).map(function (element, index) {
        return index + start;
    });
}
module.exports = exports['default'];

/***/ }),

/***/ "./node_modules/vue-pagination-2/compiled/config.js":
/*!**********************************************************!*\
  !*** ./node_modules/vue-pagination-2/compiled/config.js ***!
  \**********************************************************/
/***/ (function(module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
    value: true
}));

exports["default"] = function () {
    return {
        format: true,
        chunk: 10,
        chunksNavigation: 'fixed',
        edgeNavigation: false,
        theme: 'bootstrap3',
        template: null,
        texts: {
            count: 'Showing {from} to {to} of {count} records|{count} records|One record',
            first: 'First',
            last: 'Last',
            nextPage: '>',
            nextChunk: '>>',
            prevPage: '<',
            prevChunk: '<<'
        }
    };
};

module.exports = exports['default'];

/***/ }),

/***/ "./node_modules/vue-pagination-2/compiled/main.js":
/*!********************************************************!*\
  !*** ./node_modules/vue-pagination-2/compiled/main.js ***!
  \********************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));

var _Pagination = __webpack_require__(/*! ./Pagination */ "./node_modules/vue-pagination-2/compiled/Pagination.js");

var _Pagination2 = _interopRequireDefault(_Pagination);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["default"] = _Pagination2.default;
module.exports = exports['default'];

/***/ }),

/***/ "./node_modules/vue-pagination-2/compiled/template.js":
/*!************************************************************!*\
  !*** ./node_modules/vue-pagination-2/compiled/template.js ***!
  \************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (props) {

    return function (h) {

        var theme = this.theme;
        var prevChunk = '';
        var nextChunk = '';
        var firstPage = '';
        var lastPage = '';
        var items = this.pages.map(function (page) {

            return h(
                'li',
                { 'class': 'VuePagination__pagination-item ' + theme.item + ' ' + this.activeClass(page),
                    on: {
                        'click': this.setPage.bind(this, page)
                    }
                },
                [h(
                    'a',
                    { 'class': theme.link + ' ' + this.activeClass(page),
                        attrs: { role: 'button' }
                    },
                    [this.formatNumber(page)]
                )]
            );
        }.bind(this));

        if (this.opts.edgeNavigation && this.totalChunks > 1) {
            firstPage = h(
                'li',
                { 'class': 'VuePagination__pagination-item ' + theme.item + ' ' + (this.page === 1 ? theme.disabled : '') + ' VuePagination__pagination-item-first-page',
                    on: {
                        'click': this.setPage.bind(this, 1)
                    }
                },
                [h(
                    'a',
                    { 'class': theme.link,
                        attrs: { disabled: this.page === 1 }
                    },
                    [this.opts.texts.first]
                )]
            );

            lastPage = h(
                'li',
                { 'class': 'VuePagination__pagination-item ' + theme.item + ' ' + (this.page === this.totalPages ? theme.disabled : '') + ' VuePagination__pagination-item-last-page',
                    on: {
                        'click': this.setPage.bind(this, this.totalPages)
                    }
                },
                [h(
                    'a',
                    { 'class': theme.link,
                        attrs: { disabled: this.page === this.totalPages }
                    },
                    [this.opts.texts.last]
                )]
            );
        }

        if (this.opts.chunksNavigation === 'fixed') {

            prevChunk = h(
                'li',
                { 'class': 'VuePagination__pagination-item ' + theme.item + ' ' + theme.prev + ' VuePagination__pagination-item-prev-chunk ' + this.allowedChunkClass(-1),
                    on: {
                        'click': this.setChunk.bind(this, -1)
                    }
                },
                [h(
                    'a',
                    { 'class': theme.link,
                        attrs: { disabled: !!this.allowedChunkClass(-1) }
                    },
                    [this.opts.texts.prevChunk]
                )]
            );

            nextChunk = h(
                'li',
                { 'class': 'VuePagination__pagination-item ' + theme.item + ' ' + theme.next + ' VuePagination__pagination-item-next-chunk ' + this.allowedChunkClass(1),
                    on: {
                        'click': this.setChunk.bind(this, 1)
                    }
                },
                [h(
                    'a',
                    { 'class': theme.link,
                        attrs: { disabled: !!this.allowedChunkClass(1) }
                    },
                    [this.opts.texts.nextChunk]
                )]
            );
        }

        return h(
            'div',
            { 'class': 'VuePagination ' + theme.wrapper },
            [h(
                'nav',
                { 'class': '' + theme.nav },
                [h(
                    'ul',
                    {
                        directives: [{
                            name: 'show',
                            value: this.totalPages > 1
                        }],

                        'class': theme.list + ' VuePagination__pagination' },
                    [firstPage, prevChunk, h(
                        'li',
                        { 'class': 'VuePagination__pagination-item ' + theme.item + ' ' + theme.prev + ' VuePagination__pagination-item-prev-page ' + this.allowedPageClass(this.page - 1),
                            on: {
                                'click': this.prev.bind(this)
                            }
                        },
                        [h(
                            'a',
                            { 'class': theme.link,
                                attrs: { disabled: !!this.allowedPageClass(this.page - 1)
                                }
                            },
                            [this.opts.texts.prevPage]
                        )]
                    ), items, h(
                        'li',
                        { 'class': 'VuePagination__pagination-item ' + theme.item + ' ' + theme.next + ' VuePagination__pagination-item-next-page ' + this.allowedPageClass(this.page + 1),
                            on: {
                                'click': this.next.bind(this)
                            }
                        },
                        [h(
                            'a',
                            { 'class': theme.link,
                                attrs: { disabled: !!this.allowedPageClass(this.page + 1)
                                }
                            },
                            [this.opts.texts.nextPage]
                        )]
                    ), nextChunk, lastPage]
                ), h(
                    'p',
                    {
                        directives: [{
                            name: 'show',
                            value: parseInt(this.records)
                        }],

                        'class': 'VuePagination__count ' + theme.count },
                    [this.count]
                )]
            )]
        );
    }.bind(props);
};

/***/ }),

/***/ "./node_modules/vue-pagination-2/compiled/themes/bootstrap3.js":
/*!*********************************************************************!*\
  !*** ./node_modules/vue-pagination-2/compiled/themes/bootstrap3.js ***!
  \*********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = {
    nav: '',
    count: '',
    wrapper: '',
    list: 'pagination',
    item: 'page-item',
    link: 'page-link',
    next: '',
    prev: '',
    active: 'active',
    disabled: 'disabled'
};

/***/ }),

/***/ "./node_modules/vue-pagination-2/compiled/themes/bootstrap4.js":
/*!*********************************************************************!*\
  !*** ./node_modules/vue-pagination-2/compiled/themes/bootstrap4.js ***!
  \*********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = {
    nav: '',
    count: '',
    wrapper: '',
    list: 'pagination',
    item: 'page-item',
    link: 'page-link',
    next: '',
    prev: '',
    active: 'active',
    disabled: 'disabled'
};

/***/ }),

/***/ "./node_modules/vue-pagination-2/compiled/themes/bulma.js":
/*!****************************************************************!*\
  !*** ./node_modules/vue-pagination-2/compiled/themes/bulma.js ***!
  \****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = {
    nav: '',
    count: '',
    wrapper: 'pagination',
    list: 'pagination-list',
    item: '',
    link: 'pagination-link',
    next: '',
    prev: '',
    active: 'is-current',
    disabled: '' // uses the disabled HTML attirbute
};

/***/ }),

/***/ "./node_modules/vue-select/dist/vue-select.js":
/*!****************************************************!*\
  !*** ./node_modules/vue-select/dist/vue-select.js ***!
  \****************************************************/
/***/ (function(module) {

!function(t,e){ true?module.exports=e():0}("undefined"!=typeof self?self:this,(function(){return function(t){var e={};function n(o){if(e[o])return e[o].exports;var i=e[o]={i:o,l:!1,exports:{}};return t[o].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)n.d(o,i,function(e){return t[e]}.bind(null,i));return o},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="/",n(n.s=8)}([function(t,e,n){var o=n(4),i=n(5),r=n(6);t.exports=function(t){return o(t)||i(t)||r()}},function(t,e){function n(e){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?t.exports=n=function(t){return typeof t}:t.exports=n=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},n(e)}t.exports=n},function(t,e,n){},function(t,e){t.exports=function(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}},function(t,e){t.exports=function(t){if(Array.isArray(t)){for(var e=0,n=new Array(t.length);e<t.length;e++)n[e]=t[e];return n}}},function(t,e){t.exports=function(t){if(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t))return Array.from(t)}},function(t,e){t.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}},function(t,e,n){"use strict";var o=n(2);n.n(o).a},function(t,e,n){"use strict";n.r(e);var o=n(0),i=n.n(o),r=n(1),s=n.n(r),a=n(3),l=n.n(a),c={props:{autoscroll:{type:Boolean,default:!0}},watch:{typeAheadPointer:function(){this.autoscroll&&this.maybeAdjustScroll()},open:function(t){var e=this;this.autoscroll&&t&&this.$nextTick((function(){return e.maybeAdjustScroll()}))}},methods:{maybeAdjustScroll:function(){var t,e=(null===(t=this.$refs.dropdownMenu)||void 0===t?void 0:t.children[this.typeAheadPointer])||!1;if(e){var n=this.getDropdownViewport(),o=e.getBoundingClientRect(),i=o.top,r=o.bottom,s=o.height;if(i<n.top)return this.$refs.dropdownMenu.scrollTop=e.offsetTop;if(r>n.bottom)return this.$refs.dropdownMenu.scrollTop=e.offsetTop-(n.height-s)}},getDropdownViewport:function(){return this.$refs.dropdownMenu?this.$refs.dropdownMenu.getBoundingClientRect():{height:0,top:0,bottom:0}}}},u={data:function(){return{typeAheadPointer:-1}},watch:{filteredOptions:function(){for(var t=0;t<this.filteredOptions.length;t++)if(this.selectable(this.filteredOptions[t])){this.typeAheadPointer=t;break}}},methods:{typeAheadUp:function(){for(var t=this.typeAheadPointer-1;t>=0;t--)if(this.selectable(this.filteredOptions[t])){this.typeAheadPointer=t;break}},typeAheadDown:function(){for(var t=this.typeAheadPointer+1;t<this.filteredOptions.length;t++)if(this.selectable(this.filteredOptions[t])){this.typeAheadPointer=t;break}},typeAheadSelect:function(){var t=this.filteredOptions[this.typeAheadPointer];t&&this.select(t)}}},p={props:{loading:{type:Boolean,default:!1}},data:function(){return{mutableLoading:!1}},watch:{search:function(){this.$emit("search",this.search,this.toggleLoading)},loading:function(t){this.mutableLoading=t}},methods:{toggleLoading:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return this.mutableLoading=null==t?!this.mutableLoading:t}}};function d(t,e,n,o,i,r,s,a){var l,c="function"==typeof t?t.options:t;if(e&&(c.render=e,c.staticRenderFns=n,c._compiled=!0),o&&(c.functional=!0),r&&(c._scopeId="data-v-"+r),s?(l=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),i&&i.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(s)},c._ssrRegister=l):i&&(l=a?function(){i.call(this,this.$root.$options.shadowRoot)}:i),l)if(c.functional){c._injectStyles=l;var u=c.render;c.render=function(t,e){return l.call(e),u(t,e)}}else{var p=c.beforeCreate;c.beforeCreate=p?[].concat(p,l):[l]}return{exports:t,options:c}}var h={Deselect:d({},(function(){var t=this.$createElement,e=this._self._c||t;return e("svg",{attrs:{xmlns:"http://www.w3.org/2000/svg",width:"10",height:"10"}},[e("path",{attrs:{d:"M6.895455 5l2.842897-2.842898c.348864-.348863.348864-.914488 0-1.263636L9.106534.261648c-.348864-.348864-.914489-.348864-1.263636 0L5 3.104545 2.157102.261648c-.348863-.348864-.914488-.348864-1.263636 0L.261648.893466c-.348864.348864-.348864.914489 0 1.263636L3.104545 5 .261648 7.842898c-.348864.348863-.348864.914488 0 1.263636l.631818.631818c.348864.348864.914773.348864 1.263636 0L5 6.895455l2.842898 2.842897c.348863.348864.914772.348864 1.263636 0l.631818-.631818c.348864-.348864.348864-.914489 0-1.263636L6.895455 5z"}})])}),[],!1,null,null,null).exports,OpenIndicator:d({},(function(){var t=this.$createElement,e=this._self._c||t;return e("svg",{attrs:{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"10"}},[e("path",{attrs:{d:"M9.211364 7.59931l4.48338-4.867229c.407008-.441854.407008-1.158247 0-1.60046l-.73712-.80023c-.407008-.441854-1.066904-.441854-1.474243 0L7 5.198617 2.51662.33139c-.407008-.441853-1.066904-.441853-1.474243 0l-.737121.80023c-.407008.441854-.407008 1.158248 0 1.600461l4.48338 4.867228L7 10l2.211364-2.40069z"}})])}),[],!1,null,null,null).exports},f={inserted:function(t,e,n){var o=n.context;if(o.appendToBody){var i=o.$refs.toggle.getBoundingClientRect(),r=i.height,s=i.top,a=i.left,l=i.width,c=window.scrollX||window.pageXOffset,u=window.scrollY||window.pageYOffset;t.unbindPosition=o.calculatePosition(t,o,{width:l+"px",left:c+a+"px",top:u+s+r+"px"}),document.body.appendChild(t)}},unbind:function(t,e,n){n.context.appendToBody&&(t.unbindPosition&&"function"==typeof t.unbindPosition&&t.unbindPosition(),t.parentNode&&t.parentNode.removeChild(t))}};var y=function(t){var e={};return Object.keys(t).sort().forEach((function(n){e[n]=t[n]})),JSON.stringify(e)},b=0;var g=function(){return++b};function v(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,o)}return n}function m(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?v(Object(n),!0).forEach((function(e){l()(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):v(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}var _={components:m({},h),directives:{appendToBody:f},mixins:[c,u,p],props:{value:{},components:{type:Object,default:function(){return{}}},options:{type:Array,default:function(){return[]}},disabled:{type:Boolean,default:!1},clearable:{type:Boolean,default:!0},deselectFromDropdown:{type:Boolean,default:!1},searchable:{type:Boolean,default:!0},multiple:{type:Boolean,default:!1},placeholder:{type:String,default:""},transition:{type:String,default:"vs__fade"},clearSearchOnSelect:{type:Boolean,default:!0},closeOnSelect:{type:Boolean,default:!0},label:{type:String,default:"label"},autocomplete:{type:String,default:"off"},reduce:{type:Function,default:function(t){return t}},selectable:{type:Function,default:function(t){return!0}},getOptionLabel:{type:Function,default:function(t){return"object"===s()(t)?t.hasOwnProperty(this.label)?t[this.label]:console.warn('[vue-select warn]: Label key "option.'.concat(this.label,'" does not')+" exist in options object ".concat(JSON.stringify(t),".\n")+"https://vue-select.org/api/props.html#getoptionlabel"):t}},getOptionKey:{type:Function,default:function(t){if("object"!==s()(t))return t;try{return t.hasOwnProperty("id")?t.id:y(t)}catch(e){return console.warn("[vue-select warn]: Could not stringify this option to generate unique key. Please provide'getOptionKey' prop to return a unique key for each option.\nhttps://vue-select.org/api/props.html#getoptionkey",t,e)}}},onTab:{type:Function,default:function(){this.selectOnTab&&!this.isComposing&&this.typeAheadSelect()}},taggable:{type:Boolean,default:!1},tabindex:{type:Number,default:null},pushTags:{type:Boolean,default:!1},filterable:{type:Boolean,default:!0},filterBy:{type:Function,default:function(t,e,n){return(e||"").toLocaleLowerCase().indexOf(n.toLocaleLowerCase())>-1}},filter:{type:Function,default:function(t,e){var n=this;return t.filter((function(t){var o=n.getOptionLabel(t);return"number"==typeof o&&(o=o.toString()),n.filterBy(t,o,e)}))}},createOption:{type:Function,default:function(t){return"object"===s()(this.optionList[0])?l()({},this.label,t):t}},resetOnOptionsChange:{default:!1,validator:function(t){return["function","boolean"].includes(s()(t))}},clearSearchOnBlur:{type:Function,default:function(t){var e=t.clearSearchOnSelect,n=t.multiple;return e&&!n}},noDrop:{type:Boolean,default:!1},inputId:{type:String},dir:{type:String,default:"auto"},selectOnTab:{type:Boolean,default:!1},selectOnKeyCodes:{type:Array,default:function(){return[13]}},searchInputQuerySelector:{type:String,default:"[type=search]"},mapKeydown:{type:Function,default:function(t,e){return t}},appendToBody:{type:Boolean,default:!1},calculatePosition:{type:Function,default:function(t,e,n){var o=n.width,i=n.top,r=n.left;t.style.top=i,t.style.left=r,t.style.width=o}},dropdownShouldOpen:{type:Function,default:function(t){var e=t.noDrop,n=t.open,o=t.mutableLoading;return!e&&(n&&!o)}},uid:{type:[String,Number],default:function(){return g()}}},data:function(){return{search:"",open:!1,isComposing:!1,pushedTags:[],_value:[]}},computed:{isTrackingValues:function(){return void 0===this.value||this.$options.propsData.hasOwnProperty("reduce")},selectedValue:function(){var t=this.value;return this.isTrackingValues&&(t=this.$data._value),t?[].concat(t):[]},optionList:function(){return this.options.concat(this.pushTags?this.pushedTags:[])},searchEl:function(){return this.$scopedSlots.search?this.$refs.selectedOptions.querySelector(this.searchInputQuerySelector):this.$refs.search},scope:function(){var t=this,e={search:this.search,loading:this.loading,searching:this.searching,filteredOptions:this.filteredOptions};return{search:{attributes:m({disabled:this.disabled,placeholder:this.searchPlaceholder,tabindex:this.tabindex,readonly:!this.searchable,id:this.inputId,"aria-autocomplete":"list","aria-labelledby":"vs".concat(this.uid,"__combobox"),"aria-controls":"vs".concat(this.uid,"__listbox"),ref:"search",type:"search",autocomplete:this.autocomplete,value:this.search},this.dropdownOpen&&this.filteredOptions[this.typeAheadPointer]?{"aria-activedescendant":"vs".concat(this.uid,"__option-").concat(this.typeAheadPointer)}:{}),events:{compositionstart:function(){return t.isComposing=!0},compositionend:function(){return t.isComposing=!1},keydown:this.onSearchKeyDown,blur:this.onSearchBlur,focus:this.onSearchFocus,input:function(e){return t.search=e.target.value}}},spinner:{loading:this.mutableLoading},noOptions:{search:this.search,loading:this.mutableLoading,searching:this.searching},openIndicator:{attributes:{ref:"openIndicator",role:"presentation",class:"vs__open-indicator"}},listHeader:e,listFooter:e,header:m({},e,{deselect:this.deselect}),footer:m({},e,{deselect:this.deselect})}},childComponents:function(){return m({},h,{},this.components)},stateClasses:function(){return{"vs--open":this.dropdownOpen,"vs--single":!this.multiple,"vs--multiple":this.multiple,"vs--searching":this.searching&&!this.noDrop,"vs--searchable":this.searchable&&!this.noDrop,"vs--unsearchable":!this.searchable,"vs--loading":this.mutableLoading,"vs--disabled":this.disabled}},searching:function(){return!!this.search},dropdownOpen:function(){return this.dropdownShouldOpen(this)},searchPlaceholder:function(){return this.isValueEmpty&&this.placeholder?this.placeholder:void 0},filteredOptions:function(){var t=[].concat(this.optionList);if(!this.filterable&&!this.taggable)return t;var e=this.search.length?this.filter(t,this.search,this):t;if(this.taggable&&this.search.length){var n=this.createOption(this.search);this.optionExists(n)||e.unshift(n)}return e},isValueEmpty:function(){return 0===this.selectedValue.length},showClearButton:function(){return!this.multiple&&this.clearable&&!this.open&&!this.isValueEmpty}},watch:{options:function(t,e){var n=this;!this.taggable&&("function"==typeof n.resetOnOptionsChange?n.resetOnOptionsChange(t,e,n.selectedValue):n.resetOnOptionsChange)&&this.clearSelection(),this.value&&this.isTrackingValues&&this.setInternalValueFromOptions(this.value)},value:{immediate:!0,handler:function(t){this.isTrackingValues&&this.setInternalValueFromOptions(t)}},multiple:function(){this.clearSelection()},open:function(t){this.$emit(t?"open":"close")}},created:function(){this.mutableLoading=this.loading,this.$on("option:created",this.pushTag)},methods:{setInternalValueFromOptions:function(t){var e=this;Array.isArray(t)?this.$data._value=t.map((function(t){return e.findOptionFromReducedValue(t)})):this.$data._value=this.findOptionFromReducedValue(t)},select:function(t){this.$emit("option:selecting",t),this.isOptionSelected(t)?this.deselectFromDropdown&&(this.clearable||this.multiple&&this.selectedValue.length>1)&&this.deselect(t):(this.taggable&&!this.optionExists(t)&&this.$emit("option:created",t),this.multiple&&(t=this.selectedValue.concat(t)),this.updateValue(t),this.$emit("option:selected",t)),this.onAfterSelect(t)},deselect:function(t){var e=this;this.$emit("option:deselecting",t),this.updateValue(this.selectedValue.filter((function(n){return!e.optionComparator(n,t)}))),this.$emit("option:deselected",t)},clearSelection:function(){this.updateValue(this.multiple?[]:null)},onAfterSelect:function(t){this.closeOnSelect&&(this.open=!this.open,this.searchEl.blur()),this.clearSearchOnSelect&&(this.search="")},updateValue:function(t){var e=this;void 0===this.value&&(this.$data._value=t),null!==t&&(t=Array.isArray(t)?t.map((function(t){return e.reduce(t)})):this.reduce(t)),this.$emit("input",t)},toggleDropdown:function(t){var e=t.target!==this.searchEl;e&&t.preventDefault();var n=[].concat(i()(this.$refs.deselectButtons||[]),i()([this.$refs.clearButton]||0));void 0===this.searchEl||n.filter(Boolean).some((function(e){return e.contains(t.target)||e===t.target}))?t.preventDefault():this.open&&e?this.searchEl.blur():this.disabled||(this.open=!0,this.searchEl.focus())},isOptionSelected:function(t){var e=this;return this.selectedValue.some((function(n){return e.optionComparator(n,t)}))},isOptionDeselectable:function(t){return this.isOptionSelected(t)&&this.deselectFromDropdown},optionComparator:function(t,e){return this.getOptionKey(t)===this.getOptionKey(e)},findOptionFromReducedValue:function(t){var e=this,n=[].concat(i()(this.options),i()(this.pushedTags)).filter((function(n){return JSON.stringify(e.reduce(n))===JSON.stringify(t)}));return 1===n.length?n[0]:n.find((function(t){return e.optionComparator(t,e.$data._value)}))||t},closeSearchOptions:function(){this.open=!1,this.$emit("search:blur")},maybeDeleteValue:function(){if(!this.searchEl.value.length&&this.selectedValue&&this.selectedValue.length&&this.clearable){var t=null;this.multiple&&(t=i()(this.selectedValue.slice(0,this.selectedValue.length-1))),this.updateValue(t)}},optionExists:function(t){var e=this;return this.optionList.some((function(n){return e.optionComparator(n,t)}))},normalizeOptionForSlot:function(t){return"object"===s()(t)?t:l()({},this.label,t)},pushTag:function(t){this.pushedTags.push(t)},onEscape:function(){this.search.length?this.search="":this.searchEl.blur()},onSearchBlur:function(){if(!this.mousedown||this.searching){var t=this.clearSearchOnSelect,e=this.multiple;return this.clearSearchOnBlur({clearSearchOnSelect:t,multiple:e})&&(this.search=""),void this.closeSearchOptions()}this.mousedown=!1,0!==this.search.length||0!==this.options.length||this.closeSearchOptions()},onSearchFocus:function(){this.open=!0,this.$emit("search:focus")},onMousedown:function(){this.mousedown=!0},onMouseUp:function(){this.mousedown=!1},onSearchKeyDown:function(t){var e=this,n=function(t){return t.preventDefault(),!e.isComposing&&e.typeAheadSelect()},o={8:function(t){return e.maybeDeleteValue()},9:function(t){return e.onTab()},27:function(t){return e.onEscape()},38:function(t){return t.preventDefault(),e.typeAheadUp()},40:function(t){return t.preventDefault(),e.typeAheadDown()}};this.selectOnKeyCodes.forEach((function(t){return o[t]=n}));var i=this.mapKeydown(o,this);if("function"==typeof i[t.keyCode])return i[t.keyCode](t)}}},O=(n(7),d(_,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"v-select",class:t.stateClasses,attrs:{dir:t.dir}},[t._t("header",null,null,t.scope.header),t._v(" "),n("div",{ref:"toggle",staticClass:"vs__dropdown-toggle",attrs:{id:"vs"+t.uid+"__combobox",role:"combobox","aria-expanded":t.dropdownOpen.toString(),"aria-owns":"vs"+t.uid+"__listbox","aria-label":"Search for option"},on:{mousedown:function(e){return t.toggleDropdown(e)}}},[n("div",{ref:"selectedOptions",staticClass:"vs__selected-options"},[t._l(t.selectedValue,(function(e){return t._t("selected-option-container",[n("span",{key:t.getOptionKey(e),staticClass:"vs__selected"},[t._t("selected-option",[t._v("\n            "+t._s(t.getOptionLabel(e))+"\n          ")],null,t.normalizeOptionForSlot(e)),t._v(" "),t.multiple?n("button",{ref:"deselectButtons",refInFor:!0,staticClass:"vs__deselect",attrs:{disabled:t.disabled,type:"button",title:"Deselect "+t.getOptionLabel(e),"aria-label":"Deselect "+t.getOptionLabel(e)},on:{click:function(n){return t.deselect(e)}}},[n(t.childComponents.Deselect,{tag:"component"})],1):t._e()],2)],{option:t.normalizeOptionForSlot(e),deselect:t.deselect,multiple:t.multiple,disabled:t.disabled})})),t._v(" "),t._t("search",[n("input",t._g(t._b({staticClass:"vs__search"},"input",t.scope.search.attributes,!1),t.scope.search.events))],null,t.scope.search)],2),t._v(" "),n("div",{ref:"actions",staticClass:"vs__actions"},[n("button",{directives:[{name:"show",rawName:"v-show",value:t.showClearButton,expression:"showClearButton"}],ref:"clearButton",staticClass:"vs__clear",attrs:{disabled:t.disabled,type:"button",title:"Clear Selected","aria-label":"Clear Selected"},on:{click:t.clearSelection}},[n(t.childComponents.Deselect,{tag:"component"})],1),t._v(" "),t._t("open-indicator",[t.noDrop?t._e():n(t.childComponents.OpenIndicator,t._b({tag:"component"},"component",t.scope.openIndicator.attributes,!1))],null,t.scope.openIndicator),t._v(" "),t._t("spinner",[n("div",{directives:[{name:"show",rawName:"v-show",value:t.mutableLoading,expression:"mutableLoading"}],staticClass:"vs__spinner"},[t._v("Loading...")])],null,t.scope.spinner)],2)]),t._v(" "),n("transition",{attrs:{name:t.transition}},[t.dropdownOpen?n("ul",{directives:[{name:"append-to-body",rawName:"v-append-to-body"}],key:"vs"+t.uid+"__listbox",ref:"dropdownMenu",staticClass:"vs__dropdown-menu",attrs:{id:"vs"+t.uid+"__listbox",role:"listbox",tabindex:"-1"},on:{mousedown:function(e){return e.preventDefault(),t.onMousedown(e)},mouseup:t.onMouseUp}},[t._t("list-header",null,null,t.scope.listHeader),t._v(" "),t._l(t.filteredOptions,(function(e,o){return n("li",{key:t.getOptionKey(e),staticClass:"vs__dropdown-option",class:{"vs__dropdown-option--deselect":t.isOptionDeselectable(e)&&o===t.typeAheadPointer,"vs__dropdown-option--selected":t.isOptionSelected(e),"vs__dropdown-option--highlight":o===t.typeAheadPointer,"vs__dropdown-option--disabled":!t.selectable(e)},attrs:{id:"vs"+t.uid+"__option-"+o,role:"option","aria-selected":o===t.typeAheadPointer||null},on:{mouseover:function(n){t.selectable(e)&&(t.typeAheadPointer=o)},click:function(n){n.preventDefault(),n.stopPropagation(),t.selectable(e)&&t.select(e)}}},[t._t("option",[t._v("\n          "+t._s(t.getOptionLabel(e))+"\n        ")],null,t.normalizeOptionForSlot(e))],2)})),t._v(" "),0===t.filteredOptions.length?n("li",{staticClass:"vs__no-options"},[t._t("no-options",[t._v("Sorry, no matching options.")],null,t.scope.noOptions)],2):t._e(),t._v(" "),t._t("list-footer",null,null,t.scope.listFooter)],2):n("ul",{staticStyle:{display:"none",visibility:"hidden"},attrs:{id:"vs"+t.uid+"__listbox",role:"listbox"}})]),t._v(" "),t._t("footer",null,null,t.scope.footer)],2)}),[],!1,null,null,null).exports),w={ajax:p,pointer:u,pointerScroll:c};n.d(e,"VueSelect",(function(){return O})),n.d(e,"mixins",(function(){return w}));e.default=O}])}));
//# sourceMappingURL=vue-select.js.map

/***/ }),

/***/ "./node_modules/vue-sweetalert2/dist/vue-sweetalert.umd.js":
/*!*****************************************************************!*\
  !*** ./node_modules/vue-sweetalert2/dist/vue-sweetalert.umd.js ***!
  \*****************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

!function(t,e){ true?module.exports=e():0}(this,(function(){"use strict";var t="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof __webpack_require__.g?__webpack_require__.g:"undefined"!=typeof self?self:{},e={exports:{}};e.exports=function(){const t=Object.freeze({cancel:"cancel",backdrop:"backdrop",close:"close",esc:"esc",timer:"timer"}),e=t=>{const e=[];for(let n=0;n<t.length;n++)-1===e.indexOf(t[n])&&e.push(t[n]);return e},n=t=>t.charAt(0).toUpperCase()+t.slice(1),o=t=>Array.prototype.slice.call(t),i=t=>{},s=t=>{},a=[],r=t=>{a.includes(t)||(a.push(t),i(t))},c=(t,e)=>{r('"'.concat(t,'" is deprecated and will be removed in the next major release. Please use "').concat(e,'" instead.'))},l=t=>"function"==typeof t?t():t,u=t=>t&&"function"==typeof t.toPromise,d=t=>u(t)?t.toPromise():Promise.resolve(t),p=t=>t&&Promise.resolve(t)===t,m=t=>"object"==typeof t&&t.jquery,g=t=>t instanceof Element||m(t),h=t=>{const e={};return"object"!=typeof t[0]||g(t[0])?["title","html","icon"].forEach(((n,o)=>{const i=t[o];"string"==typeof i||g(i)?e[n]=i:void 0!==i&&s("Unexpected type of ".concat(n,'! Expected "string" or "Element", got ').concat(typeof i))})):Object.assign(e,t[0]),e},f="swal2-",b=t=>{const e={};for(const n in t)e[t[n]]=f+t[n];return e},y=b(["container","shown","height-auto","iosfix","popup","modal","no-backdrop","no-transition","toast","toast-shown","show","hide","close","title","html-container","actions","confirm","deny","cancel","default-outline","footer","icon","icon-content","image","input","file","range","select","radio","checkbox","label","textarea","inputerror","input-label","validation-message","progress-steps","active-progress-step","progress-step","progress-step-line","loader","loading","styled","top","top-start","top-end","top-left","top-right","center","center-start","center-end","center-left","center-right","bottom","bottom-start","bottom-end","bottom-left","bottom-right","grow-row","grow-column","grow-fullscreen","rtl","timer-progress-bar","timer-progress-bar-container","scrollbar-measure","icon-success","icon-warning","icon-info","icon-question","icon-error"]),w=b(["success","warning","info","question","error"]),v=()=>document.body.querySelector(".".concat(y.container)),C=t=>{const e=v();return e?e.querySelector(t):null},k=t=>C(".".concat(t)),A=()=>k(y.popup),B=()=>k(y.icon),x=()=>k(y.title),P=()=>k(y["html-container"]),E=()=>k(y.image),S=()=>k(y["progress-steps"]),T=()=>k(y["validation-message"]),O=()=>C(".".concat(y.actions," .").concat(y.confirm)),L=()=>C(".".concat(y.actions," .").concat(y.deny)),j=()=>k(y["input-label"]),M=()=>C(".".concat(y.loader)),D=()=>C(".".concat(y.actions," .").concat(y.cancel)),I=()=>k(y.actions),H=()=>k(y.footer),q=()=>k(y["timer-progress-bar"]),V=()=>k(y.close),N='\n  a[href],\n  area[href],\n  input:not([disabled]),\n  select:not([disabled]),\n  textarea:not([disabled]),\n  button:not([disabled]),\n  iframe,\n  object,\n  embed,\n  [tabindex="0"],\n  [contenteditable],\n  audio[controls],\n  video[controls],\n  summary\n',U=()=>{const t=o(A().querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])')).sort(((t,e)=>(t=parseInt(t.getAttribute("tabindex")))>(e=parseInt(e.getAttribute("tabindex")))?1:t<e?-1:0)),n=o(A().querySelectorAll(N)).filter((t=>"-1"!==t.getAttribute("tabindex")));return e(t.concat(n)).filter((t=>at(t)))},F=()=>!R()&&!document.body.classList.contains(y["no-backdrop"]),R=()=>document.body.classList.contains(y["toast-shown"]),z=()=>A().hasAttribute("data-loading"),W={previousBodyPadding:null},_=(t,e)=>{if(t.textContent="",e){const n=(new DOMParser).parseFromString(e,"text/html");o(n.querySelector("head").childNodes).forEach((e=>{t.appendChild(e)})),o(n.querySelector("body").childNodes).forEach((e=>{t.appendChild(e)}))}},K=(t,e)=>{if(!e)return!1;const n=e.split(/\s+/);for(let o=0;o<n.length;o++)if(!t.classList.contains(n[o]))return!1;return!0},Y=(t,e)=>{o(t.classList).forEach((n=>{Object.values(y).includes(n)||Object.values(w).includes(n)||Object.values(e.showClass).includes(n)||t.classList.remove(n)}))},$=(t,e,n)=>{if(Y(t,e),e.customClass&&e.customClass[n]){if("string"!=typeof e.customClass[n]&&!e.customClass[n].forEach)return i("Invalid type of customClass.".concat(n,'! Expected string or iterable object, got "').concat(typeof e.customClass[n],'"'));G(t,e.customClass[n])}},Z=(t,e)=>{if(!e)return null;switch(e){case"select":case"textarea":case"file":return tt(t,y[e]);case"checkbox":return t.querySelector(".".concat(y.checkbox," input"));case"radio":return t.querySelector(".".concat(y.radio," input:checked"))||t.querySelector(".".concat(y.radio," input:first-child"));case"range":return t.querySelector(".".concat(y.range," input"));default:return tt(t,y.input)}},J=t=>{if(t.focus(),"file"!==t.type){const e=t.value;t.value="",t.value=e}},X=(t,e,n)=>{t&&e&&("string"==typeof e&&(e=e.split(/\s+/).filter(Boolean)),e.forEach((e=>{t.forEach?t.forEach((t=>{n?t.classList.add(e):t.classList.remove(e)})):n?t.classList.add(e):t.classList.remove(e)})))},G=(t,e)=>{X(t,e,!0)},Q=(t,e)=>{X(t,e,!1)},tt=(t,e)=>{for(let n=0;n<t.childNodes.length;n++)if(K(t.childNodes[n],e))return t.childNodes[n]},et=(t,e,n)=>{n==="".concat(parseInt(n))&&(n=parseInt(n)),n||0===parseInt(n)?t.style[e]="number"==typeof n?"".concat(n,"px"):n:t.style.removeProperty(e)},nt=(t,e="flex")=>{t.style.display=e},ot=t=>{t.style.display="none"},it=(t,e,n,o)=>{const i=t.querySelector(e);i&&(i.style[n]=o)},st=(t,e,n)=>{e?nt(t,n):ot(t)},at=t=>!(!t||!(t.offsetWidth||t.offsetHeight||t.getClientRects().length)),rt=()=>!at(O())&&!at(L())&&!at(D()),ct=t=>!!(t.scrollHeight>t.clientHeight),lt=t=>{const e=window.getComputedStyle(t),n=parseFloat(e.getPropertyValue("animation-duration")||"0"),o=parseFloat(e.getPropertyValue("transition-duration")||"0");return n>0||o>0},ut=(t,e=!1)=>{const n=q();at(n)&&(e&&(n.style.transition="none",n.style.width="100%"),setTimeout((()=>{n.style.transition="width ".concat(t/1e3,"s linear"),n.style.width="0%"}),10))},dt=()=>{const t=q(),e=parseInt(window.getComputedStyle(t).width);t.style.removeProperty("transition"),t.style.width="100%";const n=parseInt(window.getComputedStyle(t).width),o=parseInt(e/n*100);t.style.removeProperty("transition"),t.style.width="".concat(o,"%")},pt=()=>"undefined"==typeof window||"undefined"==typeof document,mt='\n <div aria-labelledby="'.concat(y.title,'" aria-describedby="').concat(y["html-container"],'" class="').concat(y.popup,'" tabindex="-1">\n   <button type="button" class="').concat(y.close,'"></button>\n   <ul class="').concat(y["progress-steps"],'"></ul>\n   <div class="').concat(y.icon,'"></div>\n   <img class="').concat(y.image,'" />\n   <h2 class="').concat(y.title,'" id="').concat(y.title,'"></h2>\n   <div class="').concat(y["html-container"],'" id="').concat(y["html-container"],'"></div>\n   <input class="').concat(y.input,'" />\n   <input type="file" class="').concat(y.file,'" />\n   <div class="').concat(y.range,'">\n     <input type="range" />\n     <output></output>\n   </div>\n   <select class="').concat(y.select,'"></select>\n   <div class="').concat(y.radio,'"></div>\n   <label for="').concat(y.checkbox,'" class="').concat(y.checkbox,'">\n     <input type="checkbox" />\n     <span class="').concat(y.label,'"></span>\n   </label>\n   <textarea class="').concat(y.textarea,'"></textarea>\n   <div class="').concat(y["validation-message"],'" id="').concat(y["validation-message"],'"></div>\n   <div class="').concat(y.actions,'">\n     <div class="').concat(y.loader,'"></div>\n     <button type="button" class="').concat(y.confirm,'"></button>\n     <button type="button" class="').concat(y.deny,'"></button>\n     <button type="button" class="').concat(y.cancel,'"></button>\n   </div>\n   <div class="').concat(y.footer,'"></div>\n   <div class="').concat(y["timer-progress-bar-container"],'">\n     <div class="').concat(y["timer-progress-bar"],'"></div>\n   </div>\n </div>\n').replace(/(^|\n)\s*/g,""),gt=()=>{const t=v();return!!t&&(t.remove(),Q([document.documentElement,document.body],[y["no-backdrop"],y["toast-shown"],y["has-column"]]),!0)},ht=()=>{Io.isVisible()&&Io.resetValidationMessage()},ft=()=>{const t=A(),e=tt(t,y.input),n=tt(t,y.file),o=t.querySelector(".".concat(y.range," input")),i=t.querySelector(".".concat(y.range," output")),s=tt(t,y.select),a=t.querySelector(".".concat(y.checkbox," input")),r=tt(t,y.textarea);e.oninput=ht,n.onchange=ht,s.onchange=ht,a.onchange=ht,r.oninput=ht,o.oninput=()=>{ht(),i.value=o.value},o.onchange=()=>{ht(),o.nextSibling.value=o.value}},bt=t=>"string"==typeof t?document.querySelector(t):t,yt=t=>{const e=A();e.setAttribute("role",t.toast?"alert":"dialog"),e.setAttribute("aria-live",t.toast?"polite":"assertive"),t.toast||e.setAttribute("aria-modal","true")},wt=t=>{"rtl"===window.getComputedStyle(t).direction&&G(v(),y.rtl)},vt=t=>{const e=gt();if(pt())return void s("SweetAlert2 requires document to initialize");const n=document.createElement("div");n.className=y.container,e&&G(n,y["no-transition"]),_(n,mt);const o=bt(t.target);o.appendChild(n),yt(t),wt(o),ft()},Ct=(t,e)=>{t instanceof HTMLElement?e.appendChild(t):"object"==typeof t?kt(t,e):t&&_(e,t)},kt=(t,e)=>{t.jquery?At(e,t):_(e,t.toString())},At=(t,e)=>{if(t.textContent="",0 in e)for(let n=0;n in e;n++)t.appendChild(e[n].cloneNode(!0));else t.appendChild(e.cloneNode(!0))},Bt=(()=>{if(pt())return!1;const t=document.createElement("div"),e={WebkitAnimation:"webkitAnimationEnd",OAnimation:"oAnimationEnd oanimationend",animation:"animationend"};for(const n in e)if(Object.prototype.hasOwnProperty.call(e,n)&&void 0!==t.style[n])return e[n];return!1})(),xt=()=>{const t=document.createElement("div");t.className=y["scrollbar-measure"],document.body.appendChild(t);const e=t.getBoundingClientRect().width-t.clientWidth;return document.body.removeChild(t),e},Pt=(t,e)=>{const n=I(),o=M(),i=O(),s=L(),a=D();e.showConfirmButton||e.showDenyButton||e.showCancelButton||ot(n),$(n,e,"actions"),St(i,"confirm",e),St(s,"deny",e),St(a,"cancel",e),Et(i,s,a,e),e.reverseButtons&&(n.insertBefore(a,o),n.insertBefore(s,o),n.insertBefore(i,o)),_(o,e.loaderHtml),$(o,e,"loader")};function Et(t,e,n,o){if(!o.buttonsStyling)return Q([t,e,n],y.styled);G([t,e,n],y.styled),o.confirmButtonColor&&(t.style.backgroundColor=o.confirmButtonColor,G(t,y["default-outline"])),o.denyButtonColor&&(e.style.backgroundColor=o.denyButtonColor,G(e,y["default-outline"])),o.cancelButtonColor&&(n.style.backgroundColor=o.cancelButtonColor,G(n,y["default-outline"]))}function St(t,e,o){st(t,o["show".concat(n(e),"Button")],"inline-block"),_(t,o["".concat(e,"ButtonText")]),t.setAttribute("aria-label",o["".concat(e,"ButtonAriaLabel")]),t.className=y[e],$(t,o,"".concat(e,"Button")),G(t,o["".concat(e,"ButtonClass")])}function Tt(t,e){"string"==typeof e?t.style.background=e:e||G([document.documentElement,document.body],y["no-backdrop"])}function Ot(t,e){e in y?G(t,y[e]):(i('The "position" parameter is not valid, defaulting to "center"'),G(t,y.center))}function Lt(t,e){if(e&&"string"==typeof e){const n="grow-".concat(e);n in y&&G(t,y[n])}}const jt=(t,e)=>{const n=v();n&&(Tt(n,e.backdrop),Ot(n,e.position),Lt(n,e.grow),$(n,e,"container"))};var Mt={promise:new WeakMap,innerParams:new WeakMap,domCache:new WeakMap};const Dt=["input","file","range","select","radio","checkbox","textarea"],It=(t,e)=>{const n=A(),o=Mt.innerParams.get(t),i=!o||e.input!==o.input;Dt.forEach((t=>{const o=y[t],s=tt(n,o);Vt(t,e.inputAttributes),s.className=o,i&&ot(s)})),e.input&&(i&&Ht(e),Nt(e))},Ht=t=>{if(!zt[t.input])return s('Unexpected type of input! Expected "text", "email", "password", "number", "tel", "select", "radio", "checkbox", "textarea", "file" or "url", got "'.concat(t.input,'"'));const e=Rt(t.input),n=zt[t.input](e,t);nt(n),setTimeout((()=>{J(n)}))},qt=t=>{for(let e=0;e<t.attributes.length;e++){const n=t.attributes[e].name;["type","value","style"].includes(n)||t.removeAttribute(n)}},Vt=(t,e)=>{const n=Z(A(),t);if(n){qt(n);for(const t in e)n.setAttribute(t,e[t])}},Nt=t=>{const e=Rt(t.input);t.customClass&&G(e,t.customClass.input)},Ut=(t,e)=>{t.placeholder&&!e.inputPlaceholder||(t.placeholder=e.inputPlaceholder)},Ft=(t,e,n)=>{if(n.inputLabel){t.id=y.input;const o=document.createElement("label"),i=y["input-label"];o.setAttribute("for",t.id),o.className=i,G(o,n.customClass.inputLabel),o.innerText=n.inputLabel,e.insertAdjacentElement("beforebegin",o)}},Rt=t=>{const e=y[t]?y[t]:y.input;return tt(A(),e)},zt={};zt.text=zt.email=zt.password=zt.number=zt.tel=zt.url=(t,e)=>("string"==typeof e.inputValue||"number"==typeof e.inputValue?t.value=e.inputValue:p(e.inputValue)||i('Unexpected type of inputValue! Expected "string", "number" or "Promise", got "'.concat(typeof e.inputValue,'"')),Ft(t,t,e),Ut(t,e),t.type=e.input,t),zt.file=(t,e)=>(Ft(t,t,e),Ut(t,e),t),zt.range=(t,e)=>{const n=t.querySelector("input"),o=t.querySelector("output");return n.value=e.inputValue,n.type=e.input,o.value=e.inputValue,Ft(n,t,e),t},zt.select=(t,e)=>{if(t.textContent="",e.inputPlaceholder){const n=document.createElement("option");_(n,e.inputPlaceholder),n.value="",n.disabled=!0,n.selected=!0,t.appendChild(n)}return Ft(t,t,e),t},zt.radio=t=>(t.textContent="",t),zt.checkbox=(t,e)=>{const n=Z(A(),"checkbox");n.value=1,n.id=y.checkbox,n.checked=Boolean(e.inputValue);const o=t.querySelector("span");return _(o,e.inputPlaceholder),t},zt.textarea=(t,e)=>{t.value=e.inputValue,Ut(t,e),Ft(t,t,e);const n=t=>parseInt(window.getComputedStyle(t).marginLeft)+parseInt(window.getComputedStyle(t).marginRight);if("MutationObserver"in window){const e=parseInt(window.getComputedStyle(A()).width);new MutationObserver((()=>{const o=t.offsetWidth+n(t);A().style.width=o>e?"".concat(o,"px"):null})).observe(t,{attributes:!0,attributeFilter:["style"]})}return t};const Wt=(t,e)=>{const n=P();$(n,e,"htmlContainer"),e.html?(Ct(e.html,n),nt(n,"block")):e.text?(n.textContent=e.text,nt(n,"block")):ot(n),It(t,e)},_t=(t,e)=>{const n=H();st(n,e.footer),e.footer&&Ct(e.footer,n),$(n,e,"footer")},Kt=(t,e)=>{const n=V();_(n,e.closeButtonHtml),$(n,e,"closeButton"),st(n,e.showCloseButton),n.setAttribute("aria-label",e.closeButtonAriaLabel)},Yt=(t,e)=>{const n=Mt.innerParams.get(t),o=B();return n&&e.icon===n.icon?(Jt(o,e),void $t(o,e)):e.icon||e.iconHtml?e.icon&&-1===Object.keys(w).indexOf(e.icon)?(s('Unknown icon! Expected "success", "error", "warning", "info" or "question", got "'.concat(e.icon,'"')),ot(o)):(nt(o),Jt(o,e),$t(o,e),void G(o,e.showClass.icon)):ot(o)},$t=(t,e)=>{for(const n in w)e.icon!==n&&Q(t,w[n]);G(t,w[e.icon]),Xt(t,e),Zt(),$(t,e,"icon")},Zt=()=>{const t=A(),e=window.getComputedStyle(t).getPropertyValue("background-color"),n=t.querySelectorAll("[class^=swal2-success-circular-line], .swal2-success-fix");for(let o=0;o<n.length;o++)n[o].style.backgroundColor=e},Jt=(t,e)=>{t.textContent="",e.iconHtml?_(t,Gt(e.iconHtml)):"success"===e.icon?_(t,'\n      <div class="swal2-success-circular-line-left"></div>\n      <span class="swal2-success-line-tip"></span> <span class="swal2-success-line-long"></span>\n      <div class="swal2-success-ring"></div> <div class="swal2-success-fix"></div>\n      <div class="swal2-success-circular-line-right"></div>\n    '):"error"===e.icon?_(t,'\n      <span class="swal2-x-mark">\n        <span class="swal2-x-mark-line-left"></span>\n        <span class="swal2-x-mark-line-right"></span>\n      </span>\n    '):_(t,Gt({question:"?",warning:"!",info:"i"}[e.icon]))},Xt=(t,e)=>{if(e.iconColor){t.style.color=e.iconColor,t.style.borderColor=e.iconColor;for(const n of[".swal2-success-line-tip",".swal2-success-line-long",".swal2-x-mark-line-left",".swal2-x-mark-line-right"])it(t,n,"backgroundColor",e.iconColor);it(t,".swal2-success-ring","borderColor",e.iconColor)}},Gt=t=>'<div class="'.concat(y["icon-content"],'">').concat(t,"</div>"),Qt=(t,e)=>{const n=E();if(!e.imageUrl)return ot(n);nt(n,""),n.setAttribute("src",e.imageUrl),n.setAttribute("alt",e.imageAlt),et(n,"width",e.imageWidth),et(n,"height",e.imageHeight),n.className=y.image,$(n,e,"image")},te=t=>{const e=document.createElement("li");return G(e,y["progress-step"]),_(e,t),e},ee=t=>{const e=document.createElement("li");return G(e,y["progress-step-line"]),t.progressStepsDistance&&(e.style.width=t.progressStepsDistance),e},ne=(t,e)=>{const n=S();if(!e.progressSteps||0===e.progressSteps.length)return ot(n);nt(n),n.textContent="",e.currentProgressStep>=e.progressSteps.length&&i("Invalid currentProgressStep parameter, it should be less than progressSteps.length (currentProgressStep like JS arrays starts from 0)"),e.progressSteps.forEach(((t,o)=>{const i=te(t);if(n.appendChild(i),o===e.currentProgressStep&&G(i,y["active-progress-step"]),o!==e.progressSteps.length-1){const t=ee(e);n.appendChild(t)}}))},oe=(t,e)=>{const n=x();st(n,e.title||e.titleText,"block"),e.title&&Ct(e.title,n),e.titleText&&(n.innerText=e.titleText),$(n,e,"title")},ie=(t,e)=>{const n=v(),o=A();e.toast?(et(n,"width",e.width),o.style.width="100%",o.insertBefore(M(),B())):et(o,"width",e.width),et(o,"padding",e.padding),e.background&&(o.style.background=e.background),ot(T()),se(o,e)},se=(t,e)=>{t.className="".concat(y.popup," ").concat(at(t)?e.showClass.popup:""),e.toast?(G([document.documentElement,document.body],y["toast-shown"]),G(t,y.toast)):G(t,y.modal),$(t,e,"popup"),"string"==typeof e.customClass&&G(t,e.customClass),e.icon&&G(t,y["icon-".concat(e.icon)])},ae=(t,e)=>{ie(t,e),jt(t,e),ne(t,e),Yt(t,e),Qt(t,e),oe(t,e),Kt(t,e),Wt(t,e),Pt(t,e),_t(t,e),"function"==typeof e.didRender&&e.didRender(A())},re=()=>at(A()),ce=()=>O()&&O().click(),le=()=>L()&&L().click(),ue=()=>D()&&D().click();function de(...t){return new this(...t)}function pe(t){class e extends(this){_main(e,n){return super._main(e,Object.assign({},t,n))}}return e}const me=t=>{let e=A();e||Io.fire(),e=A();const n=M();R()?ot(B()):ge(e,t),nt(n),e.setAttribute("data-loading",!0),e.setAttribute("aria-busy",!0),e.focus()},ge=(t,e)=>{const n=I(),o=M();!e&&at(O())&&(e=O()),nt(n),e&&(ot(e),o.setAttribute("data-button-to-replace",e.className)),o.parentNode.insertBefore(o,e),G([t,n],y.loading)},he=100,fe={},be=()=>{fe.previousActiveElement&&fe.previousActiveElement.focus?(fe.previousActiveElement.focus(),fe.previousActiveElement=null):document.body&&document.body.focus()},ye=t=>new Promise((e=>{if(!t)return e();const n=window.scrollX,o=window.scrollY;fe.restoreFocusTimeout=setTimeout((()=>{be(),e()}),he),window.scrollTo(n,o)})),we=()=>fe.timeout&&fe.timeout.getTimerLeft(),ve=()=>{if(fe.timeout)return dt(),fe.timeout.stop()},Ce=()=>{if(fe.timeout){const t=fe.timeout.start();return ut(t),t}},ke=()=>{const t=fe.timeout;return t&&(t.running?ve():Ce())},Ae=t=>{if(fe.timeout){const e=fe.timeout.increase(t);return ut(e,!0),e}},Be=()=>fe.timeout&&fe.timeout.isRunning();let xe=!1;const Pe={};function Ee(t="data-swal-template"){Pe[t]=this,xe||(document.body.addEventListener("click",Se),xe=!0)}const Se=t=>{for(let e=t.target;e&&e!==document;e=e.parentNode)for(const t in Pe){const n=e.getAttribute(t);if(n)return void Pe[t].fire({template:n})}},Te={title:"",titleText:"",text:"",html:"",footer:"",icon:void 0,iconColor:void 0,iconHtml:void 0,template:void 0,toast:!1,showClass:{popup:"swal2-show",backdrop:"swal2-backdrop-show",icon:"swal2-icon-show"},hideClass:{popup:"swal2-hide",backdrop:"swal2-backdrop-hide",icon:"swal2-icon-hide"},customClass:{},target:"body",backdrop:!0,heightAuto:!0,allowOutsideClick:!0,allowEscapeKey:!0,allowEnterKey:!0,stopKeydownPropagation:!0,keydownListenerCapture:!1,showConfirmButton:!0,showDenyButton:!1,showCancelButton:!1,preConfirm:void 0,preDeny:void 0,confirmButtonText:"OK",confirmButtonAriaLabel:"",confirmButtonColor:void 0,denyButtonText:"No",denyButtonAriaLabel:"",denyButtonColor:void 0,cancelButtonText:"Cancel",cancelButtonAriaLabel:"",cancelButtonColor:void 0,buttonsStyling:!0,reverseButtons:!1,focusConfirm:!0,focusDeny:!1,focusCancel:!1,returnFocus:!0,showCloseButton:!1,closeButtonHtml:"&times;",closeButtonAriaLabel:"Close this dialog",loaderHtml:"",showLoaderOnConfirm:!1,showLoaderOnDeny:!1,imageUrl:void 0,imageWidth:void 0,imageHeight:void 0,imageAlt:"",timer:void 0,timerProgressBar:!1,width:void 0,padding:void 0,background:void 0,input:void 0,inputPlaceholder:"",inputLabel:"",inputValue:"",inputOptions:{},inputAutoTrim:!0,inputAttributes:{},inputValidator:void 0,returnInputValueOnDeny:!1,validationMessage:void 0,grow:!1,position:"center",progressSteps:[],currentProgressStep:void 0,progressStepsDistance:void 0,willOpen:void 0,didOpen:void 0,didRender:void 0,willClose:void 0,didClose:void 0,didDestroy:void 0,scrollbarPadding:!0},Oe=["allowEscapeKey","allowOutsideClick","background","buttonsStyling","cancelButtonAriaLabel","cancelButtonColor","cancelButtonText","closeButtonAriaLabel","closeButtonHtml","confirmButtonAriaLabel","confirmButtonColor","confirmButtonText","currentProgressStep","customClass","denyButtonAriaLabel","denyButtonColor","denyButtonText","didClose","didDestroy","footer","hideClass","html","icon","iconColor","iconHtml","imageAlt","imageHeight","imageUrl","imageWidth","progressSteps","returnFocus","reverseButtons","showCancelButton","showCloseButton","showConfirmButton","showDenyButton","text","title","titleText","willClose"],Le={},je=["allowOutsideClick","allowEnterKey","backdrop","focusConfirm","focusDeny","focusCancel","returnFocus","heightAuto","keydownListenerCapture"],Me=t=>Object.prototype.hasOwnProperty.call(Te,t),De=t=>-1!==Oe.indexOf(t),Ie=t=>Le[t],He=t=>{Me(t)||i('Unknown parameter "'.concat(t,'"'))},qe=t=>{je.includes(t)&&i('The parameter "'.concat(t,'" is incompatible with toasts'))},Ve=t=>{Ie(t)&&c(t,Ie(t))},Ne=t=>{!t.backdrop&&t.allowOutsideClick&&i('"allowOutsideClick" parameter requires `backdrop` parameter to be set to `true`');for(const e in t)He(e),t.toast&&qe(e),Ve(e)};var Ue=Object.freeze({isValidParameter:Me,isUpdatableParameter:De,isDeprecatedParameter:Ie,argsToParams:h,isVisible:re,clickConfirm:ce,clickDeny:le,clickCancel:ue,getContainer:v,getPopup:A,getTitle:x,getHtmlContainer:P,getImage:E,getIcon:B,getInputLabel:j,getCloseButton:V,getActions:I,getConfirmButton:O,getDenyButton:L,getCancelButton:D,getLoader:M,getFooter:H,getTimerProgressBar:q,getFocusableElements:U,getValidationMessage:T,isLoading:z,fire:de,mixin:pe,showLoading:me,enableLoading:me,getTimerLeft:we,stopTimer:ve,resumeTimer:Ce,toggleTimer:ke,increaseTimer:Ae,isTimerRunning:Be,bindClickHandler:Ee});function Fe(){const t=Mt.innerParams.get(this);if(!t)return;const e=Mt.domCache.get(this);ot(e.loader),R()?t.icon&&nt(B()):Re(e),Q([e.popup,e.actions],y.loading),e.popup.removeAttribute("aria-busy"),e.popup.removeAttribute("data-loading"),e.confirmButton.disabled=!1,e.denyButton.disabled=!1,e.cancelButton.disabled=!1}const Re=t=>{const e=t.popup.getElementsByClassName(t.loader.getAttribute("data-button-to-replace"));e.length?nt(e[0],"inline-block"):rt()&&ot(t.actions)};function ze(t){const e=Mt.innerParams.get(t||this),n=Mt.domCache.get(t||this);return n?Z(n.popup,e.input):null}const We=()=>{null===W.previousBodyPadding&&document.body.scrollHeight>window.innerHeight&&(W.previousBodyPadding=parseInt(window.getComputedStyle(document.body).getPropertyValue("padding-right")),document.body.style.paddingRight="".concat(W.previousBodyPadding+xt(),"px"))},_e=()=>{null!==W.previousBodyPadding&&(document.body.style.paddingRight="".concat(W.previousBodyPadding,"px"),W.previousBodyPadding=null)},Ke=()=>{if((/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream||"MacIntel"===navigator.platform&&navigator.maxTouchPoints>1)&&!K(document.body,y.iosfix)){const t=document.body.scrollTop;document.body.style.top="".concat(-1*t,"px"),G(document.body,y.iosfix),$e(),Ye()}},Ye=()=>{if(!navigator.userAgent.match(/(CriOS|FxiOS|EdgiOS|YaBrowser|UCBrowser)/i)){const t=44;A().scrollHeight>window.innerHeight-t&&(v().style.paddingBottom="".concat(t,"px"))}},$e=()=>{const t=v();let e;t.ontouchstart=t=>{e=Ze(t)},t.ontouchmove=t=>{e&&(t.preventDefault(),t.stopPropagation())}},Ze=t=>{const e=t.target,n=v();return!(Je(t)||Xe(t)||e!==n&&(ct(n)||"INPUT"===e.tagName||"TEXTAREA"===e.tagName||ct(P())&&P().contains(e)))},Je=t=>t.touches&&t.touches.length&&"stylus"===t.touches[0].touchType,Xe=t=>t.touches&&t.touches.length>1,Ge=()=>{if(K(document.body,y.iosfix)){const t=parseInt(document.body.style.top,10);Q(document.body,y.iosfix),document.body.style.top="",document.body.scrollTop=-1*t}},Qe=()=>{o(document.body.children).forEach((t=>{t===v()||t.contains(v())||(t.hasAttribute("aria-hidden")&&t.setAttribute("data-previous-aria-hidden",t.getAttribute("aria-hidden")),t.setAttribute("aria-hidden","true"))}))},tn=()=>{o(document.body.children).forEach((t=>{t.hasAttribute("data-previous-aria-hidden")?(t.setAttribute("aria-hidden",t.getAttribute("data-previous-aria-hidden")),t.removeAttribute("data-previous-aria-hidden")):t.removeAttribute("aria-hidden")}))};var en={swalPromiseResolve:new WeakMap};function nn(t,e,n,o){R()?ln(t,o):(ye(n).then((()=>ln(t,o))),fe.keydownTarget.removeEventListener("keydown",fe.keydownHandler,{capture:fe.keydownListenerCapture}),fe.keydownHandlerAdded=!1),/^((?!chrome|android).)*safari/i.test(navigator.userAgent)?(e.setAttribute("style","display:none !important"),e.removeAttribute("class"),e.innerHTML=""):e.remove(),F()&&(_e(),Ge(),tn()),on()}function on(){Q([document.documentElement,document.body],[y.shown,y["height-auto"],y["no-backdrop"],y["toast-shown"]])}function sn(t){const e=A();if(!e)return;t=an(t);const n=Mt.innerParams.get(this);if(!n||K(e,n.hideClass.popup))return;const o=en.swalPromiseResolve.get(this);Q(e,n.showClass.popup),G(e,n.hideClass.popup);const i=v();Q(i,n.showClass.backdrop),G(i,n.hideClass.backdrop),rn(this,e,n),o(t)}const an=t=>void 0===t?{isConfirmed:!1,isDenied:!1,isDismissed:!0}:Object.assign({isConfirmed:!1,isDenied:!1,isDismissed:!1},t),rn=(t,e,n)=>{const o=v(),i=Bt&&lt(e);"function"==typeof n.willClose&&n.willClose(e),i?cn(t,e,o,n.returnFocus,n.didClose):nn(t,o,n.returnFocus,n.didClose)},cn=(t,e,n,o,i)=>{fe.swalCloseEventFinishedCallback=nn.bind(null,t,n,o,i),e.addEventListener(Bt,(function(t){t.target===e&&(fe.swalCloseEventFinishedCallback(),delete fe.swalCloseEventFinishedCallback)}))},ln=(t,e)=>{setTimeout((()=>{"function"==typeof e&&e.bind(t.params)(),t._destroy()}))};function un(t,e,n){const o=Mt.domCache.get(t);e.forEach((t=>{o[t].disabled=n}))}function dn(t,e){if(!t)return!1;if("radio"===t.type){const n=t.parentNode.parentNode.querySelectorAll("input");for(let t=0;t<n.length;t++)n[t].disabled=e}else t.disabled=e}function pn(){un(this,["confirmButton","denyButton","cancelButton"],!1)}function mn(){un(this,["confirmButton","denyButton","cancelButton"],!0)}function gn(){return dn(this.getInput(),!1)}function hn(){return dn(this.getInput(),!0)}function fn(t){const e=Mt.domCache.get(this),n=Mt.innerParams.get(this);_(e.validationMessage,t),e.validationMessage.className=y["validation-message"],n.customClass&&n.customClass.validationMessage&&G(e.validationMessage,n.customClass.validationMessage),nt(e.validationMessage);const o=this.getInput();o&&(o.setAttribute("aria-invalid",!0),o.setAttribute("aria-describedby",y["validation-message"]),J(o),G(o,y.inputerror))}function bn(){const t=Mt.domCache.get(this);t.validationMessage&&ot(t.validationMessage);const e=this.getInput();e&&(e.removeAttribute("aria-invalid"),e.removeAttribute("aria-describedby"),Q(e,y.inputerror))}function yn(){return Mt.domCache.get(this).progressSteps}class wn{constructor(t,e){this.callback=t,this.remaining=e,this.running=!1,this.start()}start(){return this.running||(this.running=!0,this.started=new Date,this.id=setTimeout(this.callback,this.remaining)),this.remaining}stop(){return this.running&&(this.running=!1,clearTimeout(this.id),this.remaining-=new Date-this.started),this.remaining}increase(t){const e=this.running;return e&&this.stop(),this.remaining+=t,e&&this.start(),this.remaining}getTimerLeft(){return this.running&&(this.stop(),this.start()),this.remaining}isRunning(){return this.running}}var vn={email:(t,e)=>/^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9-]{2,24}$/.test(t)?Promise.resolve():Promise.resolve(e||"Invalid email address"),url:(t,e)=>/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/.test(t)?Promise.resolve():Promise.resolve(e||"Invalid URL")};function Cn(t){t.inputValidator||Object.keys(vn).forEach((e=>{t.input===e&&(t.inputValidator=vn[e])}))}function kn(t){(!t.target||"string"==typeof t.target&&!document.querySelector(t.target)||"string"!=typeof t.target&&!t.target.appendChild)&&(i('Target parameter is not valid, defaulting to "body"'),t.target="body")}function An(t){Cn(t),t.showLoaderOnConfirm&&!t.preConfirm&&i("showLoaderOnConfirm is set to true, but preConfirm is not defined.\nshowLoaderOnConfirm should be used together with preConfirm, see usage example:\nhttps://sweetalert2.github.io/#ajax-request"),kn(t),"string"==typeof t.title&&(t.title=t.title.split("\n").join("<br />")),vt(t)}const Bn=["swal-title","swal-html","swal-footer"],xn=t=>{const e="string"==typeof t.template?document.querySelector(t.template):t.template;if(!e)return{};const n=e.content;return jn(n),Object.assign(Pn(n),En(n),Sn(n),Tn(n),On(n),Ln(n,Bn))},Pn=t=>{const e={};return o(t.querySelectorAll("swal-param")).forEach((t=>{Mn(t,["name","value"]);const n=t.getAttribute("name");let o=t.getAttribute("value");"boolean"==typeof Te[n]&&"false"===o&&(o=!1),"object"==typeof Te[n]&&(o=JSON.parse(o)),e[n]=o})),e},En=t=>{const e={};return o(t.querySelectorAll("swal-button")).forEach((t=>{Mn(t,["type","color","aria-label"]);const o=t.getAttribute("type");e["".concat(o,"ButtonText")]=t.innerHTML,e["show".concat(n(o),"Button")]=!0,t.hasAttribute("color")&&(e["".concat(o,"ButtonColor")]=t.getAttribute("color")),t.hasAttribute("aria-label")&&(e["".concat(o,"ButtonAriaLabel")]=t.getAttribute("aria-label"))})),e},Sn=t=>{const e={},n=t.querySelector("swal-image");return n&&(Mn(n,["src","width","height","alt"]),n.hasAttribute("src")&&(e.imageUrl=n.getAttribute("src")),n.hasAttribute("width")&&(e.imageWidth=n.getAttribute("width")),n.hasAttribute("height")&&(e.imageHeight=n.getAttribute("height")),n.hasAttribute("alt")&&(e.imageAlt=n.getAttribute("alt"))),e},Tn=t=>{const e={},n=t.querySelector("swal-icon");return n&&(Mn(n,["type","color"]),n.hasAttribute("type")&&(e.icon=n.getAttribute("type")),n.hasAttribute("color")&&(e.iconColor=n.getAttribute("color")),e.iconHtml=n.innerHTML),e},On=t=>{const e={},n=t.querySelector("swal-input");n&&(Mn(n,["type","label","placeholder","value"]),e.input=n.getAttribute("type")||"text",n.hasAttribute("label")&&(e.inputLabel=n.getAttribute("label")),n.hasAttribute("placeholder")&&(e.inputPlaceholder=n.getAttribute("placeholder")),n.hasAttribute("value")&&(e.inputValue=n.getAttribute("value")));const i=t.querySelectorAll("swal-input-option");return i.length&&(e.inputOptions={},o(i).forEach((t=>{Mn(t,["value"]);const n=t.getAttribute("value"),o=t.innerHTML;e.inputOptions[n]=o}))),e},Ln=(t,e)=>{const n={};for(const o in e){const i=e[o],s=t.querySelector(i);s&&(Mn(s,[]),n[i.replace(/^swal-/,"")]=s.innerHTML.trim())}return n},jn=t=>{const e=Bn.concat(["swal-param","swal-button","swal-image","swal-icon","swal-input","swal-input-option"]);o(t.children).forEach((t=>{const n=t.tagName.toLowerCase();-1===e.indexOf(n)&&i("Unrecognized element <".concat(n,">"))}))},Mn=(t,e)=>{o(t.attributes).forEach((n=>{-1===e.indexOf(n.name)&&i(['Unrecognized attribute "'.concat(n.name,'" on <').concat(t.tagName.toLowerCase(),">."),"".concat(e.length?"Allowed attributes are: ".concat(e.join(", ")):"To set the value, use HTML within the element.")])}))},Dn=10,In=t=>{const e=v(),n=A();"function"==typeof t.willOpen&&t.willOpen(n);const o=window.getComputedStyle(document.body).overflowY;Nn(e,n,t),setTimeout((()=>{qn(e,n)}),Dn),F()&&(Vn(e,t.scrollbarPadding,o),Qe()),R()||fe.previousActiveElement||(fe.previousActiveElement=document.activeElement),"function"==typeof t.didOpen&&setTimeout((()=>t.didOpen(n))),Q(e,y["no-transition"])},Hn=t=>{const e=A();if(t.target!==e)return;const n=v();e.removeEventListener(Bt,Hn),n.style.overflowY="auto"},qn=(t,e)=>{Bt&&lt(e)?(t.style.overflowY="hidden",e.addEventListener(Bt,Hn)):t.style.overflowY="auto"},Vn=(t,e,n)=>{Ke(),e&&"hidden"!==n&&We(),setTimeout((()=>{t.scrollTop=0}))},Nn=(t,e,n)=>{G(t,n.showClass.backdrop),e.style.setProperty("opacity","0","important"),nt(e,"grid"),setTimeout((()=>{G(e,n.showClass.popup),e.style.removeProperty("opacity")}),Dn),G([document.documentElement,document.body],y.shown),n.heightAuto&&n.backdrop&&!n.toast&&G([document.documentElement,document.body],y["height-auto"])},Un=(t,e)=>{"select"===e.input||"radio"===e.input?_n(t,e):["text","email","number","tel","textarea"].includes(e.input)&&(u(e.inputValue)||p(e.inputValue))&&(me(O()),Kn(t,e))},Fn=(t,e)=>{const n=t.getInput();if(!n)return null;switch(e.input){case"checkbox":return Rn(n);case"radio":return zn(n);case"file":return Wn(n);default:return e.inputAutoTrim?n.value.trim():n.value}},Rn=t=>t.checked?1:0,zn=t=>t.checked?t.value:null,Wn=t=>t.files.length?null!==t.getAttribute("multiple")?t.files:t.files[0]:null,_n=(t,e)=>{const n=A(),o=t=>Yn[e.input](n,$n(t),e);u(e.inputOptions)||p(e.inputOptions)?(me(O()),d(e.inputOptions).then((e=>{t.hideLoading(),o(e)}))):"object"==typeof e.inputOptions?o(e.inputOptions):s("Unexpected type of inputOptions! Expected object, Map or Promise, got ".concat(typeof e.inputOptions))},Kn=(t,e)=>{const n=t.getInput();ot(n),d(e.inputValue).then((o=>{n.value="number"===e.input?parseFloat(o)||0:"".concat(o),nt(n),n.focus(),t.hideLoading()})).catch((e=>{s("Error in inputValue promise: ".concat(e)),n.value="",nt(n),n.focus(),t.hideLoading()}))},Yn={select:(t,e,n)=>{const o=tt(t,y.select),i=(t,e,o)=>{const i=document.createElement("option");i.value=o,_(i,e),i.selected=Zn(o,n.inputValue),t.appendChild(i)};e.forEach((t=>{const e=t[0],n=t[1];if(Array.isArray(n)){const t=document.createElement("optgroup");t.label=e,t.disabled=!1,o.appendChild(t),n.forEach((e=>i(t,e[1],e[0])))}else i(o,n,e)})),o.focus()},radio:(t,e,n)=>{const o=tt(t,y.radio);e.forEach((t=>{const e=t[0],i=t[1],s=document.createElement("input"),a=document.createElement("label");s.type="radio",s.name=y.radio,s.value=e,Zn(e,n.inputValue)&&(s.checked=!0);const r=document.createElement("span");_(r,i),r.className=y.label,a.appendChild(s),a.appendChild(r),o.appendChild(a)}));const i=o.querySelectorAll("input");i.length&&i[0].focus()}},$n=t=>{const e=[];return"undefined"!=typeof Map&&t instanceof Map?t.forEach(((t,n)=>{let o=t;"object"==typeof o&&(o=$n(o)),e.push([n,o])})):Object.keys(t).forEach((n=>{let o=t[n];"object"==typeof o&&(o=$n(o)),e.push([n,o])})),e},Zn=(t,e)=>e&&e.toString()===t.toString(),Jn=(t,e)=>{t.disableButtons(),e.input?Qn(t,e,"confirm"):oo(t,e,!0)},Xn=(t,e)=>{t.disableButtons(),e.returnInputValueOnDeny?Qn(t,e,"deny"):eo(t,e,!1)},Gn=(e,n)=>{e.disableButtons(),n(t.cancel)},Qn=(t,e,n)=>{const o=Fn(t,e);e.inputValidator?to(t,e,o,n):t.getInput().checkValidity()?"deny"===n?eo(t,e,o):oo(t,e,o):(t.enableButtons(),t.showValidationMessage(e.validationMessage))},to=(t,e,n,o)=>{t.disableInput(),Promise.resolve().then((()=>d(e.inputValidator(n,e.validationMessage)))).then((i=>{t.enableButtons(),t.enableInput(),i?t.showValidationMessage(i):"deny"===o?eo(t,e,n):oo(t,e,n)}))},eo=(t,e,n)=>{e.showLoaderOnDeny&&me(L()),e.preDeny?Promise.resolve().then((()=>d(e.preDeny(n,e.validationMessage)))).then((e=>{!1===e?t.hideLoading():t.closePopup({isDenied:!0,value:void 0===e?n:e})})):t.closePopup({isDenied:!0,value:n})},no=(t,e)=>{t.closePopup({isConfirmed:!0,value:e})},oo=(t,e,n)=>{e.showLoaderOnConfirm&&me(),e.preConfirm?(t.resetValidationMessage(),Promise.resolve().then((()=>d(e.preConfirm(n,e.validationMessage)))).then((e=>{at(T())||!1===e?t.hideLoading():no(t,void 0===e?n:e)}))):no(t,n)},io=(t,e,n,o)=>{e.keydownTarget&&e.keydownHandlerAdded&&(e.keydownTarget.removeEventListener("keydown",e.keydownHandler,{capture:e.keydownListenerCapture}),e.keydownHandlerAdded=!1),n.toast||(e.keydownHandler=e=>co(t,e,o),e.keydownTarget=n.keydownListenerCapture?window:A(),e.keydownListenerCapture=n.keydownListenerCapture,e.keydownTarget.addEventListener("keydown",e.keydownHandler,{capture:e.keydownListenerCapture}),e.keydownHandlerAdded=!0)},so=(t,e,n)=>{const o=U();if(o.length)return(e+=n)===o.length?e=0:-1===e&&(e=o.length-1),o[e].focus();A().focus()},ao=["ArrowRight","ArrowDown"],ro=["ArrowLeft","ArrowUp"],co=(t,e,n)=>{const o=Mt.innerParams.get(t);o&&(o.stopKeydownPropagation&&e.stopPropagation(),"Enter"===e.key?lo(t,e,o):"Tab"===e.key?uo(e,o):[...ao,...ro].includes(e.key)?po(e.key):"Escape"===e.key&&mo(e,o,n))},lo=(t,e,n)=>{if(!e.isComposing&&e.target&&t.getInput()&&e.target.outerHTML===t.getInput().outerHTML){if(["textarea","file"].includes(n.input))return;ce(),e.preventDefault()}},uo=(t,e)=>{const n=t.target,o=U();let i=-1;for(let s=0;s<o.length;s++)if(n===o[s]){i=s;break}t.shiftKey?so(e,i,-1):so(e,i,1),t.stopPropagation(),t.preventDefault()},po=t=>{if(![O(),L(),D()].includes(document.activeElement))return;const e=ao.includes(t)?"nextElementSibling":"previousElementSibling",n=document.activeElement[e];n&&n.focus()},mo=(e,n,o)=>{l(n.allowEscapeKey)&&(e.preventDefault(),o(t.esc))},go=(t,e,n)=>{Mt.innerParams.get(t).toast?ho(t,e,n):(bo(e),yo(e),wo(t,e,n))},ho=(e,n,o)=>{n.popup.onclick=()=>{const n=Mt.innerParams.get(e);n.showConfirmButton||n.showDenyButton||n.showCancelButton||n.showCloseButton||n.timer||n.input||o(t.close)}};let fo=!1;const bo=t=>{t.popup.onmousedown=()=>{t.container.onmouseup=function(e){t.container.onmouseup=void 0,e.target===t.container&&(fo=!0)}}},yo=t=>{t.container.onmousedown=()=>{t.popup.onmouseup=function(e){t.popup.onmouseup=void 0,(e.target===t.popup||t.popup.contains(e.target))&&(fo=!0)}}},wo=(e,n,o)=>{n.container.onclick=i=>{const s=Mt.innerParams.get(e);fo?fo=!1:i.target===n.container&&l(s.allowOutsideClick)&&o(t.backdrop)}};function vo(t,e={}){Ne(Object.assign({},e,t)),fe.currentInstance&&fe.currentInstance._destroy(),fe.currentInstance=this;const n=Co(t,e);An(n),Object.freeze(n),fe.timeout&&(fe.timeout.stop(),delete fe.timeout),clearTimeout(fe.restoreFocusTimeout);const o=Ao(this);return ae(this,n),Mt.innerParams.set(this,n),ko(this,o,n)}const Co=(t,e)=>{const n=xn(t),o=Object.assign({},Te,e,n,t);return o.showClass=Object.assign({},Te.showClass,o.showClass),o.hideClass=Object.assign({},Te.hideClass,o.hideClass),o},ko=(e,n,o)=>new Promise((i=>{const s=t=>{e.closePopup({isDismissed:!0,dismiss:t})};en.swalPromiseResolve.set(e,i),n.confirmButton.onclick=()=>Jn(e,o),n.denyButton.onclick=()=>Xn(e,o),n.cancelButton.onclick=()=>Gn(e,s),n.closeButton.onclick=()=>s(t.close),go(e,n,s),io(e,fe,o,s),Un(e,o),In(o),Bo(fe,o,s),xo(n,o),setTimeout((()=>{n.container.scrollTop=0}))})),Ao=t=>{const e={popup:A(),container:v(),actions:I(),confirmButton:O(),denyButton:L(),cancelButton:D(),loader:M(),closeButton:V(),validationMessage:T(),progressSteps:S()};return Mt.domCache.set(t,e),e},Bo=(t,e,n)=>{const o=q();ot(o),e.timer&&(t.timeout=new wn((()=>{n("timer"),delete t.timeout}),e.timer),e.timerProgressBar&&(nt(o),setTimeout((()=>{t.timeout&&t.timeout.running&&ut(e.timer)}))))},xo=(t,e)=>{if(!e.toast)return l(e.allowEnterKey)?void(Po(t,e)||so(e,-1,1)):Eo()},Po=(t,e)=>e.focusDeny&&at(t.denyButton)?(t.denyButton.focus(),!0):e.focusCancel&&at(t.cancelButton)?(t.cancelButton.focus(),!0):!(!e.focusConfirm||!at(t.confirmButton)||(t.confirmButton.focus(),0)),Eo=()=>{document.activeElement&&"function"==typeof document.activeElement.blur&&document.activeElement.blur()};function So(t){const e=A(),n=Mt.innerParams.get(this);if(!e||K(e,n.hideClass.popup))return i("You're trying to update the closed or closing popup, that won't work. Use the update() method in preConfirm parameter or show a new popup.");const o={};Object.keys(t).forEach((e=>{Io.isUpdatableParameter(e)?o[e]=t[e]:i('Invalid parameter to update: "'.concat(e,'". Updatable params are listed here: https://github.com/sweetalert2/sweetalert2/blob/master/src/utils/params.js\n\nIf you think this parameter should be updatable, request it here: https://github.com/sweetalert2/sweetalert2/issues/new?template=02_feature_request.md'))}));const s=Object.assign({},n,o);ae(this,s),Mt.innerParams.set(this,s),Object.defineProperties(this,{params:{value:Object.assign({},this.params,t),writable:!1,enumerable:!0}})}function To(){const t=Mt.domCache.get(this),e=Mt.innerParams.get(this);e&&(t.popup&&fe.swalCloseEventFinishedCallback&&(fe.swalCloseEventFinishedCallback(),delete fe.swalCloseEventFinishedCallback),fe.deferDisposalTimer&&(clearTimeout(fe.deferDisposalTimer),delete fe.deferDisposalTimer),"function"==typeof e.didDestroy&&e.didDestroy(),Oo(this))}const Oo=t=>{delete t.params,delete fe.keydownHandler,delete fe.keydownTarget,Lo(Mt),Lo(en)},Lo=t=>{for(const e in t)t[e]=new WeakMap};var jo=Object.freeze({hideLoading:Fe,disableLoading:Fe,getInput:ze,close:sn,closePopup:sn,closeModal:sn,closeToast:sn,enableButtons:pn,disableButtons:mn,enableInput:gn,disableInput:hn,showValidationMessage:fn,resetValidationMessage:bn,getProgressSteps:yn,_main:vo,update:So,_destroy:To});let Mo;class Do{constructor(...t){if("undefined"==typeof window)return;Mo=this;const e=Object.freeze(this.constructor.argsToParams(t));Object.defineProperties(this,{params:{value:e,writable:!1,enumerable:!0,configurable:!0}});const n=this._main(this.params);Mt.promise.set(this,n)}then(t){return Mt.promise.get(this).then(t)}finally(t){return Mt.promise.get(this).finally(t)}}Object.assign(Do.prototype,jo),Object.assign(Do,Ue),Object.keys(jo).forEach((t=>{Do[t]=function(...e){if(Mo)return Mo[t](...e)}})),Do.DismissReason=t,Do.version="11.0.18";const Io=Do;return Io.default=Io,Io}(),void 0!==t&&t.Sweetalert2&&(t.swal=t.sweetAlert=t.Swal=t.SweetAlert=t.Sweetalert2);var n=e.exports;return class{static install(t,e={}){var o;const i=n.mixin(e),s=function(...t){return i.fire.call(i,...t)};Object.assign(s,n),Object.keys(n).filter((t=>"function"==typeof n[t])).forEach((t=>{s[t]=i[t].bind(i)})),(null==(o=t.config)?void 0:o.globalProperties)&&!t.config.globalProperties.$swal?(t.config.globalProperties.$swal=s,t.provide("$swal",s)):Object.prototype.hasOwnProperty.call(t,"$swal")||(t.prototype.$swal=s,t.swal=s)}}}));


/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/bus.js":
/*!***************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/bus.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.esm.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var bus = new _vue["default"]();
var _default = bus;
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtChildRow.js":
/*!*********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtChildRow.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLChildRow = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLChildRow */ "./node_modules/vue-tables-2/compiled/components/renderless/RLChildRow.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtChildRow',
  props: ['row', 'index'],
  components: {
    RLChildRow: _RLChildRow["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-child-row", {
      attrs: {
        row: this.row,
        index: this.index
      },
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("tr", {
            "class": 'VueTables__child-row ' + props["class"]
          }, [h("td", {
            attrs: {
              colspan: props.colspan
            }
          }, [props.childRow])]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtChildRowToggler.js":
/*!****************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtChildRowToggler.js ***!
  \****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLChildRowToggler = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLChildRowToggler */ "./node_modules/vue-tables-2/compiled/components/renderless/RLChildRowToggler.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtChildRowToggler',
  props: ['rowId'],
  components: {
    RLChildRowToggler: _RLChildRowToggler["default"]
  },
  render: function render(h) {
    return h("r-l-child-row-toggler", {
      attrs: {
        "row-id": this.rowId
      },
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("td", {
            attrs: {
              tabindex: props.tabIndex
            },
            on: {
              "keypress": function keypress(e) {
                if (e.key === 'Enter') {
                  props.toggle();
                }
              },
              "click": props.toggle
            }
          }, [props.toggleable ? h("span", {
            "class": "VueTables__child-row-toggler " + props["class"]()
          }) : '']);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtClientTable.js":
/*!************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtClientTable.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _VtPerPageSelector = _interopRequireDefault(__webpack_require__(/*! ./VtPerPageSelector */ "./node_modules/vue-tables-2/compiled/components/VtPerPageSelector.js"));

var _VtTable = _interopRequireDefault(__webpack_require__(/*! ./VtTable */ "./node_modules/vue-tables-2/compiled/components/VtTable.js"));

var _VtPagination = _interopRequireDefault(__webpack_require__(/*! ./VtPagination */ "./node_modules/vue-tables-2/compiled/components/VtPagination.js"));

var _VtDropdownPagination = _interopRequireDefault(__webpack_require__(/*! ./VtDropdownPagination */ "./node_modules/vue-tables-2/compiled/components/VtDropdownPagination.js"));

var _VtGenericFilter = _interopRequireDefault(__webpack_require__(/*! ./VtGenericFilter */ "./node_modules/vue-tables-2/compiled/components/VtGenericFilter.js"));

var _VtColumnsDropdown = _interopRequireDefault(__webpack_require__(/*! ./VtColumnsDropdown */ "./node_modules/vue-tables-2/compiled/components/VtColumnsDropdown.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtClientTable',
  components: {
    VtPerPageSelector: _VtPerPageSelector["default"],
    VtTable: _VtTable["default"],
    VtPagination: _VtPagination["default"],
    VtDropdownPagination: _VtDropdownPagination["default"],
    VtColumnsDropdown: _VtColumnsDropdown["default"],
    VtGenericFilter: _VtGenericFilter["default"]
  },
  props: {
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    name: {
      type: String,
      required: false
    },
    options: {
      type: Object,
      required: false,
      "default": function _default() {
        return {};
      }
    }
  },
  methods: {
    setLoadingState: function setLoadingState(isLoading) {
      this.$refs.table.loading = isLoading;
    },
    setFilter: function setFilter(val) {
      this.$refs.table.setFilter(val);
    },
    setPage: function setPage(val) {
      this.$refs.table.setPage(val);
    },
    setOrder: function setOrder(column, asc) {
      this.$refs.table.setOrder(column, asc);
    },
    setLimit: function setLimit(limit) {
      this.$refs.table.setLimit(limit);
    },
    toggleChildRow: function toggleChildRow(rowId) {
      this.$refs.table.toggleChildRow(rowId);
    },
    getOpenChildRows: function getOpenChildRows() {
      var rows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      return this.$refs.table.getOpenChildRows(rows);
    },
    resetQuery: function resetQuery() {
      this.$refs.table.resetQuery();
    },
    setCustomFilters: function setCustomFilters(params) {
      var sendRequest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return this.$refs.table.setCustomFilters(params, sendRequest);
    }
  },
  computed: {
    filteredData: function filteredData() {
      return this.$refs.table.filteredData;
    },
    allFilteredData: function allFilteredData() {
      return this.$refs.table.allFilteredData;
    },
    filtersCount: function filtersCount() {
      return this.$refs.table.filtersCount;
    }
  },
  provide: function provide() {
    var _this = this;

    return {
      scopedSlots: function scopedSlots() {
        return _this.$scopedSlots;
      },
      slots: function slots() {
        return _this.$slots;
      }
    };
  },
  model: {
    prop: "data"
  },
  render: function render(h) {
    return h("r-l-client-table", {
      attrs: {
        data: this.data,
        columns: this.columns,
        name: this.name,
        options: this.options
      },
      ref: "table",
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("div", {
            "class": "VueTables VueTables--" + props.source
          }, [h("div", {
            "class": props.theme.row
          }, [h("div", {
            "class": props.theme.column
          }, [!props.opts.filterByColumn && props.opts.filterable ? h("div", {
            "class": "".concat(props.theme.field, " ").concat(props.theme.inline, " ").concat(props.theme.left, " VueTables__search")
          }, [props.slots.beforeFilter, h("vt-generic-filter", {
            ref: "genericFilter"
          }), props.slots.afterFilter]) : '', props.slots.afterFilterWrapper, props.perPageValues.length > 1 || props.opts.alwaysShowPerPageSelect ? h("div", {
            "class": "".concat(props.theme.field, " ").concat(props.theme.inline, " ").concat(props.theme.right, " VueTables__limit")
          }, [props.slots.beforeLimit, h("vt-per-page-selector"), props.slots.afterLimit]) : '', props.opts.pagination.dropdown && props.totalPages > 1 ? h("div", {
            "class": "VueTables__pagination-wrapper"
          }, [h("div", {
            "class": "".concat(props.theme.field, " ").concat(props.theme.inline, " ").concat(props.theme.right, " VueTables__dropdown-pagination")
          }, [h("vt-dropdown-pagination")])]) : '', props.opts.columnsDropdown ? h("div", {
            "class": "VueTables__columns-dropdown-wrapper ".concat(props.theme.right, " ").concat(props.theme.dropdown.container)
          }, [h("vt-columns-dropdown")]) : ''])]), props.slots.beforeTable, h("div", {
            "class": "table-responsive"
          }, [h("vt-table", {
            ref: "vt_table"
          })]), props.slots.afterTable, props.opts.pagination.show ? h("vt-pagination") : '']);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtColumnsDropdown.js":
/*!****************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtColumnsDropdown.js ***!
  \****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLColumnsDropdown = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLColumnsDropdown */ "./node_modules/vue-tables-2/compiled/components/renderless/RLColumnsDropdown.js"));

var _dropdownWrapper = _interopRequireDefault(__webpack_require__(/*! ./dropdown-wrapper */ "./node_modules/vue-tables-2/compiled/components/dropdown-wrapper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtColumnsDropdown',
  components: {
    RLColumnsDropdown: _RLColumnsDropdown["default"]
  },
  render: function render(h) {
    return h("r-l-columns-dropdown", {
      scopedSlots: {
        "default": function _default(props) {
          if (props.override) {
            return h(props.override, {
              attrs: {
                props: props
              }
            });
          }

          var content;
          var cols = props.origColumns.map(function (column) {
            content = h("a", {
              "class": props.theme.dropdown.item,
              attrs: {
                href: "#"
              },
              on: {
                "click": function click() {
                  return props.toggleColumn(column);
                }
              }
            }, [h("input", {
              attrs: {
                type: "checkbox",
                disabled: props.onlyColumn(column)
              },
              domProps: {
                "value": column,
                "checked": props.columns.includes(column)
              }
            }), props.getHeading(column)]);
            return props.theme.framework === 'bulma' ? content : h("li", [content]);
          });
          return h("div", {
            "class": "VueTables__columns-dropdown"
          }, [h("button", {
            attrs: {
              type: "button"
            },
            "class": "".concat(props.theme.button, " ").concat(props.theme.dropdown.trigger),
            on: {
              "click": props.toggleColumnsDropdown
            }
          }, [props.display('columns'), h("span", {
            "class": "".concat(props.theme.icon, " ").concat(props.theme.small)
          }, [h("i", {
            "class": props.theme.dropdown.caret
          })])]), (0, _dropdownWrapper["default"])(h, props.theme.dropdown, cols, props.displayColumnsDropdown)]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtDateFilter.js":
/*!***********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtDateFilter.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLDateFilter = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLDateFilter */ "./node_modules/vue-tables-2/compiled/components/renderless/RLDateFilter.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtDateFilter',
  props: ['column'],
  components: {
    RLDateFilter: _RLDateFilter["default"]
  },
  render: function render(h) {
    var _this = this;

    return h("r-l-date-filter", {
      attrs: {
        column: this.column
      },
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("div", {
            "class": "VueTables__date-filter",
            attrs: {
              id: 'VueTables__' + _this.column + '-filter'
            }
          }, [h("span", {
            "class": "VueTables__filter-placeholder"
          }, [props.placeholder])]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtDropdownPagination.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtDropdownPagination.js ***!
  \*******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLDropdownPagination = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLDropdownPagination */ "./node_modules/vue-tables-2/compiled/components/renderless/RLDropdownPagination.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VTDropdownPagination',
  components: {
    RLDropdownPagination: _RLDropdownPagination["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-dropdown-pagination", {
      scopedSlots: {
        "default": function _default(props) {
          var id = "VueTables__dropdown-pagination_" + props.name;
          var pages = [];

          for (var pag = 1; pag <= props.totalPages; pag++) {
            pages.push(h("option", {
              domProps: {
                "value": pag
              }
            }, [pag]));
          }

          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("select", {
            "class": "".concat(props.theme.select, " dropdown-pagination"),
            attrs: {
              name: "page",
              id: id
            },
            ref: "page",
            domProps: {
              "value": props.page
            },
            on: {
              "change": function change(e) {
                return props.setPage(e.target.value);
              }
            }
          }, [pages]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtFiltersRow.js":
/*!***********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtFiltersRow.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLFiltersRow = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLFiltersRow */ "./node_modules/vue-tables-2/compiled/components/renderless/RLFiltersRow.js"));

var _VtTextFilter = _interopRequireDefault(__webpack_require__(/*! ./VtTextFilter */ "./node_modules/vue-tables-2/compiled/components/VtTextFilter.js"));

var _VtListFilter = _interopRequireDefault(__webpack_require__(/*! ./VtListFilter */ "./node_modules/vue-tables-2/compiled/components/VtListFilter.js"));

var _VtDateFilter = _interopRequireDefault(__webpack_require__(/*! ./VtDateFilter */ "./node_modules/vue-tables-2/compiled/components/VtDateFilter.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default2 = {
  name: 'VtFiltersRow',
  components: {
    RLFiltersRow: _RLFiltersRow["default"],
    VtTextFilter: _VtTextFilter["default"],
    VtListFilter: _VtListFilter["default"],
    VtDateFilter: _VtDateFilter["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-filters-row", {
      scopedSlots: {
        "default": function _default(props) {
          var filters = [];
          if (props.hasChildRow && props.opts.childRowTogglerFirst && props.opts.showChildRowToggler) filters.push(h("th"));
          props.columns.map(function (column) {
            var filter = '';

            if (props.filterable(column)) {
              filter = h(props.filterType(column), {
                props: {
                  column: column
                }
              });
            }

            if (typeof props.slots["filter__".concat(column)] !== 'undefined') {
              filter = filter ? h("div", [filter, props.slots["filter__".concat(column)]]) : props.slots["filter__".concat(column)];
            }

            filters.push(h("th", {
              "class": props.columnClass(column)
            }, [!!filter ? h("div", _defineProperty({
              "class": "VueTables__column-filter"
            }, "class", 'VueTables__' + column + '-filter-wrapper'), [filter]) : '']));
          });
          if (props.hasChildRow && !props.opts.childRowTogglerFirst && props.opts.showChildRowToggler) filters.push(h("th"));
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("tr", {
            "class": "VueTables__filters-row"
          }, [filters]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtGenericFilter.js":
/*!**************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtGenericFilter.js ***!
  \**************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLGenericFilter = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLGenericFilter */ "./node_modules/vue-tables-2/compiled/components/renderless/RLGenericFilter.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtGenericFilter',
  components: {
    RLGenericFilter: _RLGenericFilter["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-generic-filter", {
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("div", {
            "class": "VueTables__search-field"
          }, [h("label", {
            attrs: {
              "for": "VueTables__search_".concat(props.id)
            },
            "class": props.theme.label
          }, [props.display("filter")]), h("input", {
            "class": "VueTables__search__input ".concat(props.theme.input, " ").concat(props.theme.small),
            ref: "filter",
            attrs: {
              type: "text",
              placeholder: props.display('filterPlaceholder'),
              id: "VueTables__search_".concat(props.id),
              autocomplete: "off"
            },
            on: {
              "keyup": props.search(props.opts.debounce)
            }
          })]);
        }
      }
    });
  },
  methods: {
    focus: function focus() {
      this.$refs.filter.focus();
    },
    blur: function blur() {
      this.$refs.filter.blur();
    }
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtGroupRow.js":
/*!*********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtGroupRow.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLGroupRow = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLGroupRow */ "./node_modules/vue-tables-2/compiled/components/renderless/RLGroupRow.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtGroupRow',
  components: {
    RLGroupRow: _RLGroupRow["default"]
  },
  props: ['row'],
  render: function render() {
    var h = arguments[0];
    return h("r-l-group-row", {
      attrs: {
        row: this.row
      },
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("tr", {
            "class": props.theme.groupTr,
            on: {
              "click": props.toggleGroupDirection
            }
          }, [h("td", {
            attrs: {
              colspan: props.colspan
            }
          }, [props.canToggleGroup ? h("button", {
            "class": props.theme.button,
            on: {
              "click": props.toggleGroup.bind(this, props.groupValue)
            }
          }, [props.groupValue, h("span", {
            "class": props.groupToggleIcon(props.groupValue)
          })]) : '', !props.canToggleGroup ? h("span", [props.groupValue]) : '', props.slot])]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtHeadingsRow.js":
/*!************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtHeadingsRow.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLHeadingsRow = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLHeadingsRow */ "./node_modules/vue-tables-2/compiled/components/renderless/RLHeadingsRow.js"));

var _VtTableHeading = _interopRequireDefault(__webpack_require__(/*! ./VtTableHeading */ "./node_modules/vue-tables-2/compiled/components/VtTableHeading.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtHeadingsRow',
  components: {
    RLHeadingsRow: _RLHeadingsRow["default"],
    VtTableHeading: _VtTableHeading["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-headings-row", {
      scopedSlots: {
        "default": function _default(props) {
          if (props.override) {
            return h(props.override, {
              attrs: {
                props: props
              }
            });
          }

          var headings = [];

          if (props.childRowTogglerFirst) {
            headings.push(h("th"));
          }

          props.columns.map(function (column) {
            headings.push(h("vt-table-heading", {
              attrs: {
                column: column
              }
            }));
          });

          if (props.childRowTogglerLast) {
            headings.push(h("th"));
          }

          return h("tr", [headings]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtListFilter.js":
/*!***********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtListFilter.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLListFilter = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLListFilter */ "./node_modules/vue-tables-2/compiled/components/renderless/RLListFilter.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtListFilter',
  props: ['column'],
  components: {
    RLListFilter: _RLListFilter["default"]
  },
  render: function render() {
    var _this = this;

    var h = arguments[0];
    return h("r-l-list-filter", {
      attrs: {
        column: this.column
      },
      scopedSlots: {
        "default": function _default(props) {
          var options = [];
          var selected;
          props.items.map(function (option) {
            selected = String(option.id) === String(props.query[_this.column]) && props.query[_this.column] !== '';
            options.push(h("option", {
              domProps: {
                "value": option.id,
                "selected": selected
              }
            }, [option.text]));
          });
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("div", {
            "class": "VueTables__list-filter",
            attrs: {
              id: 'VueTables__' + _this.column + '-filter'
            }
          }, [h("select", {
            "class": props.theme.select,
            on: {
              "change": props.search(false)
            },
            attrs: {
              name: props.name
            },
            domProps: {
              "value": props.value
            }
          }, [h("option", {
            attrs: {
              value: ""
            }
          }, [props.defaultOption]), options])]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtNoResultsRow.js":
/*!*************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtNoResultsRow.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLNoResultsRow = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLNoResultsRow */ "./node_modules/vue-tables-2/compiled/components/renderless/RLNoResultsRow.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtNoResultsRow',
  components: {
    RLNoResultsRow: _RLNoResultsRow["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-no-results-row", {
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("tr", {
            "class": "VueTables__no-results"
          }, [h("td", {
            "class": "text-center",
            attrs: {
              tabindex: props.tabIndex,
              colspan: props.colspan
            }
          }, [props.display(props.message)])]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtPagination.js":
/*!***********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtPagination.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLPagination = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLPagination */ "./node_modules/vue-tables-2/compiled/components/renderless/RLPagination.js"));

var _vuePagination = _interopRequireDefault(__webpack_require__(/*! vue-pagination-2 */ "./node_modules/vue-pagination-2/compiled/main.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtPagination',
  components: {
    RLPagination: _RLPagination["default"],
    Pagination: _vuePagination["default"]
  },
  render: function render(h) {
    return h("r-l-pagination", {
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("pagination", {
            attrs: {
              options: props.optionsObj,
              records: props.records,
              "per-page": props.perPage,
              value: props.page
            },
            on: {
              "input": function input(page) {
                return props.setPage(page);
              }
            }
          });
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtPerPageSelector.js":
/*!****************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtPerPageSelector.js ***!
  \****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLPerPageSelector = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLPerPageSelector */ "./node_modules/vue-tables-2/compiled/components/renderless/RLPerPageSelector.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtPerPageSelector',
  components: {
    RLPerPageSelector: _RLPerPageSelector["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-per-page-selector", {
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("div", {
            "class": "VueTables__limit-field"
          }, [h("label", {
            "class": props.labelClass,
            attrs: {
              "for": "VueTables__limit_".concat(props.id)
            }
          }, [props.display('limit')]), h("select", {
            attrs: {
              id: props.selectAttrs.id
            },
            "class": props.selectAttrs["class"],
            on: {
              "change": props.selectEvents.change
            }
          }, [props.perPageValues.map(function (val) {
            return h("option", {
              domProps: {
                "value": val,
                "selected": val === props.selectAttrs.value
              }
            }, [val]);
          })])]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtServerTable.js":
/*!************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtServerTable.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _VtPerPageSelector = _interopRequireDefault(__webpack_require__(/*! ./VtPerPageSelector */ "./node_modules/vue-tables-2/compiled/components/VtPerPageSelector.js"));

var _VtTable = _interopRequireDefault(__webpack_require__(/*! ./VtTable */ "./node_modules/vue-tables-2/compiled/components/VtTable.js"));

var _VtPagination = _interopRequireDefault(__webpack_require__(/*! ./VtPagination */ "./node_modules/vue-tables-2/compiled/components/VtPagination.js"));

var _VtDropdownPagination = _interopRequireDefault(__webpack_require__(/*! ./VtDropdownPagination */ "./node_modules/vue-tables-2/compiled/components/VtDropdownPagination.js"));

var _VtGenericFilter = _interopRequireDefault(__webpack_require__(/*! ./VtGenericFilter */ "./node_modules/vue-tables-2/compiled/components/VtGenericFilter.js"));

var _VtColumnsDropdown = _interopRequireDefault(__webpack_require__(/*! ./VtColumnsDropdown */ "./node_modules/vue-tables-2/compiled/components/VtColumnsDropdown.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtServerTable',
  components: {
    VtPerPageSelector: _VtPerPageSelector["default"],
    VtTable: _VtTable["default"],
    VtPagination: _VtPagination["default"],
    VtDropdownPagination: _VtDropdownPagination["default"],
    VtColumnsDropdown: _VtColumnsDropdown["default"],
    VtGenericFilter: _VtGenericFilter["default"]
  },
  props: {
    columns: {
      type: Array,
      required: true
    },
    url: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    },
    options: {
      type: Object,
      required: false,
      "default": function _default() {
        return {};
      }
    }
  },
  computed: {
    customQueries: {
      get: function get() {
        return this.$refs.table.customQueries;
      },
      set: function set(val) {
        this.$refs.table.customQueries = val;
      }
    },
    data: function data() {
      return this.$refs.table.tableData;
    },
    filtersCount: function filtersCount() {
      return this.$refs.table.filtersCount;
    }
  },
  methods: {
    refresh: function refresh() {
      this.$refs.table.refresh();
    },
    getData: function getData() {
      return this.$refs.table.getData();
    },
    setFilter: function setFilter(val) {
      this.$refs.table.setFilter(val);
    },
    setPage: function setPage(val) {
      this.$refs.table.setPage(val);
    },
    setOrder: function setOrder(column, asc) {
      this.$refs.table.setOrder(column, asc);
    },
    setLimit: function setLimit(limit) {
      this.$refs.table.setLimit(limit);
    },
    toggleChildRow: function toggleChildRow(rowId) {
      this.$refs.table.toggleChildRow(rowId);
    },
    getOpenChildRows: function getOpenChildRows() {
      var rows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      return this.$refs.table.getOpenChildRows(rows);
    },
    getResponseData: function getResponseData(response) {
      return this.$refs.table.getResponseData(response);
    },
    resetQuery: function resetQuery() {
      this.$refs.table.resetQuery();
    },
    getRequestParams: function getRequestParams() {
      return this.$refs.table.getRequestParams();
    },
    setRequestParams: function setRequestParams(params) {
      var sendRequest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      return this.$refs.table.setRequestParams(params, sendRequest);
    },
    setCustomFilters: function setCustomFilters(params) {
      var sendRequest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      return this.$refs.table.setCustomFilters(params, sendRequest);
    },
    resetCustomFilters: __webpack_require__(/*! ../methods/reset-custom-filters */ "./node_modules/vue-tables-2/compiled/methods/reset-custom-filters.js")
  },
  provide: function provide() {
    var _this = this;

    return {
      scopedSlots: function scopedSlots() {
        return _this.$scopedSlots;
      },
      slots: function slots() {
        return _this.$slots;
      }
    };
  },
  model: {
    prop: "data"
  },
  render: function render(h) {
    return h("r-l-server-table", {
      attrs: {
        url: this.url,
        columns: this.columns,
        name: this.name,
        options: this.options
      },
      ref: "table",
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("div", {
            "class": "VueTables VueTables--" + props.source
          }, [h("div", {
            "class": props.theme.row
          }, [h("div", {
            "class": props.theme.column
          }, [!props.opts.filterByColumn && props.opts.filterable ? h("div", {
            "class": "".concat(props.theme.field, " ").concat(props.theme.inline, " ").concat(props.theme.left, " VueTables__search")
          }, [props.slots.beforeFilter, h("vt-generic-filter", {
            ref: "genericFilter"
          }), props.slots.afterFilter]) : '', props.slots.afterFilterWrapper, props.perPageValues.length > 1 || props.opts.alwaysShowPerPageSelect ? h("div", {
            "class": "".concat(props.theme.field, " ").concat(props.theme.inline, " ").concat(props.theme.right, " VueTables__limit")
          }, [props.slots.beforeLimit, h("vt-per-page-selector"), props.slots.afterLimit]) : '', props.opts.pagination.dropdown && props.totalPages > 1 ? h("div", {
            "class": "VueTables__pagination-wrapper"
          }, [h("div", {
            "class": "".concat(props.theme.field, " ").concat(props.theme.inline, " ").concat(props.theme.right, " VueTables__dropdown-pagination")
          }, [h("vt-dropdown-pagination")])]) : '', props.opts.columnsDropdown ? h("div", {
            "class": "VueTables__columns-dropdown-wrapper ".concat(props.theme.right, " ").concat(props.theme.dropdown.container)
          }, [h("vt-columns-dropdown")]) : ''])]), props.slots.beforeTable, h("div", {
            "class": "table-responsive"
          }, [h("vt-table", {
            ref: "vt_table"
          })]), props.slots.afterTable, props.opts.pagination.show ? h("vt-pagination") : '']);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtSortControl.js":
/*!************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtSortControl.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLSortControl = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLSortControl */ "./node_modules/vue-tables-2/compiled/components/renderless/RLSortControl.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtSortControl',
  components: {
    RLSortControl: _RLSortControl["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-sort-control", {
      scopedSlots: {
        "default": function _default(props) {
          return props.sortable ? props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("span", {
            "class": props["class"]
          }) : '';
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtTable.js":
/*!******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtTable.js ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLTable = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLTable */ "./node_modules/vue-tables-2/compiled/components/renderless/RLTable.js"));

var _VtTableHead = _interopRequireDefault(__webpack_require__(/*! ./VtTableHead */ "./node_modules/vue-tables-2/compiled/components/VtTableHead.js"));

var _VtTableBody = _interopRequireDefault(__webpack_require__(/*! ./VtTableBody */ "./node_modules/vue-tables-2/compiled/components/VtTableBody.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtTable',
  components: {
    RLTable: _RLTable["default"],
    VtTableHead: _VtTableHead["default"],
    VtTableBody: _VtTableBody["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-table", {
      scopedSlots: {
        "default": function _default(props) {
          var caption = props.caption ? h("caption", [props.caption]) : '';
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("table", {
            "class": props.tableAttrs["class"],
            attrs: {
              summary: props.tableAttrs.summary
            }
          }, [caption, h("vt-table-head"), props.slots.beforeBody, h("vt-table-body", {
            ref: "vt_table_body"
          }), props.slots.afterBody]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtTableBody.js":
/*!**********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtTableBody.js ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLTableBody = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLTableBody */ "./node_modules/vue-tables-2/compiled/components/renderless/RLTableBody.js"));

var _VtNoResultsRow = _interopRequireDefault(__webpack_require__(/*! ./VtNoResultsRow */ "./node_modules/vue-tables-2/compiled/components/VtNoResultsRow.js"));

var _VtTableRow = _interopRequireDefault(__webpack_require__(/*! ./VtTableRow */ "./node_modules/vue-tables-2/compiled/components/VtTableRow.js"));

var _VtGroupRow = _interopRequireDefault(__webpack_require__(/*! ./VtGroupRow */ "./node_modules/vue-tables-2/compiled/components/VtGroupRow.js"));

var _VtChildRow = _interopRequireDefault(__webpack_require__(/*! ./VtChildRow */ "./node_modules/vue-tables-2/compiled/components/VtChildRow.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtTableBody',
  components: {
    RLTableBody: _RLTableBody["default"],
    VtNoResultsRow: _VtNoResultsRow["default"],
    VtTableRow: _VtTableRow["default"],
    VtChildRow: _VtChildRow["default"],
    VtGroupRow: _VtGroupRow["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-table-body", {
      scopedSlots: {
        "default": function _default(props) {
          var rows = [];
          var currentGroup;
          props.data.forEach(function (row, index) {
            if (props.groupBy && props.source === 'client' && row[props.groupBy] !== currentGroup) {
              rows.push(h("vt-group-row", {
                attrs: {
                  row: row
                }
              }));
              currentGroup = row[props.groupBy];
            }

            if (props.canToggleGroups && props.collapsedGroups.includes(currentGroup)) {
              return;
            }

            rows.push(h("vt-table-row", {
              attrs: {
                row: row,
                index: props.initialIndex + index + 1
              }
            }));

            if (props.hasChildRow && props.openChildRows.includes(row[props.uniqueRowId])) {
              rows.push(h("vt-child-row", {
                attrs: {
                  row: row,
                  index: props.initialIndex + index + 1
                }
              }));
            }
          });
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("tbody", [props.slots.prependBody, props.data.length === 0 ? h("vt-no-results-row") : '', rows, props.slots.appendBody]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtTableCell.js":
/*!**********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtTableCell.js ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLTableCell = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLTableCell */ "./node_modules/vue-tables-2/compiled/components/renderless/RLTableCell.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtTableCell',
  props: ['column'],
  components: {
    RLTableCell: _RLTableCell["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-table-cell", {
      attrs: {
        column: this.column
      },
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("td", {
            attrs: {
              tabindex: props.tabIndex
            },
            "class": props.classes
          }, [props.content]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtTableHead.js":
/*!**********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtTableHead.js ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLTableHead = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLTableHead */ "./node_modules/vue-tables-2/compiled/components/renderless/RLTableHead.js"));

var _VtHeadingsRow = _interopRequireDefault(__webpack_require__(/*! ./VtHeadingsRow */ "./node_modules/vue-tables-2/compiled/components/VtHeadingsRow.js"));

var _VtFiltersRow = _interopRequireDefault(__webpack_require__(/*! ./VtFiltersRow */ "./node_modules/vue-tables-2/compiled/components/VtFiltersRow.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtTableHead',
  components: {
    RLTableHead: _RLTableHead["default"],
    VtHeadingsRow: _VtHeadingsRow["default"],
    VtFiltersRow: _VtFiltersRow["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-table-head", {
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("thead", [props.slots.prependHead, h("vt-headings-row"), props.slots.beforeFilters, props.opts.filterByColumn && props.opts.filterable ? h("vt-filters-row") : '', props.slots.afterFilters]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtTableHeading.js":
/*!*************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtTableHeading.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLTableHeading = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLTableHeading */ "./node_modules/vue-tables-2/compiled/components/renderless/RLTableHeading.js"));

var _VtSortControl = _interopRequireDefault(__webpack_require__(/*! ./VtSortControl */ "./node_modules/vue-tables-2/compiled/components/VtSortControl.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtTableHeading',
  props: ['column'],
  components: {
    RLTableHeading: _RLTableHeading["default"],
    VtSortControl: _VtSortControl["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-table-heading", {
      attrs: {
        column: this.column
      },
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("th", {
            on: {
              "keypress": props.thEvents.keypress,
              "click": props.thEvents.click
            },
            "class": props.thAttrs["class"],
            attrs: {
              title: props.thAttrs.title,
              tabindex: props.thAttrs.tabIndex
            }
          }, [h("span", {
            "class": "VueTables__heading",
            attrs: {
              title: props.title
            }
          }, [props.heading]), h("vt-sort-control")]);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtTableRow.js":
/*!*********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtTableRow.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _babelHelperVueJsxMergeProps = _interopRequireDefault(__webpack_require__(/*! babel-helper-vue-jsx-merge-props */ "./node_modules/babel-helper-vue-jsx-merge-props/index.js"));

var _RLTableRow = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLTableRow */ "./node_modules/vue-tables-2/compiled/components/renderless/RLTableRow.js"));

var _VtTableCell = _interopRequireDefault(__webpack_require__(/*! ./VtTableCell */ "./node_modules/vue-tables-2/compiled/components/VtTableCell.js"));

var _VtChildRowToggler = _interopRequireDefault(__webpack_require__(/*! ./VtChildRowToggler */ "./node_modules/vue-tables-2/compiled/components/VtChildRowToggler.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtTableRow',
  props: ['row', 'index'],
  components: {
    RLTableRow: _RLTableRow["default"],
    VtTableCell: _VtTableCell["default"],
    VtChildRowToggler: _VtChildRowToggler["default"]
  },
  render: function render() {
    var h = arguments[0];
    return h("r-l-table-row", {
      attrs: {
        row: this.row,
        index: this.index
      },
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("tr", (0, _babelHelperVueJsxMergeProps["default"])([{
            "class": "VueTables__row " + props.rowAttrs["class"]
          }, {
            attrs: props.rowAttrs.attrs
          }, {
            on: {
              "click": props.rowEvents.click,
              "dblclick": props.rowEvents.click
            }
          }]), [props.childRowTogglerFirst ? h("vt-child-row-toggler", {
            attrs: {
              "row-id": props.rowId
            }
          }) : '', props.columns.map(function (column) {
            return h("vt-table-cell", {
              attrs: {
                column: column
              }
            });
          }), props.childRowTogglerLast ? h("vt-child-row-toggler", {
            attrs: {
              "row-id": props.rowId
            }
          }) : '']);
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/VtTextFilter.js":
/*!***********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/VtTextFilter.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _RLTextFilter = _interopRequireDefault(__webpack_require__(/*! ./renderless/RLTextFilter */ "./node_modules/vue-tables-2/compiled/components/renderless/RLTextFilter.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default2 = {
  name: 'VtTextFilter',
  props: ['column'],
  components: {
    RLTextFilter: _RLTextFilter["default"]
  },
  render: function render() {
    var _this = this;

    var h = arguments[0];
    return h("r-l-text-filter", {
      attrs: {
        column: this.column
      },
      scopedSlots: {
        "default": function _default(props) {
          return props.override ? h(props.override, {
            attrs: {
              props: props
            }
          }) : h("input", {
            on: {
              "keyup": props.search(props.debounce)
            },
            "class": props.theme.input,
            attrs: {
              name: props.getColumnName(_this.column),
              type: "text",
              placeholder: props.display('filterBy', {
                column: props.getHeading(_this.column)
              }),
              autocomplete: "off"
            }
          });
        }
      }
    });
  }
};
exports["default"] = _default2;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/dropdown-wrapper.js":
/*!***************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/dropdown-wrapper.js ***!
  \***************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (h, classes, columns, display) {
  if (classes.framework === 'bulma') {
    return h("div", {
      "class": classes.menu,
      style: display ? 'display:block' : 'display:none'
    }, [h("div", {
      "class": classes.content
    }, [columns])]);
  }

  if (classes.framework === 'bootstrap4') {
    return h("div", {
      "class": classes.menu,
      style: display ? 'display:block' : 'display:none'
    }, [columns]);
  }

  return h("ul", {
    "class": classes.menu,
    style: display ? 'display:block' : 'display:none'
  }, [columns]);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLChildRow.js":
/*!********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLChildRow.js ***!
  \********************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLChildRow',
  props: ['row', 'index'],
  inject: ['colspan', 'scopedSlots', 'getChildRowTemplate', 'opts', 'componentsOverride'],
  render: function render(h) {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      childRow: this.getChildRowTemplate(h, this.row, this.index, this.scopedSlots()['child_row']),
      colspan: this.colspan(),
      "class": this.opts().rowClassCallback ? this.opts().rowClassCallback(this.row) : '',
      override: this.componentsOverride.childRow
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLChildRowToggler.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLChildRowToggler.js ***!
  \***************************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLChildRowToggler',
  props: ['rowId'],
  inject: ['toggleChildRow', 'opts', 'childRowTogglerClass', 'componentsOverride', 'tabIndex', 'row'],
  render: function render(h) {
    var toggleable = this.isToggleable(this.opts().disabledChildRows);
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      "class": this.childRowTogglerClass.bind(this, this.rowId),
      toggle: toggleable ? this.toggleChildRow.bind(this, this.rowId) : function () {},
      override: this.componentsOverride.childRowToggler,
      tabIndex: this.tabIndex(),
      toggleable: toggleable
    });
  },
  methods: {
    isToggleable: function isToggleable(callback) {
      if (!callback) {
        return true;
      }

      return !callback(this.row());
    }
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLColumnsDropdown.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLColumnsDropdown.js ***!
  \***************************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLColumnsDropdown',
  inject: ['getHeading', 'display', 'opts', 'theme', 'allColumns', 'onlyColumn', 'toggleColumn', 'toggleColumnsDropdown', 'displayColumnsDropdown', 'origColumns', 'componentsOverride'],
  render: function render() {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      theme: this.theme,
      getHeading: this.getHeading,
      display: this.display,
      onlyColumn: this.onlyColumn,
      toggleColumn: this.toggleColumn,
      toggleColumnsDropdown: this.toggleColumnsDropdown,
      displayColumnsDropdown: this.displayColumnsDropdown(),
      origColumns: this.origColumns,
      columns: this.allColumns(),
      override: this.componentsOverride.columnsDropdown
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLDataTable.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLDataTable.js ***!
  \*********************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return this.$scopedSlots["default"]({
    source: this.source,
    theme: this.theme,
    opts: this.opts,
    perPageValues: this.perPageValues,
    totalPages: this.totalPages,
    slots: this.$parent.$slots,
    override: this.componentsOverride.dataTable
  });
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLDateFilter.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLDateFilter.js ***!
  \**********************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLDateFilter',
  inject: ['getHeading', 'display', 'componentsOverride', 'opts'],
  props: ['column'],
  render: function render(h) {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      column: this.column,
      placeholder: this.display('filterBy', {
        column: this.getHeading(this.column)
      }),
      display: this.display,
      override: this.componentsOverride.dateFilter
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLDropdownPagination.js":
/*!******************************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLDropdownPagination.js ***!
  \******************************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: "RLDropdownPagination",
  inject: ['limit', 'count', 'theme', 'page', 'setPage', 'totalPages', 'componentsOverride', 'id', 'opts'],
  render: function render() {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      name: this.id,
      setPage: this.setPage,
      page: this.page(),
      records: this.count(),
      perPage: parseInt(this.limit()),
      theme: this.theme,
      totalPages: this.totalPages(),
      override: this.componentsOverride.dropdownPagination
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLFiltersRow.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLFiltersRow.js ***!
  \**********************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLFiltersRow',
  inject: ['opts', 'theme', 'allColumns', 'filterable', 'filterType', 'slots', 'columnClass', 'hasChildRow', 'componentsOverride'],
  render: function render() {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      columns: this.allColumns(),
      filterable: this.filterable,
      filterType: this.filterType,
      slots: this.slots(),
      columnClass: this.columnClass,
      hasChildRow: this.hasChildRow(),
      override: this.componentsOverride.filtersRow
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLGenericFilter.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLGenericFilter.js ***!
  \*************************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLGenericFilter',
  inject: ['opts', 'theme', 'source', 'search', 'query', 'display', 'id', 'componentsOverride'],
  render: function render() {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      theme: this.theme,
      search: this.search,
      query: this.query(),
      display: this.display,
      id: this.id,
      override: this.componentsOverride.genericFilter
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLGroupRow.js":
/*!********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLGroupRow.js ***!
  \********************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLGroupRow',
  props: ['row'],
  inject: ['colspan', 'opts', 'theme', 'toggleGroupDirection', 'toggleGroup', 'groupToggleIcon', 'getGroupSlot', 'componentsOverride'],
  render: function render() {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      theme: this.theme,
      colspan: this.colspan(),
      toggleGroupDirection: this.toggleGroupDirection,
      canToggleGroup: this.opts().toggleGroups,
      toggleGroup: this.toggleGroup,
      groupValue: this.row[this.opts().groupBy],
      groupToggleIcon: this.groupToggleIcon,
      slot: this.getGroupSlot(this.row[this.opts().groupBy]),
      override: this.componentsOverride.groupRow
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLHeadingsRow.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLHeadingsRow.js ***!
  \***********************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLHeadingRow',
  inject: ['opts', 'theme', 'hasChildRow', 'allColumns', 'componentsOverride'],
  render: function render() {
    return this.$scopedSlots["default"]({
      override: this.componentsOverride.headingsRow,
      opts: this.opts(),
      columns: this.allColumns(),
      hasChildRow: this.hasChildRow,
      childRowTogglerFirst: this.hasChildRow() && this.opts().showChildRowToggler && this.opts().childRowTogglerFirst,
      childRowTogglerLast: this.hasChildRow() && this.opts().showChildRowToggler && !this.opts().childRowTogglerFirst
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLListFilter.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLListFilter.js ***!
  \**********************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLListFilter',
  inject: ['search', 'query', 'theme', 'getHeading', 'display', 'getColumnName', 'opts', 'componentsOverride'],
  props: ['column'],
  render: function render(h) {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      theme: this.theme,
      search: this.search,
      query: this.query(),
      getHeading: this.getHeading,
      display: this.display,
      items: this.opts().listColumns[this.column].filter(function (item) {
        return !item.hide;
      }),
      defaultOption: this.display('defaultOption', {
        column: this.opts().headings[this.column] ? this.opts().headings[this.column] : this.column
      }),
      name: this.getColumnName(this.column),
      value: this.query()[this.column],
      column: this.column,
      override: this.componentsOverride.listFilter
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLNoResultsRow.js":
/*!************************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLNoResultsRow.js ***!
  \************************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLNoResultsRow',
  inject: ['colspan', 'display', 'componentsOverride', 'loading', 'initialRequestSent', 'tabIndex', 'opts'],
  render: function render() {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      colspan: this.colspan(),
      display: this.display,
      tabIndex: this.tabIndex(),
      loading: this.loading(),
      initialRequestSent: this.initialRequestSent(),
      message: this.message,
      override: this.componentsOverride.noResultsRow
    });
  },
  computed: {
    message: function message() {
      if (this.loading()) {
        return 'loading';
      }

      if (!this.opts().sendInitialRequest && !this.initialRequestSent()) {
        return 'noRequest';
      }

      return 'noResults';
    }
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLPagination.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLPagination.js ***!
  \**********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _merge = _interopRequireDefault(__webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default = {
  name: "RLPagination",
  inject: ['opts', 'count', 'limit', 'vuex', 'name', 'id', 'theme', 'page', 'setPage', 'totalPages', 'componentsOverride'],
  render: function render() {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      setPage: this.setPage,
      options: this.opts().pagination,
      infiniteScroll: this.opts().infiniteScroll,
      page: this.page(),
      records: this.count(),
      perPage: parseInt(this.limit()),
      name: this.vuex ? this.name : this.id,
      vuex: this.vuex,
      theme: this.theme,
      texts: this.opts().texts,
      totalPages: this.totalPages(),
      optionsObj: {
        theme: (0, _merge["default"])(this.theme.pagination, {
          wrapper: "".concat(this.theme.row, " ").concat(this.theme.column, " ").concat(this.theme.contentCenter),
          count: "".concat(this.theme.center, " ").concat(this.theme.column)
        }),
        chunk: this.opts().pagination.chunk,
        chunksNavigation: this.opts().pagination.nav,
        edgeNavigation: this.opts().pagination.edge,
        texts: {
          count: this.opts().texts.count,
          first: this.opts().texts.first,
          last: this.opts().texts.last
        }
      },
      override: this.componentsOverride.pagination
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLPerPageSelector.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLPerPageSelector.js ***!
  \***************************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: "RLPerPageSelector",
  inject: ['opts', 'limit', 'setLimit', 'perPageValues', 'id', 'theme', 'display', 'componentsOverride'],
  render: function render() {
    var _this = this;

    return this.$scopedSlots["default"]({
      opts: this.opts(),
      perPageValues: this.perPageValues(),
      theme: this.theme,
      limit: this.limit(),
      setLimit: this.setLimit,
      id: this.id,
      selectClass: this.theme.select,
      display: this.display,
      selectAttrs: {
        id: "VueTables__limit_".concat(this.id),
        "class": this.theme.select,
        value: this.limit()
      },
      selectEvents: {
        change: function change(e) {
          return _this.setLimit(e);
        }
      },
      override: this.componentsOverride.perPageSelector
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLSortControl.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLSortControl.js ***!
  \***********************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLSortControl',
  inject: ['opts', 'column', 'theme', 'sortable', 'hasMultiSort', 'orderBy', 'userMultiSorting', 'sortableChevronClass', 'componentsOverride'],
  render: function render() {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      sortable: this.sortable(this.column()),
      "class": "VueTables__sort-icon ".concat(this.theme.right, " ").concat(this.sortableChevronClass(this.column())),
      sortStatus: this.sortStatus,
      override: this.componentsOverride.sortControl
    });
  },
  computed: {
    OrderBy: function OrderBy() {
      return this.orderBy();
    },
    UserMultiSorting: function UserMultiSorting() {
      return this.userMultiSorting();
    },
    sortStatus: function sortStatus() {
      var _this = this;

      if (this.hasMultiSort && this.OrderBy.column && this.UserMultiSorting[this.OrderBy.column]) {
        var col = this.UserMultiSorting[this.OrderBy.column].filter(function (c) {
          return c.column === _this.column();
        })[0];
        if (col) return {
          sorted: true,
          asc: col.ascending
        };
      }

      if (this.column() === this.OrderBy.column) {
        return {
          sorted: true,
          asc: this.OrderBy.ascending
        };
      }

      return {
        sorted: false,
        asc: false
      };
    }
  },
  methods: {}
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLTable.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLTable.js ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLTable',
  inject: ['opts', 'theme', 'colspan', 'slots', 'componentsOverride'],
  render: function render() {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      tableAttrs: {
        summary: this.opts().summary,
        "class": "VueTables__table ".concat(this.opts().skin ? this.opts().skin : this.theme.table)
      },
      slots: this.slots(),
      colspan: this.colspan(),
      caption: this.opts().caption,
      override: this.componentsOverride.table
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLTableBody.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLTableBody.js ***!
  \*********************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLTableBody',
  inject: ['opts', 'theme', 'source', 'filteredData', 'tableData', 'colspan', 'openChildRows', 'collapsedGroups', 'scopedSlots', 'slots', 'componentsOverride', 'page', 'limit'],
  render: function render() {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      source: this.source,
      canToggleGroups: this.opts().toggleGroups,
      collapsedGroups: this.collapsedGroups(),
      data: this.source === 'client' ? this.filteredData() : this.tableData(),
      colspan: this.colspan(),
      loading: true,
      hasChildRow: this.opts().childRow || this.scopedSlots()['child_row'],
      openChildRows: this.openChildRows(),
      uniqueRowId: this.opts().uniqueKey,
      groupBy: this.opts().groupBy,
      slots: this.slots(),
      override: this.componentsOverride.tableBody,
      initialIndex: (this.page() - 1) * this.limit()
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLTableCell.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLTableCell.js ***!
  \*********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _merge = _interopRequireDefault(__webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default = {
  name: 'RLTableCell',
  inject: ['row', 'scopedSlots', 'theme', 'orderBy', 'opts', 'render', 'index', 'setEditingCell', 'updateValue', 'revertValue', 'editing', 'getValue', 'columnClass', 'cellClasses', 'componentsOverride', 'isListFilter', 'optionText', 'source', 'dateFormat', 'formatDate', 'tabIndex'],
  props: ['column'],
  render: function render(h) {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      row: this.Row,
      column: this.column,
      content: this.content(h),
      classes: "".concat(this.theme.td, " ").concat(this.columnClass(this.column), " ").concat(this.cellClasses(this.column, this.Row), " ").concat(this.sortedClass(this.column)).trim(),
      tabIndex: this.tabIndex(),
      override: this.componentsOverride.tableCell
    });
  },
  computed: {
    Row: function Row() {
      return this.row();
    },
    options: function options() {
      return this.opts();
    }
  },
  methods: {
    content: function content(h) {
      if (this.options.templates[this.column]) {
        return this.render(this.Row, this.column, this.index(), h);
      }

      if (this.scopedSlots()[this.column]) {
        var data = {
          row: this.Row,
          column: this.column,
          index: this.index()
        };

        if (this.options.editableColumns.includes(this.column)) {
          data = (0, _merge["default"])(data, this.getEditFunctions());
        }

        return this.scopedSlots()[this.column](data);
      }

      return this.formatCellContent(this.getValue(this.Row, this.column), this.column);
    },
    sortedClass: function sortedClass(column) {
      if (!this.options.addSortedClassToCells) return '';
      return this.orderBy().column === column ? "".concat(column, "-sorted-") + (this.orderBy().ascending ? 'asc' : 'desc') : '';
    },
    formatCellContent: function formatCellContent(value, column) {
      if (this.source === 'client' && this.options.dateColumns.includes(column)) {
        return this.formatDate(value, this.dateFormat(column));
      }

      if (this.isListFilter(column)) {
        return this.optionText(value, column);
      }

      return value;
    },
    isEditing: function isEditing() {
      return function () {
        var _this = this;

        return this.editing().find(function (e) {
          return e.id === _this.Row[_this.options.uniqueKey] && e.column === _this.column;
        });
      }.bind(this);
    },
    getEditFunctions: function getEditFunctions() {
      return {
        update: this.updateValue(this.Row, this.column),
        isEditing: this.isEditing(),
        setEditing: this.setEditingCell(this.Row, this.column),
        revertValue: this.revertValue(this.Row, this.column)
      };
    }
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLTableHead.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLTableHead.js ***!
  \*********************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLTableHead',
  inject: ['opts', 'slots', 'componentsOverride'],
  render: function render() {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      slots: this.slots(),
      override: this.componentsOverride.tableHead
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLTableHeading.js":
/*!************************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLTableHeading.js ***!
  \************************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLTableHeading',
  props: ['column'],
  provide: function provide() {
    var _this = this;

    return {
      column: function column() {
        return _this.column;
      }
    };
  },
  inject: ['opts', 'theme', 'sortableClass', 'getHeadingTooltip', 'getHeading', 'orderByColumn', 'componentsOverride', 'tabIndex'],
  render: function render(h) {
    var _this2 = this;

    return this.$scopedSlots["default"]({
      opts: this.opts(),
      thAttrs: {
        "class": this.sortableClass(this.column),
        tabIndex: this.tabIndex(),
        title: this.getHeadingTooltip(this.column)
      },
      thEvents: {
        keypress: function keypress(e) {
          if (e.key === "Enter") {
            this.orderByColumn(this.column, e);
          }
        },
        click: function click(e) {
          if (e.target.className !== "resize-handle") {
            _this2.orderByColumn(_this2.column, e);
          }
        }
      },
      spanAttrs: {
        title: this.getHeadingTooltip(this.column)
      },
      heading: this.getHeading(this.column, h),
      override: this.componentsOverride.tableHeading
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLTableRow.js":
/*!********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLTableRow.js ***!
  \********************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLTableRow',
  props: ['row', 'index'],
  inject: ['allColumns', 'opts', 'rowWasClicked', 'hasChildRow', 'componentsOverride'],
  provide: function provide() {
    var _this = this;

    return {
      row: function row() {
        return _this.row;
      },
      index: function index() {
        return _this.index;
      }
    };
  },
  render: function render() {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      columns: this.allColumns(),
      hasChildRow: this.hasChildRow(),
      rowId: this.row[this.opts().uniqueKey],
      rowAttrs: {
        "class": this.opts().rowClassCallback ? this.opts().rowClassCallback(this.row) : '',
        attrs: this.opts().rowAttributesCallback ? this.opts().rowAttributesCallback(this.row) : {}
      },
      rowEvents: {
        click: this.rowWasClicked.bind(this, this.row, this.index),
        dblclick: this.rowWasClicked.bind(this, this.row, this.index)
      },
      childRowTogglerFirst: this.hasChildRow() && this.opts().showChildRowToggler && this.opts().childRowTogglerFirst,
      childRowTogglerLast: this.hasChildRow() && this.opts().showChildRowToggler && !this.opts().childRowTogglerFirst,
      override: this.componentsOverride.tableRow
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/components/renderless/RLTextFilter.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/components/renderless/RLTextFilter.js ***!
  \**********************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  name: 'RLTextFilter',
  inject: ['opts', 'search', 'query', 'theme', 'getHeading', 'display', 'getColumnName', 'componentsOverride'],
  props: ['column'],
  render: function render(h) {
    return this.$scopedSlots["default"]({
      opts: this.opts(),
      column: this.column,
      debounce: this.opts().debounce,
      theme: this.theme,
      search: this.search,
      query: this.query(),
      getHeading: this.getHeading,
      getColumnName: this.getColumnName,
      display: this.display,
      override: this.componentsOverride.textFilter
    });
  }
};
exports["default"] = _default;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/all-columns.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/all-columns.js ***!
  \********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  var _this = this;

  var display = this.columnsDisplay; // default - return all columns

  if (!display && !this.userControlsColumns) {
    return this.Columns.filter(function (col) {
      return _this._shouldShowColumnOnInit(col);
    });
  } // user toggled columns - return user selected columns


  if (this.userControlsColumns) {
    return this.columns.filter(function (column) {
      return _this.userColumnsDisplay.includes(column);
    });
  }

  if (this.opts.ssr) return this.Columns; // developer defined columns display

  return this.Columns.filter(function (column) {
    if (!_this._shouldShowColumnOnInit(column)) {
      return false;
    }

    if (!display[column]) return true;
    var range = display[column];
    var operator = range[2];
    var inRange = (!range[0] || _this.windowWidth >= range[0]) && (!range[1] || _this.windowWidth < range[1]);
    return operator == 'not' ? !inRange : inRange;
  });
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/colspan.js":
/*!****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/colspan.js ***!
  \****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return this.hasChildRow ? this.allColumns.length + 1 : this.allColumns.length;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/custom-q.js":
/*!*****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/custom-q.js ***!
  \*****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return JSON.stringify(this.customQueries);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/datepicker-columns.js":
/*!***************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/datepicker-columns.js ***!
  \***************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var intersect = (__webpack_require__(/*! array-intersect */ "./node_modules/array-intersect/dist/array-intersect.module.js")["default"]);

module.exports = function () {
  if (this.opts.filterable === true) {
    return this.opts.dateColumns;
  }

  if (this.opts.filterable === false) {
    return [];
  }

  return intersect(this.opts.filterable, this.opts.dateColumns);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/filterable-columns.js":
/*!***************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/filterable-columns.js ***!
  \***************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return this.opts.filterable && this.opts.filterable.length ? this.opts.filterable : this.Columns;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/filtered-data.js":
/*!**********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/filtered-data.js ***!
  \**********************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var clone = __webpack_require__(/*! lodash.clonedeep */ "./node_modules/lodash.clonedeep/index.js");

module.exports = function () {
  this.dispatch('loading');
  var data = clone(this.tableData);
  var column = this.orderBy.column;
  data = this.search(data);

  if (column) {
    // dummy var to force compilation
    if (this.time) this.time = this.time;
    data = this.opts.sortingAlgorithm.call(this, data, column ? column : this.opts.groupBy);
  } else if (this.opts.groupBy) {
    data = this.opts.sortingAlgorithm.call(this, data, this.opts.groupBy);
  }

  if (this.vuex) {
    if (this.count != data.length) this.commit('SET_COUNT', data.length);
  } else {
    this.count = data.length;
  }

  var offset = (this.page - 1) * this.limit;
  this.allFilteredData = JSON.parse(JSON.stringify(data));
  this.dispatch('loaded');
  return data.splice(offset, this.limit);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/filtered-query.js":
/*!***********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/filtered-query.js ***!
  \***********************************************************************/
/***/ (function(module) {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

module.exports = function () {
  if (_typeof(this.query) !== 'object' || this.opts.sendEmptyFilters) {
    return this.query;
  }

  var result = {};

  for (var key in this.query) {
    if (this.query[key] !== '' && this.filterable(key)) {
      result[key] = this.query[key];
    }
  }

  return result;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/has-child-row.js":
/*!**********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/has-child-row.js ***!
  \**********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return !!(this.opts.childRow || this.$parent.$scopedSlots.child_row);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/has-generic-filter.js":
/*!***************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/has-generic-filter.js ***!
  \***************************************************************************/
/***/ (function(module) {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

module.exports = function () {
  return !this.opts.filterByColumn && (typeof this.opts.filterable === 'boolean' && this.opts.filterable || _typeof(this.opts.filterable) === 'object' && this.opts.filterable.length);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/list-columns-object.js":
/*!****************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/list-columns-object.js ***!
  \****************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  var columns = Object.keys(this.opts.listColumns);
  var res = {};
  columns.forEach(function (column) {
    res[column] = {};
    this.opts.listColumns[column].forEach(function (item) {
      res[column][item.id] = item.text;
    });
  }.bind(this));
  return res;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/opts.js":
/*!*************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/opts.js ***!
  \*************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


module.exports = function () {
  var defaults = __webpack_require__(/*! ../config/defaults */ "./node_modules/vue-tables-2/compiled/config/defaults.js")();

  return this.initOptions(defaults, this.globalOptions, this.options);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/per-page-values.js":
/*!************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/per-page-values.js ***!
  \************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  var _this = this;

  var perpageValues = [];
  this.opts.perPageValues.every(function (value) {
    var isLastEntry = value >= _this.count;
    perpageValues.push(value);
    return !isLastEntry;
  });
  return perpageValues;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/q.js":
/*!**********************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/q.js ***!
  \**********************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return this.opts.filterByColumn ? JSON.stringify(this.query) : this.query;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/storage.js":
/*!****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/storage.js ***!
  \****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  if (typeof localStorage === 'undefined') return {};
  return this.opts.storage === 'local' ? localStorage : sessionStorage;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/table-data.js":
/*!*******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/table-data.js ***!
  \*******************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return this.data;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/templates-keys.js":
/*!***********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/templates-keys.js ***!
  \***********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return Object.keys(this.opts.templates);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/computed/total-pages.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/computed/total-pages.js ***!
  \********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return Math.ceil(this.count / this.limit);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/config/defaults.js":
/*!***************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/config/defaults.js ***!
  \***************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return {
    alwaysShowPerPageSelect: false,
    hidePerPageSelect: false,
    dateColumns: [],
    listColumns: {},
    datepickerOptions: {
      locale: {
        cancelLabel: "Clear"
      }
    },
    datepickerPerColumnOptions: {},
    initialPage: 1,
    perPage: 10,
    perPageValues: [10, 25, 50, 100],
    groupBy: false,
    collapseGroups: false,
    destroyEventBus: false,
    sendEmptyFilters: false,
    params: {},
    sortable: true,
    filterable: true,
    groupMeta: [],
    initFilters: {},
    sendInitialRequest: true,
    customFilters: [],
    templates: {},
    debounce: 250,
    dateFormat: "DD/MM/YYYY",
    dateFormatPerColumn: {},
    toMomentFormat: false,
    skin: false,
    columnsDisplay: {},
    columnsDropdown: false,
    texts: {
      count: "Showing {from} to {to} of {count} records|{count} records|One record",
      first: "First",
      last: "Last",
      filter: "Filter:",
      filterPlaceholder: "Search query",
      limit: "Records:",
      page: "Page:",
      noResults: "No matching records",
      noRequest: "Please select at least one filter to fetch results",
      filterBy: "Filter by {column}",
      loading: "Loading...",
      defaultOption: "Select {column}",
      columns: "Columns"
    },
    sortIcon: {
      is: "glyphicon-sort",
      base: "glyphicon",
      up: "glyphicon-chevron-up",
      down: "glyphicon-chevron-down"
    },
    addSortedClassToCells: false,
    sortingAlgorithm: function sortingAlgorithm(data, column) {
      return data.sort(this.getSortFn(column));
    },
    filterAlgorithm: {},
    customSorting: {},
    multiSorting: {},
    clientMultiSorting: true,
    serverMultiSorting: false,
    filterByColumn: false,
    highlightMatches: false,
    orderBy: false,
    descOrderColumns: [],
    footerHeadings: false,
    headings: {},
    headingsTooltips: {},
    pagination: {
      show: true,
      dropdown: false,
      chunk: 10,
      edge: false,
      align: "center",
      nav: "fixed"
    },
    childRow: false,
    childRowTogglerFirst: true,
    disabledChildRows: false,
    showChildRowToggler: true,
    uniqueKey: "id",
    requestFunction: false,
    requestAdapter: function requestAdapter(data) {
      return data;
    },
    responseAdapter: function responseAdapter(resp) {
      var data = this.getResponseData(resp);
      return {
        data: data.data,
        count: data.count
      };
    },
    requestKeys: {
      query: "query",
      limit: "limit",
      orderBy: "orderBy",
      ascending: "ascending",
      page: "page",
      byColumn: "byColumn"
    },
    rowClassCallback: false,
    preserveState: false,
    saveState: false,
    storage: "local",
    columnsClasses: {},
    summary: false,
    caption: false,
    cellClasses: {},
    visibleColumns: false,
    hiddenColumns: false,
    resizableColumns: true,
    editableColumns: [],
    tabbable: true,
    infiniteScroll: false,
    componentsOverride: {}
  };
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/filters/custom-filters.js":
/*!**********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/filters/custom-filters.js ***!
  \**********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (data, customFilters, customQueries) {
  var passing;
  return data.filter(function (row) {
    passing = true;
    customFilters.forEach(function (filter) {
      var value = customQueries[filter.name];
      if (value && !filter.callback(row, value)) passing = false;
    });
    return passing;
  });
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/filters/format-date.js":
/*!*******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/filters/format-date.js ***!
  \*******************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var validMoment = __webpack_require__(/*! ../helpers/is-valid-moment-object */ "./node_modules/vue-tables-2/compiled/helpers/is-valid-moment-object.js");

module.exports = function (value, dateFormat) {
  if (!validMoment(value)) return value;
  return value.format(dateFormat);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/filters/highlight-matches.js":
/*!*************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/filters/highlight-matches.js ***!
  \*************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (value, column, h) {
  var query = this.opts.filterByColumn ? this.query[column] : this.query;
  if (!query) return value;
  query = new RegExp("(" + escapeRegex(query) + ")", "i");
  return h("span", {
    "class": 'VueTables__highlight'
  }, matches(value, query, h));
};

function matches(value, query, h) {
  var pieces = String(value).split(query);
  return pieces.map(function (piece) {
    if (query.test(piece)) {
      return h("b", {}, piece);
    }

    return piece;
  });
}

function escapeRegex(s) {
  return typeof s === 'string' ? s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') : s;
}

;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/filters/option-text.js":
/*!*******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/filters/option-text.js ***!
  \*******************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (value, column) {
  var list = this.listColumnsObject[column];
  if (typeof list[value] == 'undefined') return value;
  return list[value];
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/helpers/is-empty.js":
/*!****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/helpers/is-empty.js ***!
  \****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (obj) {
  // null and undefined are "empty"
  if (obj == null) return true; // Assume if it has a length property with a non-zero value
  // that that property is correct.

  if (obj.length > 0) return false;
  if (obj.length === 0) return true; // Otherwise, does it have any properties of its own?

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
  }

  return true;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/helpers/is-valid-moment-object.js":
/*!******************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/helpers/is-valid-moment-object.js ***!
  \******************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (val) {
  return val && typeof val.isValid == 'function' && val.isValid();
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/helpers/object-filled-keys-count.js":
/*!********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/helpers/object-filled-keys-count.js ***!
  \********************************************************************************/
/***/ (function(module) {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

module.exports = function (obj) {
  var count = 0;

  for (var prop in obj) {
    var isDateRange = _typeof(obj[prop]) == 'object';
    if (isDateRange || obj[prop] && (!isNaN(obj[prop]) || obj[prop].trim())) count++;
  }

  return count;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/helpers/resizeable-columns.js":
/*!**************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/helpers/resizeable-columns.js ***!
  \**************************************************************************/
/***/ (function(module) {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

module.exports = function (table, hasChildRow, isChildRowTogglerFirst, resizeableColumns) {
  var row = table.getElementsByTagName("tr")[0],
      cols = row ? Array.from(row.children) : undefined;
  if (!cols) return;

  if (_typeof(resizeableColumns) === 'object') {
    cols = cols.filter(function (col) {
      return resizeableColumns.includes(col.id.split('--')[1]);
    });
  }

  table.style.overflow = "hidden";
  var tableHeight = table.offsetHeight;
  var i = hasChildRow && isChildRowTogglerFirst ? 1 : 0;
  var till = hasChildRow && !isChildRowTogglerFirst ? cols.length - 2 : cols.length;

  for (; i < till; i++) {
    var div = createDiv(tableHeight);
    div.className = "resize-handle";
    cols[i].appendChild(div);
    cols[i].style.position = "relative";
    setListeners(div);
  }

  function setListeners(div) {
    var pageX, curCol, nxtCol, curColWidth, nxtColWidth;
    div.addEventListener("mousedown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      curCol = e.target.parentElement;
      nxtCol = curCol.nextElementSibling;
      pageX = e.pageX;
      var padding = paddingDiff(curCol);
      curColWidth = curCol.offsetWidth - padding;
      if (nxtCol) nxtColWidth = nxtCol.offsetWidth - padding;
    }); // div.addEventListener("mouseover", function(e) {
    //   e.target.style.borderRight = "2px solid #0000ff";
    // });

    div.addEventListener("mouseout", function (e) {
      e.target.style.borderRight = "";
    });
    document.addEventListener("mousemove", function (e) {
      if (curCol) {
        var diffX = e.pageX - pageX;
        if (nxtCol) nxtCol.style.width = nxtColWidth - diffX + "px";
        curCol.style.width = curColWidth + diffX + "px";
      }
    });
    document.addEventListener("mouseup", function (e) {
      if (e.target.nodeName === 'INPUT') return; // Commented out due to #968. Monitor.
      // e.stopPropagation();

      curCol = undefined;
      nxtCol = undefined;
      pageX = undefined;
      nxtColWidth = undefined;
      curColWidth = undefined;
    });
  }

  function createDiv(height) {
    var div = document.createElement("div");
    div.style.top = 0;
    div.style.right = 0;
    div.style.width = "5px";
    div.style.position = "absolute";
    div.style.cursor = "col-resize";
    div.style.userSelect = "none";
    div.style.height = height + "px";
    return div;
  }

  function paddingDiff(col) {
    if (getStyleVal(col, "box-sizing") == "border-box") {
      return 0;
    }

    var padLeft = getStyleVal(col, "padding-left");
    var padRight = getStyleVal(col, "padding-right");
    return parseInt(padLeft) + parseInt(padRight);
  }

  function getStyleVal(elm, css) {
    return window.getComputedStyle(elm, null).getPropertyValue(css);
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/helpers/ucfirst.js":
/*!***************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/helpers/ucfirst.js ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;

function _default(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/index.js ***!
  \*****************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _bus = _interopRequireDefault(__webpack_require__(/*! ./bus */ "./node_modules/vue-tables-2/compiled/bus.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var ClientTable = __webpack_require__(/*! ./v-client-table */ "./node_modules/vue-tables-2/compiled/v-client-table.js");

var ServerTable = __webpack_require__(/*! ./v-server-table */ "./node_modules/vue-tables-2/compiled/v-server-table.js");

module.exports = {
  ClientTable: ClientTable,
  ServerTable: ServerTable,
  Event: _bus["default"]
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/cell-classes.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/cell-classes.js ***!
  \********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column, row) {
  if (!this.opts.cellClasses[column]) return '';
  return this.opts.cellClasses[column].filter(function (item) {
    return item.condition(row);
  }).map(function (item) {
    return item["class"];
  }).join(' ');
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/child-row-toggler-class.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/child-row-toggler-class.js ***!
  \*******************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (rowId) {
  return this.openChildRows.includes(rowId) ? 'VueTables__child-row-toggler--open' : 'VueTables__child-row-toggler--closed';
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/client-search.js":
/*!*********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/client-search.js ***!
  \*********************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var object_filled_keys_count = __webpack_require__(/*! ../helpers/object-filled-keys-count */ "./node_modules/vue-tables-2/compiled/helpers/object-filled-keys-count.js");

var is_valid_moment_object = __webpack_require__(/*! ../helpers/is-valid-moment-object */ "./node_modules/vue-tables-2/compiled/helpers/is-valid-moment-object.js");

var filterByCustomFilters = __webpack_require__(/*! ../filters/custom-filters */ "./node_modules/vue-tables-2/compiled/filters/custom-filters.js");

module.exports = function (data, e) {
  if (e) {
    var _query = this.query;
    this.setPage(1, true);
    var name = this.getName(e.target.name);
    var value = _typeof(e.target.value) === 'object' ? e.target.value : '' + e.target.value;

    if (name) {
      _query[name] = value;
    } else {
      _query = value;
    }

    this.vuex ? this.commit('SET_FILTER', _query) : this.query = _query;
    this.updateState('query', _query);

    if (name) {
      this.dispatch('filter', {
        name: name,
        value: value
      });
      this.dispatch("filter::".concat(name), value);
    } else {
      this.dispatch('filter', value);
    }
  }

  var query = this.query;
  var totalQueries = !query ? 0 : 1;
  if (!this.opts) return data;

  if (this.opts.filterByColumn) {
    totalQueries = object_filled_keys_count(query);
  }

  var value;
  var found;
  var currentQuery;
  var dateFormat;
  var filterByDate;
  var isListFilter;
  var data = filterByCustomFilters(data, this.opts.customFilters, this.customQueries);
  if (!totalQueries) return data;
  return data.filter(function (row, index) {
    found = 0;
    this.filterableColumns.forEach(function (column) {
      filterByDate = this.opts.dateColumns.indexOf(column) > -1 && this.opts.filterByColumn;
      isListFilter = this.isListFilter(column) && this.opts.filterByColumn;
      dateFormat = this.dateFormat(column);
      value = this._getValue(row, column);

      if (is_valid_moment_object(value) && !filterByDate) {
        value = value.format(dateFormat);
      }

      currentQuery = this.opts.filterByColumn ? query[column] : query;
      currentQuery = setCurrentQuery(currentQuery);

      if (currentQuery) {
        if (this.opts.filterAlgorithm[column]) {
          if (this.opts.filterAlgorithm[column].call(this.$parent.$parent, row, this.opts.filterByColumn ? query[column] : query)) found++;
        } else {
          if (foundMatch(currentQuery, value, isListFilter)) found++;
        }
      }
    }.bind(this));
    return found >= totalQueries;
  }.bind(this));
};

function setCurrentQuery(query) {
  if (!query) return '';
  if (typeof query == 'string') return query.toLowerCase(); // Date Range

  return query;
}

function foundMatch(query, value, isListFilter) {
  if (['string', 'number', 'boolean'].indexOf(_typeof(value)) > -1) {
    value = String(value).toLowerCase();
  } // List Filter


  if (isListFilter) {
    return value == query;
  } //Text Filter


  if (typeof value === 'string') {
    return value.indexOf(query) > -1;
  } // Date range


  if (is_valid_moment_object(value)) {
    var start = moment(query.start, 'YYYY-MM-DD HH:mm:ss');
    var end = moment(query.end, 'YYYY-MM-DD HH:mm:ss');
    return value >= start && value <= end;
  }

  if (_typeof(value) === 'object') {
    for (var key in value) {
      if (foundMatch(query, value[key])) return true;
    }

    return false;
  }

  return value >= start && value <= end;
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/column-class.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/column-class.js ***!
  \********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  var c = this.opts.columnsClasses;
  return c.hasOwnProperty(column) ? c[column] : '';
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/currently-sorted.js":
/*!************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/currently-sorted.js ***!
  \************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  var userMultiSort = Object.keys(this.userMultiSorting);
  if (!userMultiSort.length || this.orderBy.column === column) return this.orderBy.column === column;
  return !!this.userMultiSorting[userMultiSort[0]].filter(function (col) {
    return col.column == column;
  }).length;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/date-format.js":
/*!*******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/date-format.js ***!
  \*******************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  if (this.opts.dateFormatPerColumn.hasOwnProperty(column)) {
    return this.opts.dateFormatPerColumn[column];
  }

  return this.opts.dateFormat;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/default-sort.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/default-sort.js ***!
  \********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column, ascending) {
  var multiIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
  var sort = this.defaultSort;
  var multiSort = this.userMultiSorting[this.currentlySorting.column] ? this.userMultiSorting[this.currentlySorting.column] : this.opts.multiSorting[this.currentlySorting.column];
  var asc = this.currentlySorting.ascending;
  var self = this;
  return function (a, b) {
    var aVal = self._getValue(a, column) || '';
    var bVal = self._getValue(b, column) || '';
    var dir = ascending ? 1 : -1;
    var secondaryAsc;
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal === bVal && multiSort && multiSort[multiIndex + 1]) {
      var sortData = multiSort[multiIndex + 1];

      if (typeof sortData.ascending !== 'undefined') {
        secondaryAsc = sortData.ascending;
      } else {
        secondaryAsc = sortData.matchDir ? asc : !asc;
      }

      return sort(sortData.column, secondaryAsc, multiIndex + 1)(a, b);
    }

    return aVal > bVal ? dir : -dir;
  };
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/dispatch.js":
/*!****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/dispatch.js ***!
  \****************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _bus = _interopRequireDefault(__webpack_require__(/*! ../bus */ "./node_modules/vue-tables-2/compiled/bus.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

module.exports = function (event, payload) {
  if (this.vuex) {
    if (event.split('::').length > 1) return;
    this.commit(event.toUpperCase().replace('-', '_'), payload);
  }

  this.$parent.$emit(event, payload);

  _bus["default"].$emit("vue-tables.".concat(event), payload);

  if (this.name) {
    _bus["default"].$emit("vue-tables.".concat(this.name, ".").concat(event), payload);
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/display.js":
/*!***************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/display.js ***!
  \***************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (text, replacements) {
  if (!this.opts.texts) return '';
  var text = this.opts.texts[text];
  if (replacements) for (var key in replacements) {
    // console.log(key)
    text = text.replace('{' + key + '}', replacements[key]);
  }
  return text;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/filter-type.js":
/*!*******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/filter-type.js ***!
  \*******************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  if (!this.opts.filterable) return false;
  if (this.isTextFilter(column)) return 'vt-text-filter';
  if (this.isDateFilter(column)) return 'vt-date-filter';
  if (this.isListFilter(column)) return 'vt-list-filter';
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/filterable.js":
/*!******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/filterable.js ***!
  \******************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  if (!this.opts.filterable) return false;
  return typeof this.opts.filterable == 'boolean' && this.opts.filterable || this.opts.filterable.indexOf(column) > -1;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-child-row-template.js":
/*!******************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-child-row-template.js ***!
  \******************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (h, row, index, scopedSlot) {
  // scoped slot
  if (scopedSlot) return scopedSlot({
    row: row,
    index: index
  });
  var childRow = this.opts.childRow; // function

  if (typeof childRow === 'function') return childRow.apply(this, [h, row]); // component

  return h(childRow, {
    attrs: {
      data: row
    }
  });
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-column-name.js":
/*!***********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-column-name.js ***!
  \***********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  return 'vf__' + column.split('.').join('@@@');
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-data.js":
/*!****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-data.js ***!
  \****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (promiseOnly) {
  var additionalData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var emitLoading = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  if (!this.opts.sendInitialRequest && !this.initialRequestSent) {
    this.initialRequestSent = true;
    this.loading = true;
  }

  var data = this.opts.requestAdapter(this.getRequestParams(additionalData));

  if (emitLoading) {
    this.dispatch('loading', data);
  }

  var promise = this.sendRequest(data);
  if (promiseOnly) return promise;
  return promise.then(function (response) {
    if (typeof response !== 'undefined') {
      this.loading = false;
      return this.setData(response);
    } else {
      return false;
    }
  }.bind(this));
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-group-slot.js":
/*!**********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-group-slot.js ***!
  \**********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (value) {
  if (this.$parent.$scopedSlots && this.$parent.$scopedSlots['__group_meta']) {
    var data = this.opts.groupMeta.find(function (val) {
      return val.value === value;
    });
    if (!data) return '';
    return this.$parent.$scopedSlots['__group_meta'](data);
  }

  return '';
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-heading-tooltip.js":
/*!***************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-heading-tooltip.js ***!
  \***************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (value, h) {
  if (typeof value !== 'string') return '';
  var derivedHeadingTooltip = '';
  if (!this.opts.headingsTooltips.hasOwnProperty(value)) return derivedHeadingTooltip;

  if (typeof this.opts.headingsTooltips[value] === 'function') {
    if (h) return this.opts.headingsTooltips[value].call(this.$parent, h);
    return derivedHeadingTooltip;
  }

  return this.opts.headingsTooltips[value];
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-heading.js":
/*!*******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-heading.js ***!
  \*******************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _ucfirst = _interopRequireDefault(__webpack_require__(/*! ../helpers/ucfirst */ "./node_modules/vue-tables-2/compiled/helpers/ucfirst.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

module.exports = function (value, h) {
  if (typeof value !== 'string') return '';

  if (typeof this.$parent.$slots["h__".concat(value)] !== 'undefined') {
    return this.$parent.$slots["h__".concat(value)];
  }

  var derivedHeading = (0, _ucfirst["default"])(value.split("_").join(" "));
  if (!this.opts.headings.hasOwnProperty(value)) return derivedHeading;

  if (typeof this.opts.headings[value] === 'function') {
    if (h) return this.opts.headings[value].call(this.$parent, h);
    return derivedHeading;
  }

  return this.opts.headings[value];
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-initial-date-range.js":
/*!******************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-initial-date-range.js ***!
  \******************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  if (typeof this.opts.initFilters[column] !== 'undefined') {
    return this.opts.initFilters[column];
  }

  if (typeof this.query[column] !== 'undefined' && this.query[column].start) {
    return {
      start: moment(this.query[column].start, 'YYYY-MM-DD HH:mm:ss'),
      end: moment(this.query[column].end, 'YYYY-MM-DD HH:mm:ss')
    };
  }

  return false;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-name.js":
/*!****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-name.js ***!
  \****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (name) {
  if (!name) return name;
  name = name.split('__');
  name.shift();
  return name.join('__').split('@@@').join('.');
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-open-child-rows.js":
/*!***************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-open-child-rows.js ***!
  \***************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  var _this = this;

  var rows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  if (!this.opts.childRow || typeof this.opts.childRow === 'function') {
    throw new Error('vue-tables-2: Child row undefined or not a component');
  }

  var Rows = rows ? this.openChildRows.filter(function (row) {
    return rows.includes(row);
  }) : this.openChildRows;
  if (!Rows.length) return [];
  return this.$parent.$refs.vt_table.$refs.vt_table_body.$children[0].$children.filter(function (child) {
    return child.$options.name === 'VtChildRow' && Rows.includes(child.$children[0].$children[0].data[_this.opts.uniqueKey]);
  }).map(function (child) {
    return child.$children[0].$children[0];
  });
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-request-params.js":
/*!**************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-request-params.js ***!
  \**************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var merge = __webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js");

module.exports = function () {
  var _data;

  var additionalData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var keys = this.opts.requestKeys;
  var data = (_data = {}, _defineProperty(_data, keys.query, this.filteredQuery), _defineProperty(_data, keys.limit, this.limit), _defineProperty(_data, keys.ascending, this.orderBy.ascending ? 1 : 0), _defineProperty(_data, keys.page, parseInt(this.page)), _defineProperty(_data, keys.byColumn, this.opts.filterByColumn ? 1 : 0), _data);
  if (this.orderBy.hasOwnProperty('column') && this.orderBy.column) data[keys.orderBy] = this.orderBy.column;
  data = merge(data, this.opts.params, this.customQueries, additionalData);

  if (this.hasMultiSort && this.orderBy.column && this.userMultiSorting[this.orderBy.column]) {
    data.multiSort = this.userMultiSorting[this.orderBy.column];
  }

  return data;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-response-data.js":
/*!*************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-response-data.js ***!
  \*************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (response) {
  if (typeof axios !== 'undefined') return response.data;
  return response;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-sort-fn.js":
/*!*******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-sort-fn.js ***!
  \*******************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  var ascending = this.orderBy.ascending;
  this.currentlySorting = {
    column: column,
    ascending: ascending
  };
  if (typeof this.opts.customSorting[column] == 'undefined') return this.defaultSort(column, ascending);
  return this.opts.customSorting[column](ascending);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/get-value.js":
/*!*****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/get-value.js ***!
  \*****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (row, column) {
  if (column.indexOf('.') === -1) return row[column];
  var p = column.split('.');
  var value = row[p[0]];
  if (!value) return '';

  for (var i = 1; i < p.length; i++) {
    value = value[p[i]]; // If the nested structure doesn't exist return an empty string

    if (typeof value === 'undefined') return '';
  }

  return value;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/has-date-filters.js":
/*!************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/has-date-filters.js ***!
  \************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var intersection = (__webpack_require__(/*! array-intersect */ "./node_modules/array-intersect/dist/array-intersect.module.js")["default"]);

module.exports = function () {
  var opts = this.opts;
  return opts.dateColumns.length && opts.filterByColumn && (typeof opts.filterable == 'boolean' && opts.filterable || _typeof(opts.filterable) == 'object' && intersection(opts.filterable, opts.dateColumns).length);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/init-custom-filters.js":
/*!***************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/init-custom-filters.js ***!
  \***************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  var customQueries = {};
  var init = this.opts.initFilters;
  var key;
  this.opts.customFilters.forEach(function (filter) {
    key = this.source == 'client' ? filter.name : filter;
    customQueries[key] = init.hasOwnProperty(key) ? init[key] : '';
  }.bind(this));
  return customQueries;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/init-date-filters.js":
/*!*************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/init-date-filters.js ***!
  \*************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var merge = __webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js");

module.exports = function () {
  if (typeof $ === 'undefined' || typeof $(this.$el).daterangepicker === 'undefined') {
    console.error('Date filters require jquery and daterangepicker');
    return;
  }

  var el;
  var that = this;
  var query = this.vuex ? JSON.parse(JSON.stringify(this.query)) : this.query;
  var columnOptions;
  var dpOptions;

  var search = function search(query, e) {
    return that.source == 'client' ? that.search(that.data, e) : that.serverSearch(query, e);
  };

  var datepickerOptions = merge.recursive(this.opts.datepickerOptions, {
    autoUpdateInput: false,
    singleDatePicker: false
  });
  that.datepickerColumns.forEach(function (column) {
    var range = that._getInitialDateRange(column);

    if (range) {
      that._setDatepickerText(column, range.start, range.end);

      range = {
        startDate: range.start,
        endDate: range.end
      };
    } else {
      range = {};
    }

    el = $(that.$el).find("#VueTables__" + $.escapeSelector(column) + "-filter");
    columnOptions = typeof that.opts.datepickerPerColumnOptions[column] !== 'undefined' ? that.opts.datepickerPerColumnOptions[column] : {};
    columnOptions = merge.recursive(columnOptions, {
      locale: {
        format: that.dateFormat(column)
      }
    });
    dpOptions = merge(true, datepickerOptions);

    if (columnOptions.ranges === false) {
      dpOptions.ranges = {};
    }

    var drp = el.data('daterangerpicker');

    if (drp) {
      drp.remove();
    }

    el.daterangepicker(merge.recursive(dpOptions, columnOptions, range));
    el.on('apply.daterangepicker', function (ev, picker) {
      query[column] = {
        start: picker.startDate.format('YYYY-MM-DD HH:mm:ss'),
        end: picker.endDate.format('YYYY-MM-DD HH:mm:ss')
      };
      if (!that.vuex) that.query = query;

      that._setDatepickerText(column, picker.startDate, picker.endDate);

      that.updateState('query', query);
      search(query, {
        target: {
          name: that._getColumnName(column),
          value: query[column]
        }
      });
    });
    el.on('cancel.daterangepicker', function (ev, picker) {
      query[column] = '';
      if (!that.vuex) that.query = query;
      picker.setStartDate(moment());
      picker.setEndDate(moment());
      that.updateState('query', query);
      $(this).html("<span class='VueTables__filter-placeholder'>" + that.display('filterBy', {
        column: that.getHeading(column)
      }) + "</span>");
      search(query, {
        target: {
          name: that._getColumnName(column),
          value: query[column]
        }
      });
    });
  });
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/init-options.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/init-options.js ***!
  \********************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var merge = __webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js");

module.exports = function (defaults, globalOptions, localOptions) {
  if (globalOptions) defaults = merge.recursive(defaults, globalOptions);
  localOptions = merge.recursive(defaults, localOptions);
  return localOptions;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/init-order-by.js":
/*!*********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/init-order-by.js ***!
  \*********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  if (!this.opts.orderBy) return;
  this.orderBy.column = this.opts.orderBy.column;
  this.orderBy.ascending = this.opts.orderBy.hasOwnProperty('ascending') ? this.opts.orderBy.ascending : true;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/init-query.js":
/*!******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/init-query.js ***!
  \******************************************************************/
/***/ (function(module) {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

module.exports = function () {
  var init = this.opts.initFilters;
  if (!this.opts.filterByColumn) return init.hasOwnProperty('GENERIC') ? init.GENERIC : '';
  var query = {};
  var filterable = this.opts.filterable && _typeof(this.opts.filterable) == 'object' ? this.opts.filterable : this.columns;
  filterable.forEach(function (column) {
    query[column] = getInitialValue(init, column);
  }.bind(this));
  return query;
};

function getInitialValue(init, column) {
  if (!init.hasOwnProperty(column)) return '';
  if (typeof init[column].start == 'undefined') return init[column];
  return {
    start: init[column].start.format('YYYY-MM-DD HH:mm:ss'),
    end: init[column].end.format('YYYY-MM-DD HH:mm:ss')
  };
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/init-state.js":
/*!******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/init-state.js ***!
  \******************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  var state = {
    page: 1,
    query: this.query,
    orderBy: this.orderBy,
    perPage: this.opts.perPage,
    customQueries: this.customQueries
  };
  this.storage.setItem(this.stateKey, JSON.stringify(state));
  return state;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/initial-order-ascending.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/initial-order-ascending.js ***!
  \*******************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  return !this.opts.descOrderColumns.includes(column);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/is-date-filter.js":
/*!**********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/is-date-filter.js ***!
  \**********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  return this.query.hasOwnProperty(column) && this.opts.dateColumns.indexOf(column) > -1;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/is-list-filter.js":
/*!**********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/is-list-filter.js ***!
  \**********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  return this.opts.listColumns.hasOwnProperty(column);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/is-text-filter.js":
/*!**********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/is-text-filter.js ***!
  \**********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  return this.query.hasOwnProperty(column) && this.opts.dateColumns.indexOf(column) == -1 && !this.opts.listColumns.hasOwnProperty(column);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/on-pagination.js":
/*!*********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/on-pagination.js ***!
  \*********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (page) {
  if (this.vuex) return;
  this.setPage(page);
  this.dispatch('pagination', page);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/only-column.js":
/*!*******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/only-column.js ***!
  \*******************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  return this.userColumnsDisplay.length === 1 && this.userColumnsDisplay[0] === column;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/order-by-column.js":
/*!***********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/order-by-column.js ***!
  \***********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (colName, ev) {
  if (!this.sortable(colName)) return;
  this.setPage(1, true);

  if (ev && ev.shiftKey && this.orderBy.column && this.hasMultiSort) {
    this.setUserMultiSort(colName);
  } else {
    this.userMultiSorting = {};
    this.orderBy.ascending = colName == this.orderBy.column ? !this.orderBy.ascending : this._initialOrderAscending(colName);
    this.orderBy.column = colName;
    this.updateState('orderBy', this.orderBy);
    this.dispatch('sorted', JSON.parse(JSON.stringify(this.orderBy)));
  }

  if (this.source == 'server') {
    this.getData();
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/refresh.js":
/*!***************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/refresh.js ***!
  \***************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  this.serverSearch();
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/register-client-filters.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/register-client-filters.js ***!
  \*******************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _bus = _interopRequireDefault(__webpack_require__(/*! ../bus */ "./node_modules/vue-tables-2/compiled/bus.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

module.exports = function () {
  var _this = this;

  var event = 'vue-tables';
  if (this.name) event += '.' + this.name;
  this.opts.customFilters.forEach(function (filter) {
    _bus["default"].$off("".concat(event, ".filter::").concat(filter.name));

    _bus["default"].$on("".concat(event, ".filter::").concat(filter.name), function (value) {
      _this.setPage(1);

      _this.customQueries[filter.name] = value;

      _this.updateState('customQueries', _this.customQueries);
    });
  });
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/register-server-filters.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/register-server-filters.js ***!
  \*******************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _bus = _interopRequireDefault(__webpack_require__(/*! ../bus */ "./node_modules/vue-tables-2/compiled/bus.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

module.exports = function () {
  var event = 'vue-tables';
  if (this.name) event += '.' + this.name;
  this.opts.customFilters.forEach(function (filter) {
    _bus["default"].$off("".concat(event, ".filter::").concat(filter));

    _bus["default"].$on("".concat(event, ".filter::").concat(filter), function (value) {
      this.customQueries[filter] = value;
      this.updateState('customQueries', this.customQueries);
      this.refresh();
    }.bind(this));
  }.bind(this));
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/render.js":
/*!**************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/render.js ***!
  \**************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (row, column, index, h) {
  var value = this._getValue(row, column);

  if (this.templatesKeys.indexOf(column) == -1) {
    if (typeof value === 'undefined' || !this.opts.highlightMatches || this.filterableColumns.indexOf(column) === -1) {
      return value;
    }

    return this.highlightMatch(value, column, h);
  }

  var template = this.opts.templates[column];
  template = typeof template == 'function' ? template.apply(this.$root, [h, row, index, column]) : h(template, {
    attrs: {
      data: row,
      column: column,
      index: index
    }
  });
  return template;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/reset-custom-filters.js":
/*!****************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/reset-custom-filters.js ***!
  \****************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  for (var key in this.$refs.table.customQueries) {
    this.$refs.table.customQueries[key] = null;
  }

  this.$refs.table.updateState('customQueries', this.customQueries);
  this.$refs.table.refresh();
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/reset-query.js":
/*!*******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/reset-query.js ***!
  \*******************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  if (this.opts.filterByColumn) {
    var query = {};

    for (var key in this.query) {
      query[key] = '';
    }
  } else {
    var query = '';
  }

  this.setFilter(query);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/revert-value.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/revert-value.js ***!
  \********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function _revertVal(row, column) {
  return function () {
    var _this = this;

    row[column] = this.editing.find(function (e) {
      return e.id === row[_this.opts.uniqueKey];
    }).originalValue;
  }.bind(this);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/row-was-clicked.js":
/*!***********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/row-was-clicked.js ***!
  \***********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (row, index, event) {
  var data;
  var id = this.opts.uniqueKey;

  if (this.source == 'client' && typeof row[id] !== 'undefined') {
    data = this.tableData.filter(function (r) {
      return row[id] === r[id];
    })[0];
  } else {
    data = row;
  }

  this.dispatch('row-click', {
    row: data,
    index: index,
    event: event
  });
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/search.js":
/*!**************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/search.js ***!
  \**************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _debounce = _interopRequireDefault(__webpack_require__(/*! debounce */ "./node_modules/debounce/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

module.exports = function (debounceVal) {
  var search = this.source === 'client' ? this.search.bind(this, this.data) : this.serverSearch.bind(this);

  if (!debounceVal) {
    return search;
  }

  var debouncedSearch = (0, _debounce["default"])(search, debounceVal);
  return function (e) {
    // ignore tab
    if (e.keyCode === 9) return; // search immediately on enter

    if (e.keyCode === 13) {
      debouncedSearch.clear();
      search.apply(void 0, arguments);
    } else {
      debouncedSearch.apply(void 0, arguments);
    }
  };
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/send-request.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/send-request.js ***!
  \********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (data) {
  if (typeof this.opts.requestFunction === 'function') {
    return this.opts.requestFunction.call(this, data);
  }

  if (typeof axios !== 'undefined') return axios.get(this.url, {
    params: data
  })["catch"](function (e) {
    this.dispatch('error', e);
  }.bind(this));
  if (typeof this.$http !== 'undefined') return this.$http.get(this.url, {
    params: data
  }).then(function (data) {
    return data.json();
  }.bind(this), function (e) {
    this.dispatch('error', e);
  }.bind(this));
  if (typeof $ != 'undefined') return $.getJSON(this.url, data).fail(function (e) {
    this.dispatch('error', e);
  }.bind(this));
  throw "vue-tables: No supported ajax library was found. (jQuery, axios or vue-resource). To use a different library you can write your own request function (see the `requestFunction` option)";
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/server-search.js":
/*!*********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/server-search.js ***!
  \*********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (e, dateEvent) {
  // we need to handle the store this.query to make sure we're not mutating outside of it
  var query = this.vuex ? JSON.parse(JSON.stringify(this.query)) : this.query; // in case we pass an object manually (mostly used for init-date-filters should refactor

  if (Object.prototype.toString.call(e).slice(8, -1) == 'Object') {
    query = this.vuex ? JSON.parse(JSON.stringify(e)) : e;
    if (!this.vuex) this.query = query;
    var name = dateEvent.target.name;
    var value = dateEvent.target.value;

    if (name) {
      this.dispatch('filter', {
        name: name,
        value: value
      });
      this.dispatch("filter::".concat(name), value);
    } else {
      this.dispatch('filter', value);
    }

    this.updateState('query', query);
  } else if (e) {
    var _name = this.getName(e.target.name);

    var _value = e.target.value;

    if (_name) {
      query[_name] = _value;
    } else {
      query = _value;
    }

    if (!this.vuex) this.query = query;

    if (_name) {
      this.dispatch('filter', {
        name: _name,
        value: _value
      });
      this.dispatch("filter::".concat(_name), _value);
    } else {
      this.dispatch('filter', _value);
    }

    this.updateState('query', query);
  }

  return search(this, query);
};

function search(that, query) {
  if (that.vuex) {
    that.commit('SET_FILTER', query);
  } else {
    that.page = 1;
    that.updateState('page', 1);
    that.getData();
  }
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/set-columns-dropdown-close-listener.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/set-columns-dropdown-close-listener.js ***!
  \*******************************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  var _this = this;

  if (this.opts.columnsDropdown) {
    var stopProp = function stopProp(e) {
      return e.stopPropagation();
    };

    var handler = function handler() {
      if (_this.displayColumnsDropdown) {
        _this.displayColumnsDropdown = false;
      }
    };

    this.$refs.columnsdropdown.addEventListener('click', stopProp);
    document.addEventListener('click', handler);
    this.$once('hook:beforeDestroy', function () {
      document.removeEventListener('click', handler);

      _this.$refs.columnsdropdown.removeEventListener('click', stopProp);
    });
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/set-custom-filters.js":
/*!**************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/set-custom-filters.js ***!
  \**************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (filters) {
  var sendRequest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  for (var key in filters) {
    this.customQueries[key] = filters[key];
  }

  this.updateState('customQueries', this.customQueries);

  if (this.source === 'server' && sendRequest) {
    this.getData();
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/set-data.js":
/*!****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/set-data.js ***!
  \****************************************************************/
/***/ (function(module) {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

module.exports = function (response) {
  var data = this.opts.responseAdapter.call(this, response);
  this.data = data.data;

  if (isNaN(data.count)) {
    console.error("vue-tables-2: invalid 'count' property. Expected number, got ".concat(_typeof(data.count)));
    console.error('count equals', data.count);
    throw new Error();
  }

  this.count = parseInt(data.count);
  setTimeout(function () {
    this.dispatch('loaded', response);
  }.bind(this), 0);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/set-datepicker-text.js":
/*!***************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/set-datepicker-text.js ***!
  \***************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column, start, end) {
  var dateFormat = this.dateFormat(column);
  var el = typeof column === 'string' ? $(this.$el).find("#VueTables__" + $.escapeSelector(column) + "-filter") : column;
  el.text(start.format(dateFormat) + " - " + end.format(dateFormat));
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/set-editing-cell.js":
/*!************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/set-editing-cell.js ***!
  \************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function _setEditingCell(row, column) {
  return function (editing) {
    var _this = this;

    if (editing) {
      this.editing.push({
        id: row[this.opts.uniqueKey],
        column: column,
        originalValue: row[column]
      });
    } else {
      this.editing = this.editing.filter(function (e) {
        return e.id !== row[_this.opts.uniqueKey];
      });
    }
  }.bind(this);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/set-filter.js":
/*!******************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/set-filter.js ***!
  \******************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var merge = __webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js");

module.exports = function (filter) {
  var sendRequest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  if (!this.opts.filterable) {
    console.warn("vue-tables-2: Unable to set filter. Filtering is disabled (filterable: false)");
    return;
  }

  ;

  if (this.opts.filterByColumn && typeof filter === 'string') {
    console.warn("vue-tables-2: Unable to set filter. Filter value must be an object (`filterByColumn` is set to `true`)");
    return;
  }

  ;

  if (!this.opts.filterByColumn && typeof filter !== 'string') {
    console.warn("vue-tables-2: Unable to set filter. Filter value must be a string (`filterByColumn` is set to `false`)");
    return;
  }

  ;
  var mergedFilter = this.opts.filterByColumn ? merge(true, this.query, filter) : filter;

  if (this.vuex) {
    this.commit('SET_FILTER', mergedFilter);
  } else {
    this.query = mergedFilter;
    this.setPage(1, true);
  }

  this.updateState('query', mergedFilter);

  this._setFiltersDOM(filter);

  if (this.source == 'server' && sendRequest) {
    this.getData();
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/set-filters-dom.js":
/*!***********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/set-filters-dom.js ***!
  \***********************************************************************/
/***/ (function(module) {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

module.exports = function (query) {
  var el;

  if (this.opts.filterByColumn) {
    for (var column in query) {
      var columnName = this._getColumnName(column);

      if (this.isDateFilter(column)) {
        if (query[column] && _typeof(query[column]) === 'object') {
          var start = typeof query[column].start === 'string' ? moment(query[column].start, 'YYYY-MM-DD') : query[column].start;
          var end = typeof query[column].end === 'string' ? moment(query[column].end, 'YYYY-MM-DD') : query[column].end;

          this._setDatepickerText(column, start, end);
        } else {
          $(this.$el).find("#VueTables__" + $.escapeSelector(column) + "-filter").html("<span class='VueTables__filter-placeholder'>" + this.display('filterBy', {
            column: this.getHeading(column)
          }) + "</span>");
        }

        continue;
      }

      el = this.$el.querySelector("[name='".concat(columnName.replace("'", "\\'"), "']"));

      if (el) {
        el.value = query[column];
      } else if (this.columns.indexOf(column) === -1) {
        console.error("vue-tables-2: Error in setting filter value. Column '".concat(column, "' does not exist."));
      }
    }
  } else {
    var el = this.$el.querySelector('.VueTables__search__input');
    if (el) el.value = query;
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/set-limit.js":
/*!*****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/set-limit.js ***!
  \*****************************************************************/
/***/ (function(module) {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

module.exports = function (e) {
  var sendRequest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  this.limit = _typeof(e) === 'object' ? e.target.value : e;
  this.updateState('perPage', this.limit);
  this.dispatch('limit', parseInt(this.limit));

  if (sendRequest) {
    this.setPage(1);
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/set-order.js":
/*!*****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/set-order.js ***!
  \*****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column, ascending) {
  var sendRequest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  this.orderBy.column = column;
  this.orderBy.ascending = ascending;
  this.updateState('orderBy', {
    column: column,
    ascending: ascending
  });

  if (this.source == 'server' && sendRequest) {
    this.getData();
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/set-page.js":
/*!****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/set-page.js ***!
  \****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (page) {
  var preventRequest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  page = parseInt(page);
  this.page = page > 0 ? page : 1;
  this.updateState('page', page);
  this.dispatch('pagination', page);
  if (this.source == 'server' && !preventRequest) this.getData();
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/set-request-params.js":
/*!**************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/set-request-params.js ***!
  \**************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var sendRequest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  if (params.page) {
    this.setPage(params.page, true);
  }

  if (params.limit) {
    this.setLimit(params.limit, false);
  }

  if (params.order) {
    this.setOrder(params.order.column, params.order.ascending, false);
  }

  if (params.filters) {
    this.setFilter(params.filters, false);
  }

  if (params.customFilters) {
    this.setCustomFilters(params.customFilters, false);
  }

  if (sendRequest) {
    this.getData();
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/set-user-multi-sort.js":
/*!***************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/set-user-multi-sort.js ***!
  \***************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (secondaryCol) {
  var primaryCol = this.orderBy.column;
  var primaryAsc = this.orderBy.ascending;
  if (!this.userMultiSorting[primaryCol]) this.$set(this.userMultiSorting, primaryCol, []);
  var multi = this.userMultiSorting[primaryCol];

  if (primaryCol === secondaryCol) {
    if (!multi.length || primaryAsc) {
      // primary is the only sorted column or is ascending
      this.orderBy.ascending = !this.orderBy.ascending;
    } else {
      // remove primary column and make secondary primary
      this.orderBy = multi.shift();
      this.userMultiSorting = {};
      this.$set(this.userMultiSorting, this.orderBy.column, multi);
    }
  } else {
    var secondary = multi.filter(function (col) {
      return col.column == secondaryCol;
    })[0];

    if (secondary) {
      if (!secondary.ascending) {
        // remove sort
        this.$set(this.userMultiSorting, primaryCol, multi.filter(function (col) {
          return col.column != secondaryCol;
        }));
        if (!this.userMultiSorting[primaryCol].length) this.userMultiSorting = {};
      } else {
        // change direction
        secondary.ascending = !secondary.ascending;
      }
    } else {
      // add sort
      multi.push({
        column: secondaryCol,
        ascending: true
      });
    }
  } // force re-compilation of the filteredData computed property


  this.time = Date.now();
  this.dispatch('sorted', getMultiSortData(this.orderBy, this.userMultiSorting));
};

function getMultiSortData(main, secondary) {
  var cols = [JSON.parse(JSON.stringify(main))];
  cols = cols.concat(secondary[main.column]);
  return cols;
}

;

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/should-show-column-on-init.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/should-show-column-on-init.js ***!
  \**********************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  if (this.opts.visibleColumns) {
    return this.opts.visibleColumns.includes(column);
  }

  if (this.opts.hiddenColumns) {
    return !this.opts.hiddenColumns.includes(column);
  }

  return true;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/sortable-chevron-class.js":
/*!******************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/sortable-chevron-class.js ***!
  \******************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  var cls = this.opts.sortIcon.base + ' ';
  if (!this.sortable(column)) return;

  if (this.opts.sortIcon.is && !this._currentlySorted(column)) {
    cls += this.opts.sortIcon.is + ' ';
  }

  if (this.hasMultiSort && this.orderBy.column && this.userMultiSorting[this.orderBy.column]) {
    var col = this.userMultiSorting[this.orderBy.column].filter(function (c) {
      return c.column === column;
    })[0];
    if (col) cls += col.ascending ? this.opts.sortIcon.up : this.opts.sortIcon.down;
  }

  if (column == this.orderBy.column) {
    cls += this.orderBy.ascending == 1 ? this.opts.sortIcon.up : this.opts.sortIcon.down;
  }

  return cls;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/sortable-class.js":
/*!**********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/sortable-class.js ***!
  \**********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  var c = this.sortable(column) ? 'VueTables__sortable ' : '';
  c += this.columnClass(column);

  if (this.orderBy.column === column) {
    c += "".concat(column, "-sorted-") + (this.orderBy.ascending ? 'asc' : 'desc');
  }

  return c;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/sortable.js":
/*!****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/sortable.js ***!
  \****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  var sortAll = typeof this.opts.sortable == 'boolean' && this.opts.sortable;
  if (sortAll) return true;
  return this.opts.sortable.indexOf(column) > -1;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/toggle-child-row.js":
/*!************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/toggle-child-row.js ***!
  \************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (rowId, e) {
  if (e) e.stopPropagation();

  if (this.openChildRows.includes(rowId)) {
    var index = this.openChildRows.indexOf(rowId);
    this.openChildRows.splice(index, 1);
  } else {
    this.openChildRows.push(rowId);
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/toggle-column.js":
/*!*********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/toggle-column.js ***!
  \*********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (column) {
  var _this = this;

  if (!this.userControlsColumns) {
    this.userColumnsDisplay = JSON.parse(JSON.stringify(this.allColumns));
    this.userControlsColumns = true;
  }

  if (this.userColumnsDisplay.includes(column)) {
    // can't have no columns
    if (this.userColumnsDisplay.length === 1) return;
    var index = this.userColumnsDisplay.indexOf(column);
    this.userColumnsDisplay.splice(index, 1);
  } else {
    this.userColumnsDisplay.push(column);
  }

  this.updateState('userControlsColumns', true);
  this.updateState('userColumnsDisplay', this.userColumnsDisplay);
  this.$nextTick(function () {
    _this._setFiltersDOM(_this.query);

    if (_this.userColumnsDisplay.includes(column) && _this.opts.dateColumns.includes(column)) {
      _this.initDateFilters();
    }
  });
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/toggle-columns-dropdown.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/toggle-columns-dropdown.js ***!
  \*******************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  this.displayColumnsDropdown = !this.displayColumnsDropdown;
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/toggle-group-direction.js":
/*!******************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/toggle-group-direction.js ***!
  \******************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  if (this.orderBy.column != this.opts.groupBy) {
    this.setOrder(this.opts.groupBy, true);
  } else {
    this.setOrder(this.opts.groupBy, !this.orderBy.ascending);
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/transform-date-strings-to-moment.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/transform-date-strings-to-moment.js ***!
  \****************************************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  this.data.forEach(function (row, index) {
    this.opts.dateColumns.forEach(function (column) {
      row[column] = row[column] ? moment(row[column], this.opts.toMomentFormat) : '';
    }.bind(this));
  }.bind(this));
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/update-state.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/update-state.js ***!
  \********************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function (key, value) {
  if (!this.opts.saveState || !this.activeState) return;

  try {
    var currentState = JSON.parse(this.storage.getItem(this.stateKey));
  } catch (e) {
    var currentState = this.initState();
  }

  currentState[key] = value;
  this.storage.setItem(this.stateKey, JSON.stringify(currentState));
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/methods/update-value.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/methods/update-value.js ***!
  \********************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var clone = __webpack_require__(/*! lodash.clonedeep */ "./node_modules/lodash.clonedeep/index.js");

module.exports = function _updateValue(row, column) {
  return function (e) {
    var _this = this;

    var oldVal = row[column];
    row[column] = getValue(e);
    var data = clone(this.data).map(function (r) {
      if (r[_this.opts.uniqueKey] === row[_this.opts.uniqueKey]) {
        return row;
      }

      return r;
    });
    this.dispatch('input', data);
    this.dispatch('update', {
      row: row,
      column: column,
      oldVal: oldVal,
      newVal: row[column]
    });
  }.bind(this);
};

function getValue(val) {
  if (val.target) {
    return val.target.type === 'checkbox' ? val.target.checked : val.target.value;
  }

  return val;
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/mixins/before-destroy.js":
/*!*********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/mixins/before-destroy.js ***!
  \*********************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _bus = _interopRequireDefault(__webpack_require__(/*! ../bus */ "./node_modules/vue-tables-2/compiled/bus.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

module.exports = function () {
  var _this = this;

  var el;

  if (this.opts.destroyEventBus) {
    _bus["default"].$off();

    _bus["default"].$destroy();
  }

  if (this.vuex && !this.opts.preserveState) {
    this.$store.unregisterModule(this.name);
  }

  if (this.opts.filterByColumn) {
    this.datepickerColumns.forEach(function (column) {
      el = $(_this.$el).find("#VueTables__" + $.escapeSelector(column) + "-filter").data('daterangepicker');
      if (el) el.remove();
    });
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/mixins/computed.js":
/*!***************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/mixins/computed.js ***!
  \***************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


module.exports = {
  listColumnsObject: __webpack_require__(/*! ../computed/list-columns-object */ "./node_modules/vue-tables-2/compiled/computed/list-columns-object.js"),
  allColumns: __webpack_require__(/*! ../computed/all-columns */ "./node_modules/vue-tables-2/compiled/computed/all-columns.js"),
  templatesKeys: __webpack_require__(/*! ../computed/templates-keys */ "./node_modules/vue-tables-2/compiled/computed/templates-keys.js"),
  opts: __webpack_require__(/*! ../computed/opts */ "./node_modules/vue-tables-2/compiled/computed/opts.js"),
  tableData: __webpack_require__(/*! ../computed/table-data */ "./node_modules/vue-tables-2/compiled/computed/table-data.js"),
  storage: __webpack_require__(/*! ../computed/storage */ "./node_modules/vue-tables-2/compiled/computed/storage.js"),
  filterableColumns: __webpack_require__(/*! ../computed/filterable-columns */ "./node_modules/vue-tables-2/compiled/computed/filterable-columns.js"),
  datepickerColumns: __webpack_require__(/*! ../computed/datepicker-columns */ "./node_modules/vue-tables-2/compiled/computed/datepicker-columns.js"),
  hasChildRow: __webpack_require__(/*! ../computed/has-child-row */ "./node_modules/vue-tables-2/compiled/computed/has-child-row.js"),
  colspan: __webpack_require__(/*! ../computed/colspan */ "./node_modules/vue-tables-2/compiled/computed/colspan.js"),
  hasGenericFilter: __webpack_require__(/*! ../computed/has-generic-filter */ "./node_modules/vue-tables-2/compiled/computed/has-generic-filter.js"),
  perPageValues: __webpack_require__(/*! ../computed/per-page-values */ "./node_modules/vue-tables-2/compiled/computed/per-page-values.js"),
  filtersCount: function filtersCount() {
    return this.opts.filterByColumn ? Object.values(this.query).filter(function (val) {
      return !!val;
    }).length : !!this.query ? 1 : 0;
  },
  stateKey: function stateKey() {
    var key = this.name ? this.name : this.id;
    return 'vuetables_' + key;
  },
  Page: function Page() {
    return this.page;
  },
  tabIndex: function tabIndex() {
    return this.opts.tabbable ? 0 : -1;
  }
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/mixins/created.js":
/*!**************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/mixins/created.js ***!
  \**************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var is_empty = __webpack_require__(/*! ../helpers/is-empty */ "./node_modules/vue-tables-2/compiled/helpers/is-empty.js");

var registerVuexModule = __webpack_require__(/*! ../state/register-module */ "./node_modules/vue-tables-2/compiled/state/register-module.js");

module.exports = function (self) {
  if (self.vuex) {
    registerVuexModule(self);
  } else {
    self.limit = self.opts.perPage;
  }

  if (is_empty(self.opts.columnsDisplay) || typeof window === 'undefined') return;
  self.columnsDisplay = getColumnsDisplay(self.opts.columnsDisplay);
  window.addEventListener('resize', function () {
    self.windowWidth = window.innerWidth;
  }.bind(self));
};

function getColumnsDisplay(columnsDisplay) {
  var res = {};
  var range;
  var device;
  var operator;

  for (var column in columnsDisplay) {
    operator = getOperator(columnsDisplay[column]);

    try {
      device = getDevice(columnsDisplay[column]);
      range = getRange(device, operator);
      res[column] = range.concat([operator]);
    } catch (err) {
      console.warn('Unknown device ' + device);
    }
  }

  return res;
}

function getRange(device, operator) {
  var devices = {
    desktopHuge: [1920, null],
    desktopLarge: [1280, 1920],
    desktop: [1024, 1280],
    tablet: [480, 1024],
    mobile: [0, 480],
    tabletL: [768, 1024],
    tabletP: [480, 768],
    mobileL: [320, 480],
    mobileP: [0, 320]
  };

  switch (operator) {
    case 'min':
      return [devices[device][0], null];

    case 'max':
      return [0, devices[device][1]];

    default:
      return devices[device];
  }
}

function getOperator(val) {
  var pieces = val.split('_');
  if (['not', 'min', 'max'].indexOf(pieces[0]) > -1) return pieces[0];
  return false;
}

function getDevice(val) {
  var pieces = val.split('_');
  return pieces.length > 1 ? pieces[1] : pieces[0];
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/mixins/data.js":
/*!***********************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/mixins/data.js ***!
  \***********************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return {
    id: makeId(),
    allFilteredData: [],
    openChildRows: [],
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : null,
    userMultiSorting: {},
    editing: []
  };
};

function makeId() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/mixins/methods.js":
/*!**************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/mixins/methods.js ***!
  \**************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


module.exports = {
  initQuery: __webpack_require__(/*! ../methods/init-query */ "./node_modules/vue-tables-2/compiled/methods/init-query.js"),
  resetQuery: __webpack_require__(/*! ../methods/reset-query */ "./node_modules/vue-tables-2/compiled/methods/reset-query.js"),
  initCustomFilters: __webpack_require__(/*! ../methods/init-custom-filters */ "./node_modules/vue-tables-2/compiled/methods/init-custom-filters.js"),
  initOptions: __webpack_require__(/*! ../methods/init-options */ "./node_modules/vue-tables-2/compiled/methods/init-options.js"),
  sortableClass: __webpack_require__(/*! ../methods/sortable-class */ "./node_modules/vue-tables-2/compiled/methods/sortable-class.js"),
  sortableChevronClass: __webpack_require__(/*! ../methods/sortable-chevron-class */ "./node_modules/vue-tables-2/compiled/methods/sortable-chevron-class.js"),
  display: __webpack_require__(/*! ../methods/display */ "./node_modules/vue-tables-2/compiled/methods/display.js"),
  orderByColumn: __webpack_require__(/*! ../methods/order-by-column */ "./node_modules/vue-tables-2/compiled/methods/order-by-column.js"),
  getHeading: __webpack_require__(/*! ../methods/get-heading */ "./node_modules/vue-tables-2/compiled/methods/get-heading.js"),
  getHeadingTooltip: __webpack_require__(/*! ../methods/get-heading-tooltip */ "./node_modules/vue-tables-2/compiled/methods/get-heading-tooltip.js"),
  sortable: __webpack_require__(/*! ../methods/sortable */ "./node_modules/vue-tables-2/compiled/methods/sortable.js"),
  serverSearch: __webpack_require__(/*! ../methods/server-search */ "./node_modules/vue-tables-2/compiled/methods/server-search.js"),
  initOrderBy: __webpack_require__(/*! ../methods/init-order-by */ "./node_modules/vue-tables-2/compiled/methods/init-order-by.js"),
  initDateFilters: __webpack_require__(/*! ../methods/init-date-filters */ "./node_modules/vue-tables-2/compiled/methods/init-date-filters.js"),
  setFilter: __webpack_require__(/*! ../methods/set-filter */ "./node_modules/vue-tables-2/compiled/methods/set-filter.js"),
  setPage: __webpack_require__(/*! ../methods/set-page */ "./node_modules/vue-tables-2/compiled/methods/set-page.js"),
  setOrder: __webpack_require__(/*! ../methods/set-order */ "./node_modules/vue-tables-2/compiled/methods/set-order.js"),
  filterable: __webpack_require__(/*! ../methods/filterable */ "./node_modules/vue-tables-2/compiled/methods/filterable.js"),
  isTextFilter: __webpack_require__(/*! ../methods/is-text-filter */ "./node_modules/vue-tables-2/compiled/methods/is-text-filter.js"),
  isDateFilter: __webpack_require__(/*! ../methods/is-date-filter */ "./node_modules/vue-tables-2/compiled/methods/is-date-filter.js"),
  isListFilter: __webpack_require__(/*! ../methods/is-list-filter */ "./node_modules/vue-tables-2/compiled/methods/is-list-filter.js"),
  highlightMatch: __webpack_require__(/*! ../filters/highlight-matches */ "./node_modules/vue-tables-2/compiled/filters/highlight-matches.js"),
  formatDate: __webpack_require__(/*! ../filters/format-date */ "./node_modules/vue-tables-2/compiled/filters/format-date.js"),
  hasDateFilters: __webpack_require__(/*! ../methods/has-date-filters */ "./node_modules/vue-tables-2/compiled/methods/has-date-filters.js"),
  optionText: __webpack_require__(/*! ../filters/option-text */ "./node_modules/vue-tables-2/compiled/filters/option-text.js"),
  render: __webpack_require__(/*! ../methods/render */ "./node_modules/vue-tables-2/compiled/methods/render.js"),
  rowWasClicked: __webpack_require__(/*! ../methods/row-was-clicked */ "./node_modules/vue-tables-2/compiled/methods/row-was-clicked.js"),
  setLimit: __webpack_require__(/*! ../methods/set-limit */ "./node_modules/vue-tables-2/compiled/methods/set-limit.js"),
  getOpenChildRows: __webpack_require__(/*! ../methods/get-open-child-rows */ "./node_modules/vue-tables-2/compiled/methods/get-open-child-rows.js"),
  dispatch: __webpack_require__(/*! ../methods/dispatch */ "./node_modules/vue-tables-2/compiled/methods/dispatch.js"),
  toggleChildRow: __webpack_require__(/*! ../methods/toggle-child-row */ "./node_modules/vue-tables-2/compiled/methods/toggle-child-row.js"),
  childRowTogglerClass: __webpack_require__(/*! ../methods/child-row-toggler-class */ "./node_modules/vue-tables-2/compiled/methods/child-row-toggler-class.js"),
  sendRequest: __webpack_require__(/*! ../methods/send-request */ "./node_modules/vue-tables-2/compiled/methods/send-request.js"),
  getResponseData: __webpack_require__(/*! ../methods/get-response-data */ "./node_modules/vue-tables-2/compiled/methods/get-response-data.js"),
  getSortFn: __webpack_require__(/*! ../methods/get-sort-fn */ "./node_modules/vue-tables-2/compiled/methods/get-sort-fn.js"),
  initState: __webpack_require__(/*! ../methods/init-state */ "./node_modules/vue-tables-2/compiled/methods/init-state.js"),
  updateState: __webpack_require__(/*! ../methods/update-state */ "./node_modules/vue-tables-2/compiled/methods/update-state.js"),
  columnClass: __webpack_require__(/*! ../methods/column-class */ "./node_modules/vue-tables-2/compiled/methods/column-class.js"),
  getName: __webpack_require__(/*! ../methods/get-name */ "./node_modules/vue-tables-2/compiled/methods/get-name.js"),
  toggleColumn: __webpack_require__(/*! ../methods/toggle-column */ "./node_modules/vue-tables-2/compiled/methods/toggle-column.js"),
  setUserMultiSort: __webpack_require__(/*! ../methods/set-user-multi-sort */ "./node_modules/vue-tables-2/compiled/methods/set-user-multi-sort.js"),
  _cellClasses: __webpack_require__(/*! ../methods/cell-classes */ "./node_modules/vue-tables-2/compiled/methods/cell-classes.js"),
  _setFiltersDOM: __webpack_require__(/*! ../methods/set-filters-dom */ "./node_modules/vue-tables-2/compiled/methods/set-filters-dom.js"),
  _currentlySorted: __webpack_require__(/*! ../methods/currently-sorted */ "./node_modules/vue-tables-2/compiled/methods/currently-sorted.js"),
  _getChildRowTemplate: __webpack_require__(/*! ../methods/get-child-row-template */ "./node_modules/vue-tables-2/compiled/methods/get-child-row-template.js"),
  _toggleColumnsDropdown: __webpack_require__(/*! ../methods/toggle-columns-dropdown */ "./node_modules/vue-tables-2/compiled/methods/toggle-columns-dropdown.js"),
  _onlyColumn: __webpack_require__(/*! ../methods/only-column */ "./node_modules/vue-tables-2/compiled/methods/only-column.js"),
  _onPagination: __webpack_require__(/*! ../methods/on-pagination */ "./node_modules/vue-tables-2/compiled/methods/on-pagination.js"),
  _toggleGroupDirection: __webpack_require__(/*! ../methods/toggle-group-direction */ "./node_modules/vue-tables-2/compiled/methods/toggle-group-direction.js"),
  _getInitialDateRange: __webpack_require__(/*! ../methods/get-initial-date-range */ "./node_modules/vue-tables-2/compiled/methods/get-initial-date-range.js"),
  _setDatepickerText: __webpack_require__(/*! ../methods/set-datepicker-text */ "./node_modules/vue-tables-2/compiled/methods/set-datepicker-text.js"),
  _initialOrderAscending: __webpack_require__(/*! ../methods/initial-order-ascending */ "./node_modules/vue-tables-2/compiled/methods/initial-order-ascending.js"),
  dateFormat: __webpack_require__(/*! ../methods/date-format */ "./node_modules/vue-tables-2/compiled/methods/date-format.js"),
  _setColumnsDropdownCloseListener: __webpack_require__(/*! ../methods/set-columns-dropdown-close-listener */ "./node_modules/vue-tables-2/compiled/methods/set-columns-dropdown-close-listener.js"),
  _getValue: __webpack_require__(/*! ../methods/get-value */ "./node_modules/vue-tables-2/compiled/methods/get-value.js"),
  _getColumnName: __webpack_require__(/*! ../methods/get-column-name */ "./node_modules/vue-tables-2/compiled/methods/get-column-name.js"),
  _shouldShowColumnOnInit: __webpack_require__(/*! ../methods/should-show-column-on-init */ "./node_modules/vue-tables-2/compiled/methods/should-show-column-on-init.js"),
  _setEditingCell: __webpack_require__(/*! ../methods/set-editing-cell */ "./node_modules/vue-tables-2/compiled/methods/set-editing-cell.js"),
  _revertValue: __webpack_require__(/*! ../methods/revert-value */ "./node_modules/vue-tables-2/compiled/methods/revert-value.js"),
  _updateValue: __webpack_require__(/*! ../methods/update-value */ "./node_modules/vue-tables-2/compiled/methods/update-value.js"),
  _filterType: __webpack_require__(/*! ../methods/filter-type */ "./node_modules/vue-tables-2/compiled/methods/filter-type.js"),
  _search: __webpack_require__(/*! ../methods/search */ "./node_modules/vue-tables-2/compiled/methods/search.js"),
  setCustomFilters: __webpack_require__(/*! ../methods/set-custom-filters */ "./node_modules/vue-tables-2/compiled/methods/set-custom-filters.js")
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/mixins/provide.js":
/*!**************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/mixins/provide.js ***!
  \**************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  var _this = this;

  return {
    count: function count() {
      return _this.count;
    },
    rowWasClicked: this.rowWasClicked,
    render: this.render,
    opts: function opts() {
      return _this.opts;
    },
    limit: function limit() {
      return _this.limit;
    },
    setLimit: this.setLimit,
    perPageValues: function perPageValues() {
      return _this.perPageValues;
    },
    page: function page() {
      return _this.page;
    },
    id: this.id,
    theme: this.theme,
    display: this.display,
    origColumns: this.columns,
    allColumns: function allColumns() {
      return _this.allColumns;
    },
    sortableClass: this.sortableClass,
    getHeadingTooltip: this.getHeadingTooltip,
    getHeading: this.getHeading,
    sortable: this.sortable,
    sortableChevronClass: this.sortableChevronClass,
    orderByColumn: this.orderByColumn,
    filteredData: function filteredData() {
      return _this.filteredData;
    },
    tableData: function tableData() {
      return _this.tableData;
    },
    source: this.source,
    colspan: function colspan() {
      return _this.colspan;
    },
    setEditingCell: this._setEditingCell,
    revertValue: this._revertValue,
    updateValue: this._updateValue,
    editing: function editing() {
      return _this.editing;
    },
    hasChildRow: function hasChildRow() {
      return _this.hasChildRow;
    },
    getChildRowTemplate: this._getChildRowTemplate,
    openChildRows: function openChildRows() {
      return _this.openChildRows;
    },
    vuex: this.vuex,
    name: this.name,
    setPage: this.setPage,
    totalPages: function totalPages() {
      return _this.totalPages;
    },
    query: function query() {
      return _this.query;
    },
    filterable: this.filterable,
    filterType: this._filterType,
    columnClass: this.columnClass,
    search: this._search,
    getColumnName: this._getColumnName,
    onlyColumn: this._onlyColumn,
    toggleColumn: this.toggleColumn,
    toggleColumnsDropdown: this._toggleColumnsDropdown,
    displayColumnsDropdown: function displayColumnsDropdown() {
      return _this.displayColumnsDropdown;
    },
    childRowTogglerClass: this.childRowTogglerClass,
    toggleChildRow: this.toggleChildRow,
    componentsOverride: this.componentsOverride,
    getValue: this._getValue,
    cellClasses: this._cellClasses,
    toggleGroup: this.toggleGroup,
    groupToggleIcon: this.groupToggleIcon,
    getGroupSlot: this.getGroupSlot,
    toggleGroupDirection: this._toggleGroupDirection,
    collapsedGroups: function collapsedGroups() {
      return _this.collapsedGroups;
    },
    userMultiSorting: function userMultiSorting() {
      return _this.userMultiSorting;
    },
    hasMultiSort: this.hasMultiSort,
    orderBy: function orderBy() {
      return _this.orderBy;
    },
    isListFilter: this.isListFilter,
    optionText: this.optionText,
    dateFormat: this.dateFormat,
    formatDate: this.formatDate,
    tabIndex: function tabIndex() {
      return _this.tabIndex;
    },
    loading: function loading() {
      return _this.loading;
    },
    initialRequestSent: function initialRequestSent() {
      return _this.initialRequestSent;
    }
  };
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/state/data.js":
/*!**********************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/state/data.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;

var _merge = _interopRequireDefault(__webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _default(useVuex, source) {
  var page = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var data = {
    vuex: true,
    activeState: false,
    userColumnsDisplay: [],
    userControlsColumns: false,
    displayColumnsDropdown: false,
    collapsedGroups: []
  };
  if (useVuex) return data;
  data = (0, _merge["default"])(data, {
    vuex: false,
    count: 0,
    customQueries: {},
    query: null,
    page: page,
    limit: 10,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : null,
    orderBy: {
      column: false,
      ascending: true
    }
  });
  if (source == 'server') data.data = [];
  return data;
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/state/mutations.js":
/*!***************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/state/mutations.js ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;

var _merge = _interopRequireDefault(__webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _default(self) {
  var _ref, _merge$recursive;

  var extra = self.source == 'server' ? (_ref = {}, _defineProperty(_ref, "".concat(self.name, "/SET_DATA"), function SET_DATA(state, response) {
    var data = self.opts.responseAdapter.call(self, response);
    state.data = data.data;
    state.count = parseInt(data.count);
  }), _defineProperty(_ref, "".concat(self.name, "/ERROR"), function ERROR(state, payload) {}), _defineProperty(_ref, "".concat(self.name, "/SET_COUNT"), function SET_COUNT(state, count) {
    state.count = count;
  }), _ref) : _defineProperty({}, "".concat(self.name, "/SET_COUNT"), function SET_COUNT(state, count) {
    state.count = count;
  });
  return _merge["default"].recursive(true, (_merge$recursive = {}, _defineProperty(_merge$recursive, "".concat(self.name, "/PAGINATE"), function PAGINATE(state, page) {
    if (page === 0) {
      page = 1;
    }

    state.page = page;
    self.updateState('page', page);
    if (self.source == 'server') self.getData();
    self.commit('PAGINATION', page);
  }), _defineProperty(_merge$recursive, "".concat(self.name, "/SET_FILTER"), function SET_FILTER(state, filter) {
    state.page = 1;
    self.updateState('page', 1);
    state.query = filter;

    if (self.source == 'server') {
      self.getData();
    }
  }), _defineProperty(_merge$recursive, "".concat(self.name, "/PAGINATION"), function PAGINATION(state, page) {}), _defineProperty(_merge$recursive, "".concat(self.name, "/SET_CUSTOM_FILTER"), function SET_CUSTOM_FILTER(state, _ref3) {
    var filter = _ref3.filter,
        value = _ref3.value;
    state.customQueries[filter] = value;
    state.page = 1;
    self.updateState('page', 1);
    self.updateState('customQueries', state.customQueries);

    if (self.source == 'server') {
      self.getData();
    }
  }), _defineProperty(_merge$recursive, "".concat(self.name, "/SET_STATE"), function SET_STATE(state, _ref4) {
    var page = _ref4.page,
        query = _ref4.query,
        customQueries = _ref4.customQueries,
        limit = _ref4.limit,
        orderBy = _ref4.orderBy;

    if (customQueries) {
      state.customQueries = customQueries;
    }

    if (typeof query !== 'undefined') {
      state.query = query;
    }

    if (page) {
      state.page = page;
    }

    if (limit) {
      state.limit = limit;
    }

    if (typeof orderBy !== 'undefined') {
      state.ascending = orderBy.ascending;
      state.sortBy = orderBy.column;
    }
  }), _defineProperty(_merge$recursive, "".concat(self.name, "/SET_LIMIT"), function SET_LIMIT(state, limit) {
    state.page = 1;
    self.updateState('page', 1);
    state.limit = limit;
    if (self.source == 'server') self.getData();
  }), _defineProperty(_merge$recursive, "".concat(self.name, "/SORT"), function SORT(state, _ref5) {
    var column = _ref5.column,
        ascending = _ref5.ascending;
    state.ascending = ascending;
    state.sortBy = column;
    if (self.source == 'server') self.getData();
  }), _defineProperty(_merge$recursive, "".concat(self.name, "/SET_CLIENT_DATA"), function SET_CLIENT_DATA(state, data) {
    state.data = data;
  }), _defineProperty(_merge$recursive, "".concat(self.name, "/SORTED"), function SORTED(state, data) {}), _defineProperty(_merge$recursive, "".concat(self.name, "/ROW_CLICK"), function ROW_CLICK(state, row) {}), _defineProperty(_merge$recursive, "".concat(self.name, "/FILTER"), function FILTER(state, row) {}), _defineProperty(_merge$recursive, "".concat(self.name, "/LIMIT"), function LIMIT(state, limit) {}), _defineProperty(_merge$recursive, "".concat(self.name, "/INPUT"), function INPUT(state, payload) {}), _defineProperty(_merge$recursive, "".concat(self.name, "/UPDATE"), function UPDATE(state, payload) {}), _defineProperty(_merge$recursive, "".concat(self.name, "/LOADING"), function LOADING(state, payload) {}), _defineProperty(_merge$recursive, "".concat(self.name, "/LOADED"), function LOADED(state, payload) {}), _merge$recursive), extra);
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/state/normal.js":
/*!************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/state/normal.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;

function _default() {
  return {
    computed: {
      Columns: function Columns() {
        return this.columns;
      }
    }
  };
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/state/register-module.js":
/*!*********************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/state/register-module.js ***!
  \*********************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _state = _interopRequireDefault(__webpack_require__(/*! ./state */ "./node_modules/vue-tables-2/compiled/state/state.js"));

var _mutations = _interopRequireDefault(__webpack_require__(/*! ./mutations */ "./node_modules/vue-tables-2/compiled/state/mutations.js"));

var _merge = _interopRequireDefault(__webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

module.exports = function (self) {
  var Module = {
    state: (0, _state["default"])(self),
    mutations: (0, _mutations["default"])(self)
  };
  var hasModule = self.$store.hasModule ? self.$store.hasModule(self.name) : self.$store.state && self.$store.state[self.name];

  if (hasModule) {
    Module.state = _merge["default"].recursive(Module.state, self.$store.state[self.name]);
    self.$store.unregisterModule(self.name);
  }

  self.$store.registerModule(self.name, Module);
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/state/state.js":
/*!***********************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/state/state.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;

var _merge = _interopRequireDefault(__webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _default(self) {
  var state = {
    page: self.opts.initialPage ? self.opts.initialPage : 1,
    limit: self.opts.perPage,
    count: self.source == 'server' ? 0 : self.data.length,
    columns: self.columns,
    data: self.source == 'client' ? self.data : [],
    query: self.initQuery(),
    customQueries: self.initCustomFilters(),
    sortBy: self.opts.orderBy && self.opts.orderBy.column ? self.opts.orderBy.column : false,
    ascending: self.opts.orderBy && self.opts.orderBy.hasOwnProperty('ascending') ? self.opts.orderBy.ascending : true
  };

  if (typeof self.$store.state[self.name] !== 'undefined') {
    return (0, _merge["default"])(true, self.$store.state[self.name], state);
  }

  return state;
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/state/vuex.js":
/*!**********************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/state/vuex.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;

var _merge = _interopRequireDefault(__webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _default(source) {
  var extra = source == 'server' ? serverExtra() : clientExtra();
  return _merge["default"].recursive(true, {
    props: {
      name: {
        type: String,
        required: true
      }
    },
    computed: {
      state: function state() {
        return this.$store.state[this.name] ? this.$store.state[this.name] : {};
      },
      Page: function Page() {
        return this.state.page;
      },
      count: function count() {
        return this.state.count;
      },
      Columns: function Columns() {
        return this.state.columns ? this.state.columns : [];
      },
      tableData: function tableData() {
        return this.state.data ? this.state.data : [];
      },
      page: function page() {
        return this.state.page;
      },
      limit: function limit() {
        return this.state.limit;
      },
      customQueries: function customQueries() {
        return this.state.customQueries;
      },
      query: function query() {
        return this.state.query;
      },
      orderBy: function orderBy() {
        return {
          column: this.state.sortBy,
          ascending: this.state.ascending
        };
      }
    },
    methods: {
      commit: function commit(action, payload) {
        return this.$store.commit("".concat(this.name, "/").concat(action), payload);
      },
      orderByColumn: function orderByColumn(column, ev) {
        if (!this.sortable(column)) return;

        if (ev.shiftKey && this.orderBy.column && this.hasMultiSort) {
          this.setUserMultiSort(column);
        } else {
          var ascending = this.orderBy.column === column ? !this.orderBy.ascending : this._initialOrderAscending(column);
          var orderBy = {
            column: column,
            ascending: ascending
          };
          this.updateState('orderBy', orderBy);
          this.commit('SORT', orderBy);
          this.dispatch('sorted', orderBy);
        }
      },
      setLimit: function setLimit(e) {
        var limit = _typeof(e) === 'object' ? parseInt(e.target.value) : e;
        this.updateState('perPage', limit);
        this.commit("SET_LIMIT", limit);
        this.dispatch("limit", limit);
      },
      setOrder: function setOrder(column, ascending) {
        this.updateState('orderBy', {
          column: column,
          ascending: ascending
        });
        this.commit('SORT', {
          column: column,
          ascending: ascending
        });
      },
      setPage: function setPage(page) {
        this.dispatch('pagination', page);
        this.commit("PAGINATE", page);
      }
    }
  }, extra);
}

function serverExtra() {
  return {
    methods: {
      setData: function setData(data) {
        this.commit('SET_DATA', data);
        setTimeout(function () {
          this.dispatch('loaded', data);
        }.bind(this), 0);
      },
      setRequestParams: function setRequestParams() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var sendRequest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var data = this.convertParams(params);

        if (typeof data.query !== 'undefined') {
          this._setFiltersDOM(data.query);
        }

        this.commit('SET_STATE', data);

        if (sendRequest) {
          this.getData();
        }
      },
      convertParams: function convertParams(params) {
        if (params.order) {
          params.orderBy = params.order;
          delete params.order;
        }

        if (typeof params.filters !== 'undefined') {
          params.query = params.filters;
          delete params.filters;
        }

        return params;
      }
    }
  };
}

function clientExtra() {
  return {};
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/table.js":
/*!*****************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/table.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;

var methods = __webpack_require__(/*! ./mixins/methods */ "./node_modules/vue-tables-2/compiled/mixins/methods.js");

var computed = __webpack_require__(/*! ./mixins/computed */ "./node_modules/vue-tables-2/compiled/mixins/computed.js");

var beforeDestroy = __webpack_require__(/*! ./mixins/before-destroy */ "./node_modules/vue-tables-2/compiled/mixins/before-destroy.js");

function _default() {
  return {
    methods: methods,
    computed: computed,
    beforeDestroy: beforeDestroy
  };
}

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/themes/bootstrap3.js":
/*!*****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/themes/bootstrap3.js ***!
  \*****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return {
    framework: 'bootstrap3',
    table: 'table table-striped table-bordered table-hover',
    td: '',
    row: 'row',
    column: 'col-md-12',
    label: '',
    input: 'form-control',
    select: 'form-control',
    field: 'form-group',
    inline: 'form-inline',
    right: 'pull-right',
    left: 'pull-left',
    center: 'text-center',
    contentCenter: '',
    small: '',
    nomargin: '',
    groupTr: 'info',
    button: 'btn btn-secondary',
    icon: '',
    dropdown: {
      container: 'dropdown',
      trigger: 'dropdown-toggle',
      menu: 'dropdown-menu',
      content: '',
      item: '',
      caret: 'caret'
    },
    pagination: {
      nav: 'text-center',
      count: '',
      wrapper: '',
      list: 'pagination',
      item: 'page-item',
      link: 'page-link',
      next: '',
      prev: '',
      active: 'active',
      disabled: 'disabled'
    }
  };
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/themes/bootstrap4.js":
/*!*****************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/themes/bootstrap4.js ***!
  \*****************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return {
    framework: 'bootstrap4',
    td: '',
    table: 'table table-striped table-bordered table-hover',
    row: 'row',
    column: 'col-md-12',
    label: '',
    input: 'form-control',
    select: 'form-control',
    field: 'form-group',
    inline: 'form-inline',
    right: 'float-right',
    left: 'float-left',
    center: 'text-center',
    contentCenter: 'justify-content-center',
    nomargin: 'm-0',
    groupTr: 'table-info',
    small: '',
    button: 'btn btn-secondary',
    dropdown: {
      container: 'dropdown',
      trigger: 'dropdown-toggle',
      menu: 'dropdown-menu',
      content: '',
      item: 'dropdown-item',
      caret: 'caret'
    },
    pagination: {
      nav: 'text-center',
      count: '',
      wrapper: '',
      list: 'pagination',
      item: 'page-item',
      link: 'page-link',
      next: '',
      prev: '',
      active: 'active',
      disabled: 'disabled',
      icon: ''
    }
  };
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/themes/bulma.js":
/*!************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/themes/bulma.js ***!
  \************************************************************/
/***/ (function(module) {

"use strict";


module.exports = function () {
  return {
    framework: 'bulma',
    table: 'table is-bordered is-striped is-hoverable is-fullwidth',
    row: 'columns',
    td: '',
    column: 'column is-12',
    label: 'label',
    input: 'input',
    select: 'select',
    field: 'field',
    inline: 'is-horizontal',
    right: 'is-pulled-right',
    left: 'is-pulled-left',
    center: 'has-text-centered',
    contentCenter: 'is-centered',
    icon: 'icon',
    small: 'is-small',
    nomargin: 'marginless',
    button: 'button',
    groupTr: 'is-selected',
    dropdown: {
      container: 'dropdown',
      trigger: 'dropdown-trigger',
      menu: 'dropdown-menu',
      content: 'dropdown-content',
      item: 'dropdown-item',
      caret: 'fa fa-angle-down'
    },
    pagination: {
      nav: 'has-text-centered',
      count: '',
      wrapper: 'pagination',
      list: 'pagination-list',
      item: '',
      link: 'pagination-link',
      next: '',
      prev: '',
      active: 'is-current',
      disabled: ''
    }
  };
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/v-client-table.js":
/*!**************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/v-client-table.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


var _vuex = _interopRequireDefault(__webpack_require__(/*! ./state/vuex */ "./node_modules/vue-tables-2/compiled/state/vuex.js"));

var _normal = _interopRequireDefault(__webpack_require__(/*! ./state/normal */ "./node_modules/vue-tables-2/compiled/state/normal.js"));

var _merge = _interopRequireDefault(__webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js"));

var _table = _interopRequireDefault(__webpack_require__(/*! ./table */ "./node_modules/vue-tables-2/compiled/table.js"));

var _data2 = _interopRequireDefault(__webpack_require__(/*! ./state/data */ "./node_modules/vue-tables-2/compiled/state/data.js"));

var _resizeableColumns = _interopRequireDefault(__webpack_require__(/*! ./helpers/resizeable-columns */ "./node_modules/vue-tables-2/compiled/helpers/resizeable-columns.js"));

var _VtClientTable = _interopRequireDefault(__webpack_require__(/*! ./components/VtClientTable */ "./node_modules/vue-tables-2/compiled/components/VtClientTable.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _data = __webpack_require__(/*! ./mixins/data */ "./node_modules/vue-tables-2/compiled/mixins/data.js");

var _created = __webpack_require__(/*! ./mixins/created */ "./node_modules/vue-tables-2/compiled/mixins/created.js");

var provide = __webpack_require__(/*! ./mixins/provide */ "./node_modules/vue-tables-2/compiled/mixins/provide.js");

var themes = {
  bootstrap3: __webpack_require__(/*! ./themes/bootstrap3 */ "./node_modules/vue-tables-2/compiled/themes/bootstrap3.js")(),
  bootstrap4: __webpack_require__(/*! ./themes/bootstrap4 */ "./node_modules/vue-tables-2/compiled/themes/bootstrap4.js")(),
  bulma: __webpack_require__(/*! ./themes/bulma */ "./node_modules/vue-tables-2/compiled/themes/bulma.js")()
};

exports.install = function (Vue, globalOptions, useVuex) {
  var theme = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "bootstrap3";
  var componentsOverride = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var client = _merge["default"].recursive(true, (0, _table["default"])(), {
    name: "r-l-client-table",
    render: __webpack_require__(/*! ./components/renderless/RLDataTable */ "./node_modules/vue-tables-2/compiled/components/renderless/RLDataTable.js"),
    provide: provide,
    props: {
      columns: {
        type: Array,
        required: true
      },
      data: {
        type: Array,
        required: true
      },
      name: {
        type: String,
        required: false
      },
      options: {
        type: Object,
        required: false,
        "default": function _default() {
          return {};
        }
      }
    },
    created: function created() {
      _created(this);

      if (this.opts.toMomentFormat) this.transformDateStringsToMoment();

      if (!this.vuex) {
        this.initOrderBy();
        this.query = this.initQuery();
        this.customQueries = this.initCustomFilters();
      }
    },
    mounted: function mounted() {
      var _this = this;

      this._setFiltersDOM(this.query);

      if (this.opts.resizableColumns) {
        (0, _resizeableColumns["default"])(this.$el.querySelector("table"), this.hasChildRow, this.opts.childRowTogglerFirst);
      } // this._setColumnsDropdownCloseListener();


      if (!this.vuex) {
        this.registerClientFilters();
        if (this.options.initialPage) this.setPage(this.options.initialPage);
      }

      if (this.opts.groupBy && !this.opts.orderBy) {
        this.orderBy.column = this.opts.groupBy;
      }

      this.loadState();

      if (this.hasDateFilters()) {
        this.initDateFilters();
      } // listen for data being removed
      // and nav to last page if current page is greater than total pages


      this.$watch('data', function () {
        if (_this.page > _this.totalPages) {
          _this.setPage(_this.totalPages);
        }

        if (_this.vuex) {
          _this.commit('SET_CLIENT_DATA', _this.data);
        }
      });
    },
    model: {
      prop: "data"
    },
    data: function data() {
      return _merge["default"].recursive(_data(), {
        source: "client",
        loading: false,
        theme: typeof theme === 'string' ? themes[theme] : theme(),
        globalOptions: globalOptions,
        componentsOverride: componentsOverride,
        currentlySorting: {},
        time: Date.now()
      }, (0, _data2["default"])(useVuex, "client", this.options.initialPage));
    },
    computed: {
      q: __webpack_require__(/*! ./computed/q */ "./node_modules/vue-tables-2/compiled/computed/q.js"),
      customQ: __webpack_require__(/*! ./computed/custom-q */ "./node_modules/vue-tables-2/compiled/computed/custom-q.js"),
      totalPages: __webpack_require__(/*! ./computed/total-pages */ "./node_modules/vue-tables-2/compiled/computed/total-pages.js"),
      filteredData: __webpack_require__(/*! ./computed/filtered-data */ "./node_modules/vue-tables-2/compiled/computed/filtered-data.js"),
      hasMultiSort: function hasMultiSort() {
        return this.opts.clientMultiSorting;
      }
    },
    methods: {
      transformDateStringsToMoment: __webpack_require__(/*! ./methods/transform-date-strings-to-moment */ "./node_modules/vue-tables-2/compiled/methods/transform-date-strings-to-moment.js"),
      registerClientFilters: __webpack_require__(/*! ./methods/register-client-filters */ "./node_modules/vue-tables-2/compiled/methods/register-client-filters.js"),
      search: __webpack_require__(/*! ./methods/client-search */ "./node_modules/vue-tables-2/compiled/methods/client-search.js"),
      defaultSort: __webpack_require__(/*! ./methods/default-sort */ "./node_modules/vue-tables-2/compiled/methods/default-sort.js"),
      getGroupSlot: __webpack_require__(/*! ./methods/get-group-slot */ "./node_modules/vue-tables-2/compiled/methods/get-group-slot.js"),
      toggleGroup: function toggleGroup(group, e) {
        e.stopPropagation();
        var i = this.collapsedGroups.indexOf(group);

        if (i >= 0) {
          this.collapsedGroups.splice(i, 1);
        } else {
          this.collapsedGroups.push(group);
        }
      },
      groupToggleIcon: function groupToggleIcon(group) {
        var cls = this.opts.sortIcon.base + " ";
        cls += this.collapsedGroups.indexOf(group) > -1 ? this.opts.sortIcon.down : this.opts.sortIcon.up;
        return cls;
      },
      loadState: function loadState() {
        if (!this.opts.saveState) return;

        if (!this.storage.getItem(this.stateKey)) {
          this.initState();
          this.activeState = true;
          return;
        }

        var state = JSON.parse(this.storage.getItem(this.stateKey));
        if (this.opts.filterable) this.setFilter(state.query);
        this.setOrder(state.orderBy.column, state.orderBy.ascending);

        if (this.vuex) {
          this.commit("SET_LIMIT", parseInt(state.perPage));
        } else {
          this.limit = parseInt(state.perPage);
        }

        this.setPage(state.page);
        this.activeState = true;

        if (state.userControlsColumns) {
          this.userColumnsDisplay = state.userColumnsDisplay;
          this.userControlsColumns = state.userControlsColumns;
        } // TODO: Custom Queries

      }
    }
  });

  var state = useVuex ? (0, _vuex["default"])() : (0, _normal["default"])();
  client = _merge["default"].recursive(client, state);
  Vue.component("r-l-client-table", client);
  Vue.component("v-client-table", _VtClientTable["default"]);
  return _VtClientTable["default"];
};

/***/ }),

/***/ "./node_modules/vue-tables-2/compiled/v-server-table.js":
/*!**************************************************************!*\
  !*** ./node_modules/vue-tables-2/compiled/v-server-table.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


var _merge = _interopRequireDefault(__webpack_require__(/*! merge */ "./node_modules/merge/lib/src/index.js"));

var _data2 = _interopRequireDefault(__webpack_require__(/*! ./state/data */ "./node_modules/vue-tables-2/compiled/state/data.js"));

var _vuex = _interopRequireDefault(__webpack_require__(/*! ./state/vuex */ "./node_modules/vue-tables-2/compiled/state/vuex.js"));

var _normal = _interopRequireDefault(__webpack_require__(/*! ./state/normal */ "./node_modules/vue-tables-2/compiled/state/normal.js"));

var _table = _interopRequireDefault(__webpack_require__(/*! ./table */ "./node_modules/vue-tables-2/compiled/table.js"));

var _resizeableColumns = _interopRequireDefault(__webpack_require__(/*! ./helpers/resizeable-columns */ "./node_modules/vue-tables-2/compiled/helpers/resizeable-columns.js"));

var _VtServerTable = _interopRequireDefault(__webpack_require__(/*! ./components/VtServerTable */ "./node_modules/vue-tables-2/compiled/components/VtServerTable.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _data = __webpack_require__(/*! ./mixins/data */ "./node_modules/vue-tables-2/compiled/mixins/data.js");

var _created = __webpack_require__(/*! ./mixins/created */ "./node_modules/vue-tables-2/compiled/mixins/created.js");

var provide = __webpack_require__(/*! ./mixins/provide */ "./node_modules/vue-tables-2/compiled/mixins/provide.js");

var themes = {
  bootstrap3: __webpack_require__(/*! ./themes/bootstrap3 */ "./node_modules/vue-tables-2/compiled/themes/bootstrap3.js")(),
  bootstrap4: __webpack_require__(/*! ./themes/bootstrap4 */ "./node_modules/vue-tables-2/compiled/themes/bootstrap4.js")(),
  bulma: __webpack_require__(/*! ./themes/bulma */ "./node_modules/vue-tables-2/compiled/themes/bulma.js")()
};

exports.install = function (Vue, globalOptions, useVuex) {
  var theme = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "bootstrap3";
  var componentsOverride = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var state = useVuex ? (0, _vuex["default"])("server") : (0, _normal["default"])();

  var server = _merge["default"].recursive(true, (0, _table["default"])(), {
    name: "r-l-server-table",
    render: __webpack_require__(/*! ./components/renderless/RLDataTable */ "./node_modules/vue-tables-2/compiled/components/renderless/RLDataTable.js"),
    props: {
      columns: {
        type: Array,
        required: true
      },
      url: {
        type: String
      },
      name: {
        type: String,
        required: false
      },
      options: {
        type: Object,
        required: false,
        "default": function _default() {
          return {};
        }
      }
    },
    provide: provide,
    created: function created() {
      if (!this.opts.requestFunction && !this.url) {
        throw 'vue-tables-2: you must provide either a "url" prop or a custom request function. Aborting';
      }

      _created(this);

      if (!this.vuex) {
        this.query = this.initQuery();
        this.initOrderBy();
        this.customQueries = this.initCustomFilters();
      }

      if (this.opts.sendInitialRequest) {
        this.loadState();
        this.getData(true).then(function (response) {
          if (typeof response === 'undefined') return;
          this.setData(response);
          this.loading = false;

          if (this.hasDateFilters()) {
            setTimeout(function () {
              this.initDateFilters();
            }.bind(this), 0);
          }
        }.bind(this));
      } else {
        this.loading = false;
      }
    },
    mounted: function mounted() {
      this._setFiltersDOM(this.query);

      if (this.opts.resizableColumns) {
        (0, _resizeableColumns["default"])(this.$el.querySelector("table"), this.hasChildRow, this.opts.childRowTogglerFirst, this.opts.resizableColumns);
      } // this._setColumnsDropdownCloseListener();


      if (this.vuex) return;
      this.registerServerFilters();
      if (this.options.initialPage) this.setPage(this.options.initialPage, true);
    },
    data: function data() {
      return _merge["default"].recursive(_data(), {
        source: "server",
        loading: true,
        initialRequestSent: false,
        lastKeyStrokeAt: false,
        globalOptions: globalOptions,
        componentsOverride: componentsOverride,
        theme: typeof theme === 'string' ? themes[theme] : theme()
      }, (0, _data2["default"])(useVuex, "server", this.options.initialPage));
    },
    methods: {
      refresh: __webpack_require__(/*! ./methods/refresh */ "./node_modules/vue-tables-2/compiled/methods/refresh.js"),
      getData: __webpack_require__(/*! ./methods/get-data */ "./node_modules/vue-tables-2/compiled/methods/get-data.js"),
      setData: __webpack_require__(/*! ./methods/set-data */ "./node_modules/vue-tables-2/compiled/methods/set-data.js"),
      serverSearch: __webpack_require__(/*! ./methods/server-search */ "./node_modules/vue-tables-2/compiled/methods/server-search.js"),
      registerServerFilters: __webpack_require__(/*! ./methods/register-server-filters */ "./node_modules/vue-tables-2/compiled/methods/register-server-filters.js"),
      getRequestParams: __webpack_require__(/*! ./methods/get-request-params */ "./node_modules/vue-tables-2/compiled/methods/get-request-params.js"),
      setRequestParams: __webpack_require__(/*! ./methods/set-request-params */ "./node_modules/vue-tables-2/compiled/methods/set-request-params.js"),
      loadState: function loadState() {
        var _this = this;

        if (!this.opts.saveState) return;

        if (!this.storage.getItem(this.stateKey)) {
          this.initState();
          this.activeState = true;
          return;
        }

        var state = JSON.parse(this.storage.getItem(this.stateKey));

        if (this.vuex) {
          this.commit("SET_STATE", {
            query: state.query,
            customQueries: state.customQueries,
            page: state.page,
            limit: parseInt(state.perPage),
            orderBy: state.orderBy
          });
        } else {
          this.page = state.page;
          this.query = state.query;
          this.customQueries = state.customQueries;
          this.limit = parseInt(state.perPage);
          this.orderBy = state.orderBy;
        }

        if (!this.opts.pagination.dropdown && this.$refs.pagination) {
          setTimeout(function () {
            _this.$refs.pagination.Page = state.page;
          }, 0);
        }

        if (this.opts.filterable) {
          setTimeout(function () {
            _this._setFiltersDOM(state.query);
          }, 0);
        }

        this.activeState = true;
      }
    },
    watch: {
      url: function url() {
        this.refresh();
      }
    },
    computed: {
      totalPages: __webpack_require__(/*! ./computed/total-pages */ "./node_modules/vue-tables-2/compiled/computed/total-pages.js"),
      filteredQuery: __webpack_require__(/*! ./computed/filtered-query */ "./node_modules/vue-tables-2/compiled/computed/filtered-query.js"),
      hasMultiSort: function hasMultiSort() {
        return this.opts.serverMultiSorting;
      }
    }
  }, state);

  Vue.component("r-l-server-table", server);
  Vue.component("v-server-table", _VtServerTable["default"]);
  return _VtServerTable["default"];
};

/***/ }),

/***/ "./node_modules/vue/dist/vue.esm.js":
/*!******************************************!*\
  !*** ./node_modules/vue/dist/vue.esm.js ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/*!
 * Vue.js v2.6.14
 * (c) 2014-2021 Evan You
 * Released under the MIT License.
 */
/*  */

var emptyObject = Object.freeze({});

// These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.
function isUndef (v) {
  return v === undefined || v === null
}

function isDef (v) {
  return v !== undefined && v !== null
}

function isTrue (v) {
  return v === true
}

function isFalse (v) {
  return v === false
}

/**
 * Check if value is primitive.
 */
function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $flow-disable-line
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Get the raw type string of a value, e.g., [object Object].
 */
var _toString = Object.prototype.toString;

function toRawType (value) {
  return _toString.call(value).slice(8, -1)
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 */
function isValidArrayIndex (val) {
  var n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

function isPromise (val) {
  return (
    isDef(val) &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  )
}

/**
 * Convert a value to a string that is actually rendered.
 */
function toString (val) {
  return val == null
    ? ''
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert an input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber (val) {
  var n = parseFloat(val);
  return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true);

/**
 * Check if an attribute is a reserved attribute.
 */
var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

/**
 * Remove an item from an array.
 */
function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether an object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 */
function cached (fn) {
  var cache = Object.create(null);
  return (function cachedFn (str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}

/**
 * Camelize a hyphen-delimited string.
 */
var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
});

/**
 * Capitalize a string.
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
});

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cached(function (str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
});

/**
 * Simple bind polyfill for environments that do not support it,
 * e.g., PhantomJS 1.x. Technically, we don't need this anymore
 * since native bind is now performant enough in most browsers.
 * But removing it would mean breaking code that was able to run in
 * PhantomJS 1.x, so this must be kept for backward compatibility.
 */

/* istanbul ignore next */
function polyfillBind (fn, ctx) {
  function boundFn (a) {
    var l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  boundFn._length = fn.length;
  return boundFn
}

function nativeBind (fn, ctx) {
  return fn.bind(ctx)
}

var bind = Function.prototype.bind
  ? nativeBind
  : polyfillBind;

/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret
}

/**
 * Mix properties into target object.
 */
function extend (to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject (arr) {
  var res = {};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res
}

/* eslint-disable no-unused-vars */

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
function noop (a, b, c) {}

/**
 * Always return false.
 */
var no = function (a, b, c) { return false; };

/* eslint-enable no-unused-vars */

/**
 * Return the same value.
 */
var identity = function (_) { return _; };

/**
 * Generate a string containing static keys from compiler modules.
 */
function genStaticKeys (modules) {
  return modules.reduce(function (keys, m) {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual (a, b) {
  if (a === b) { return true }
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i])
        })
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

/**
 * Return the first index at which a loosely equal value can be
 * found in the array (if value is a plain object, the array must
 * contain an object of the same shape), or -1 if it is not present.
 */
function looseIndexOf (arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) { return i }
  }
  return -1
}

/**
 * Ensure a function is called only once.
 */
function once (fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  }
}

var SSR_ATTR = 'data-server-rendered';

var ASSET_TYPES = [
  'component',
  'directive',
  'filter'
];

var LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
  'serverPrefetch'
];

/*  */



var config = ({
  /**
   * Option merge strategies (used in core/util/options)
   */
  // $flow-disable-line
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: "development" !== 'production',

  /**
   * Whether to enable devtools
   */
  devtools: "development" !== 'production',

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  // $flow-disable-line
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Perform updates asynchronously. Intended to be used by Vue Test Utils
   * This will significantly reduce performance if set to false.
   */
  async: true,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
});

/*  */

/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */
var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
var bailRE = new RegExp(("[^" + (unicodeRegExp.source) + ".$_\\d]"));
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  var segments = path.split('.');
  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) { return }
      obj = obj[segments[i]];
    }
    return obj
  }
}

/*  */

// can we use __proto__?
var hasProto = '__proto__' in {};

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined';
var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
var isPhantomJS = UA && /phantomjs/.test(UA);
var isFF = UA && UA.match(/firefox\/(\d+)/);

// Firefox has a "watch" function on Object.prototype...
var nativeWatch = ({}).watch;

var supportsPassive = false;
if (inBrowser) {
  try {
    var opts = {};
    Object.defineProperty(opts, 'passive', ({
      get: function get () {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    })); // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts);
  } catch (e) {}
}

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
var _isServer;
var isServerRendering = function () {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && !inWeex && typeof __webpack_require__.g !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = __webpack_require__.g['process'] && __webpack_require__.g['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }
  return _isServer
};

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

var hasSymbol =
  typeof Symbol !== 'undefined' && isNative(Symbol) &&
  typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

var _Set;
/* istanbul ignore if */ // $flow-disable-line
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = /*@__PURE__*/(function () {
    function Set () {
      this.set = Object.create(null);
    }
    Set.prototype.has = function has (key) {
      return this.set[key] === true
    };
    Set.prototype.add = function add (key) {
      this.set[key] = true;
    };
    Set.prototype.clear = function clear () {
      this.set = Object.create(null);
    };

    return Set;
  }());
}

/*  */

var warn = noop;
var tip = noop;
var generateComponentTrace = (noop); // work around flow check
var formatComponentName = (noop);

if (true) {
  var hasConsole = typeof console !== 'undefined';
  var classifyRE = /(?:^|[-_])(\w)/g;
  var classify = function (str) { return str
    .replace(classifyRE, function (c) { return c.toUpperCase(); })
    .replace(/[-_]/g, ''); };

  warn = function (msg, vm) {
    var trace = vm ? generateComponentTrace(vm) : '';

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace);
    } else if (hasConsole && (!config.silent)) {
      console.error(("[Vue warn]: " + msg + trace));
    }
  };

  tip = function (msg, vm) {
    if (hasConsole && (!config.silent)) {
      console.warn("[Vue tip]: " + msg + (
        vm ? generateComponentTrace(vm) : ''
      ));
    }
  };

  formatComponentName = function (vm, includeFile) {
    if (vm.$root === vm) {
      return '<Root>'
    }
    var options = typeof vm === 'function' && vm.cid != null
      ? vm.options
      : vm._isVue
        ? vm.$options || vm.constructor.options
        : vm;
    var name = options.name || options._componentTag;
    var file = options.__file;
    if (!name && file) {
      var match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (
      (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
      (file && includeFile !== false ? (" at " + file) : '')
    )
  };

  var repeat = function (str, n) {
    var res = '';
    while (n) {
      if (n % 2 === 1) { res += str; }
      if (n > 1) { str += str; }
      n >>= 1;
    }
    return res
  };

  generateComponentTrace = function (vm) {
    if (vm._isVue && vm.$parent) {
      var tree = [];
      var currentRecursiveSequence = 0;
      while (vm) {
        if (tree.length > 0) {
          var last = tree[tree.length - 1];
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }
        tree.push(vm);
        vm = vm.$parent;
      }
      return '\n\nfound in\n\n' + tree
        .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
            ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
            : formatComponentName(vm))); })
        .join('\n')
    } else {
      return ("\n\n(found in " + (formatComponentName(vm)) + ")")
    }
  };
}

/*  */

var uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
var Dep = function Dep () {
  this.id = uid++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub (sub) {
  remove(this.subs, sub);
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify () {
  // stabilize the subscriber list first
  var subs = this.subs.slice();
  if ( true && !config.async) {
    // subs aren't sorted in scheduler if not running async
    // we need to sort them now to make sure they fire in correct
    // order
    subs.sort(function (a, b) { return a.id - b.id; });
  }
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null;
var targetStack = [];

function pushTarget (target) {
  targetStack.push(target);
  Dep.target = target;
}

function popTarget () {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}

/*  */

var VNode = function VNode (
  tag,
  data,
  children,
  text,
  elm,
  context,
  componentOptions,
  asyncFactory
) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = undefined;
  this.context = context;
  this.fnContext = undefined;
  this.fnOptions = undefined;
  this.fnScopeId = undefined;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.componentInstance = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  this.isCloned = false;
  this.isOnce = false;
  this.asyncFactory = asyncFactory;
  this.asyncMeta = undefined;
  this.isAsyncPlaceholder = false;
};

var prototypeAccessors = { child: { configurable: true } };

// DEPRECATED: alias for componentInstance for backwards compat.
/* istanbul ignore next */
prototypeAccessors.child.get = function () {
  return this.componentInstance
};

Object.defineProperties( VNode.prototype, prototypeAccessors );

var createEmptyVNode = function (text) {
  if ( text === void 0 ) text = '';

  var node = new VNode();
  node.text = text;
  node.isComment = true;
  return node
};

function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
function cloneVNode (vnode) {
  var cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.fnContext = vnode.fnContext;
  cloned.fnOptions = vnode.fnOptions;
  cloned.fnScopeId = vnode.fnScopeId;
  cloned.asyncMeta = vnode.asyncMeta;
  cloned.isCloned = true;
  return cloned
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);

var methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break
      case 'splice':
        inserted = args.slice(2);
        break
    }
    if (inserted) { ob.observeArray(inserted); }
    // notify change
    ob.dep.notify();
    return result
  });
});

/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
var shouldObserve = true;

function toggleObserving (value) {
  shouldObserve = value;
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
var Observer = function Observer (value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    if (hasProto) {
      protoAugment(value, arrayMethods);
    } else {
      copyAugment(value, arrayMethods, arrayKeys);
    }
    this.observeArray(value);
  } else {
    this.walk(value);
  }
};

/**
 * Walk through all properties and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk (obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i]);
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe (value, asRootData) {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive$$1 (
  obj,
  key,
  val,
  customSetter,
  shallow
) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }

  var childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if ( true && customSetter) {
        customSetter();
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) { return }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set (target, key, val) {
  if ( true &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val
  }
  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
     true && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
    return val
  }
  if (!ob) {
    target[key] = val;
    return val
  }
  defineReactive$$1(ob.value, key, val);
  ob.dep.notify();
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (target, key) {
  if ( true &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(("Cannot delete reactive property on undefined, null, or primitive value: " + ((target))));
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return
  }
  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
     true && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    );
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key];
  if (!ob) {
    return
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
if (true) {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        "option \"" + key + "\" can only be used during instance " +
        'creation with the `new` keyword.'
      );
    }
    return defaultStrat(parent, child)
  };
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to, from) {
  if (!from) { return to }
  var key, toVal, fromVal;

  var keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from);

  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    // in case the object is already observed...
    if (key === '__ob__') { continue }
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal);
    }
  }
  return to
}

/**
 * Data
 */
function mergeDataOrFn (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn () {
      // instance merge
      var instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal;
      var defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal;
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

strats.data = function (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
       true && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      );

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
};

/**
 * Hooks and props are merged as arrays.
 */
function mergeHook (
  parentVal,
  childVal
) {
  var res = childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal;
  return res
    ? dedupeHooks(res)
    : res
}

function dedupeHooks (hooks) {
  var res = [];
  for (var i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i]);
    }
  }
  return res
}

LIFECYCLE_HOOKS.forEach(function (hook) {
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (
  parentVal,
  childVal,
  vm,
  key
) {
  var res = Object.create(parentVal || null);
  if (childVal) {
     true && assertObjectType(key, childVal, vm);
    return extend(res, childVal)
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (
  parentVal,
  childVal,
  vm,
  key
) {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) { parentVal = undefined; }
  if (childVal === nativeWatch) { childVal = undefined; }
  /* istanbul ignore if */
  if (!childVal) { return Object.create(parentVal || null) }
  if (true) {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) { return childVal }
  var ret = {};
  extend(ret, parentVal);
  for (var key$1 in childVal) {
    var parent = ret[key$1];
    var child = childVal[key$1];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key$1] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child];
  }
  return ret
};

/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal,
  childVal,
  vm,
  key
) {
  if (childVal && "development" !== 'production') {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) { return childVal }
  var ret = Object.create(null);
  extend(ret, parentVal);
  if (childVal) { extend(ret, childVal); }
  return ret
};
strats.provide = mergeDataOrFn;

/**
 * Default strategy.
 */
var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
};

/**
 * Validate component names
 */
function checkComponents (options) {
  for (var key in options.components) {
    validateComponentName(key);
  }
}

function validateComponentName (name) {
  if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + (unicodeRegExp.source) + "]*$")).test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'should conform to valid custom element name in html5 specification.'
    );
  }
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    );
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options, vm) {
  var props = options.props;
  if (!props) { return }
  var res = {};
  var i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else if (true) {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val)
        ? val
        : { type: val };
    }
  } else if (true) {
    warn(
      "Invalid value for option \"props\": expected an Array or an Object, " +
      "but got " + (toRawType(props)) + ".",
      vm
    );
  }
  options.props = res;
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options, vm) {
  var inject = options.inject;
  if (!inject) { return }
  var normalized = options.inject = {};
  if (Array.isArray(inject)) {
    for (var i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] };
    }
  } else if (isPlainObject(inject)) {
    for (var key in inject) {
      var val = inject[key];
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val };
    }
  } else if (true) {
    warn(
      "Invalid value for option \"inject\": expected an Array or an Object, " +
      "but got " + (toRawType(inject)) + ".",
      vm
    );
  }
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      var def$$1 = dirs[key];
      if (typeof def$$1 === 'function') {
        dirs[key] = { bind: def$$1, update: def$$1 };
      }
    }
  }
}

function assertObjectType (name, value, vm) {
  if (!isPlainObject(value)) {
    warn(
      "Invalid value for option \"" + name + "\": expected an Object, " +
      "but got " + (toRawType(value)) + ".",
      vm
    );
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions (
  parent,
  child,
  vm
) {
  if (true) {
    checkComponents(child);
  }

  if (typeof child === 'function') {
    child = child.options;
  }

  normalizeProps(child, vm);
  normalizeInject(child, vm);
  normalizeDirectives(child);

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm);
    }
    if (child.mixins) {
      for (var i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm);
      }
    }
  }

  var options = {};
  var key;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField (key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  var assets = options[type];
  // check local registration variations first
  if (hasOwn(assets, id)) { return assets[id] }
  var camelizedId = camelize(id);
  if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
  var PascalCaseId = capitalize(camelizedId);
  if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
  // fallback to prototype chain
  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  if ( true && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    );
  }
  return res
}

/*  */



function validateProp (
  key,
  propOptions,
  propsData,
  vm
) {
  var prop = propOptions[key];
  var absent = !hasOwn(propsData, key);
  var value = propsData[key];
  // boolean casting
  var booleanIndex = getTypeIndex(Boolean, prop.type);
  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      var stringIndex = getTypeIndex(String, prop.type);
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true;
      }
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    var prevShouldObserve = shouldObserve;
    toggleObserving(true);
    observe(value);
    toggleObserving(prevShouldObserve);
  }
  if (
    true
  ) {
    assertProp(prop, key, value, vm, absent);
  }
  return value
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue (vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  var def = prop.default;
  // warn against non-factory defaults for Object & Array
  if ( true && isObject(def)) {
    warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    );
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }
  // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
  return typeof def === 'function' && getType(prop.type) !== 'Function'
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    );
    return
  }
  if (value == null && !prop.required) {
    return
  }
  var type = prop.type;
  var valid = !type || type === true;
  var expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i], vm);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }

  var haveExpectedTypes = expectedTypes.some(function (t) { return t; });
  if (!valid && haveExpectedTypes) {
    warn(
      getInvalidTypeMessage(name, value, expectedTypes),
      vm
    );
    return
  }
  var validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      );
    }
  }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol|BigInt)$/;

function assertType (value, type, vm) {
  var valid;
  var expectedType = getType(type);
  if (simpleCheckRE.test(expectedType)) {
    var t = typeof value;
    valid = t === expectedType.toLowerCase();
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type;
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    try {
      valid = value instanceof type;
    } catch (e) {
      warn('Invalid prop type: "' + String(type) + '" is not a constructor', vm);
      valid = false;
    }
  }
  return {
    valid: valid,
    expectedType: expectedType
  }
}

var functionTypeCheckRE = /^\s*function (\w+)/;

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType (fn) {
  var match = fn && fn.toString().match(functionTypeCheckRE);
  return match ? match[1] : ''
}

function isSameType (a, b) {
  return getType(a) === getType(b)
}

function getTypeIndex (type, expectedTypes) {
  if (!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1
  }
  for (var i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i
    }
  }
  return -1
}

function getInvalidTypeMessage (name, value, expectedTypes) {
  var message = "Invalid prop: type check failed for prop \"" + name + "\"." +
    " Expected " + (expectedTypes.map(capitalize).join(', '));
  var expectedType = expectedTypes[0];
  var receivedType = toRawType(value);
  // check if we need to specify expected value
  if (
    expectedTypes.length === 1 &&
    isExplicable(expectedType) &&
    isExplicable(typeof value) &&
    !isBoolean(expectedType, receivedType)
  ) {
    message += " with value " + (styleValue(value, expectedType));
  }
  message += ", got " + receivedType + " ";
  // check if we need to specify received value
  if (isExplicable(receivedType)) {
    message += "with value " + (styleValue(value, receivedType)) + ".";
  }
  return message
}

function styleValue (value, type) {
  if (type === 'String') {
    return ("\"" + value + "\"")
  } else if (type === 'Number') {
    return ("" + (Number(value)))
  } else {
    return ("" + value)
  }
}

var EXPLICABLE_TYPES = ['string', 'number', 'boolean'];
function isExplicable (value) {
  return EXPLICABLE_TYPES.some(function (elem) { return value.toLowerCase() === elem; })
}

function isBoolean () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  return args.some(function (elem) { return elem.toLowerCase() === 'boolean'; })
}

/*  */

function handleError (err, vm, info) {
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505
  pushTarget();
  try {
    if (vm) {
      var cur = vm;
      while ((cur = cur.$parent)) {
        var hooks = cur.$options.errorCaptured;
        if (hooks) {
          for (var i = 0; i < hooks.length; i++) {
            try {
              var capture = hooks[i].call(cur, err, vm, info) === false;
              if (capture) { return }
            } catch (e) {
              globalHandleError(e, cur, 'errorCaptured hook');
            }
          }
        }
      }
    }
    globalHandleError(err, vm, info);
  } finally {
    popTarget();
  }
}

function invokeWithErrorHandling (
  handler,
  context,
  args,
  vm,
  info
) {
  var res;
  try {
    res = args ? handler.apply(context, args) : handler.call(context);
    if (res && !res._isVue && isPromise(res) && !res._handled) {
      res.catch(function (e) { return handleError(e, vm, info + " (Promise/async)"); });
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      res._handled = true;
    }
  } catch (e) {
    handleError(e, vm, info);
  }
  return res
}

function globalHandleError (err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, 'config.errorHandler');
      }
    }
  }
  logError(err, vm, info);
}

function logError (err, vm, info) {
  if (true) {
    warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
  }
  /* istanbul ignore else */
  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err);
  } else {
    throw err
  }
}

/*  */

var isUsingMicroTask = false;

var callbacks = [];
var pending = false;

function flushCallbacks () {
  pending = false;
  var copies = callbacks.slice(0);
  callbacks.length = 0;
  for (var i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
var timerFunc;

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  var p = Promise.resolve();
  timerFunc = function () {
    p.then(flushCallbacks);
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) { setTimeout(noop); }
  };
  isUsingMicroTask = true;
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  var counter = 1;
  var observer = new MutationObserver(flushCallbacks);
  var textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true
  });
  timerFunc = function () {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = function () {
    setImmediate(flushCallbacks);
  };
} else {
  // Fallback to setTimeout.
  timerFunc = function () {
    setTimeout(flushCallbacks, 0);
  };
}

function nextTick (cb, ctx) {
  var _resolve;
  callbacks.push(function () {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  if (!pending) {
    pending = true;
    timerFunc();
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(function (resolve) {
      _resolve = resolve;
    })
  }
}

/*  */

var mark;
var measure;

if (true) {
  var perf = inBrowser && window.performance;
  /* istanbul ignore if */
  if (
    perf &&
    perf.mark &&
    perf.measure &&
    perf.clearMarks &&
    perf.clearMeasures
  ) {
    mark = function (tag) { return perf.mark(tag); };
    measure = function (name, startTag, endTag) {
      perf.measure(name, startTag, endTag);
      perf.clearMarks(startTag);
      perf.clearMarks(endTag);
      // perf.clearMeasures(name)
    };
  }
}

/* not type checking this file because flow doesn't play well with Proxy */

var initProxy;

if (true) {
  var allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,' +
    'require' // for Webpack/Browserify
  );

  var warnNonPresent = function (target, key) {
    warn(
      "Property or method \"" + key + "\" is not defined on the instance but " +
      'referenced during render. Make sure that this property is reactive, ' +
      'either in the data option, or for class-based components, by ' +
      'initializing the property. ' +
      'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
      target
    );
  };

  var warnReservedPrefix = function (target, key) {
    warn(
      "Property \"" + key + "\" must be accessed with \"$data." + key + "\" because " +
      'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
      'prevent conflicts with Vue internals. ' +
      'See: https://vuejs.org/v2/api/#data',
      target
    );
  };

  var hasProxy =
    typeof Proxy !== 'undefined' && isNative(Proxy);

  if (hasProxy) {
    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
    config.keyCodes = new Proxy(config.keyCodes, {
      set: function set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
          return false
        } else {
          target[key] = value;
          return true
        }
      }
    });
  }

  var hasHandler = {
    has: function has (target, key) {
      var has = key in target;
      var isAllowed = allowedGlobals(key) ||
        (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
      if (!has && !isAllowed) {
        if (key in target.$data) { warnReservedPrefix(target, key); }
        else { warnNonPresent(target, key); }
      }
      return has || !isAllowed
    }
  };

  var getHandler = {
    get: function get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        if (key in target.$data) { warnReservedPrefix(target, key); }
        else { warnNonPresent(target, key); }
      }
      return target[key]
    }
  };

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      var handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}

/*  */

var seenObjects = new _Set();

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
function traverse (val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}

function _traverse (val, seen) {
  var i, keys;
  var isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return
  }
  if (val.__ob__) {
    var depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) { _traverse(val[i], seen); }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) { _traverse(val[keys[i]], seen); }
  }
}

/*  */

var normalizeEvent = cached(function (name) {
  var passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
  name = once$$1 ? name.slice(1) : name;
  var capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name: name,
    once: once$$1,
    capture: capture,
    passive: passive
  }
});

function createFnInvoker (fns, vm) {
  function invoker () {
    var arguments$1 = arguments;

    var fns = invoker.fns;
    if (Array.isArray(fns)) {
      var cloned = fns.slice();
      for (var i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments$1, vm, "v-on handler");
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, "v-on handler")
    }
  }
  invoker.fns = fns;
  return invoker
}

function updateListeners (
  on,
  oldOn,
  add,
  remove$$1,
  createOnceHandler,
  vm
) {
  var name, def$$1, cur, old, event;
  for (name in on) {
    def$$1 = cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);
    if (isUndef(cur)) {
       true && warn(
        "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
        vm
      );
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm);
      }
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture);
      }
      add(event.name, cur, event.capture, event.passive, event.params);
    } else if (cur !== old) {
      old.fns = cur;
      on[name] = old;
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name);
      remove$$1(event.name, oldOn[name], event.capture);
    }
  }
}

/*  */

function mergeVNodeHook (def, hookKey, hook) {
  if (def instanceof VNode) {
    def = def.data.hook || (def.data.hook = {});
  }
  var invoker;
  var oldHook = def[hookKey];

  function wrappedHook () {
    hook.apply(this, arguments);
    // important: remove merged hook to ensure it's called only once
    // and prevent memory leak
    remove(invoker.fns, wrappedHook);
  }

  if (isUndef(oldHook)) {
    // no existing hook
    invoker = createFnInvoker([wrappedHook]);
  } else {
    /* istanbul ignore if */
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      // already a merged invoker
      invoker = oldHook;
      invoker.fns.push(wrappedHook);
    } else {
      // existing plain hook
      invoker = createFnInvoker([oldHook, wrappedHook]);
    }
  }

  invoker.merged = true;
  def[hookKey] = invoker;
}

/*  */

function extractPropsFromVNodeData (
  data,
  Ctor,
  tag
) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;
  if (isUndef(propOptions)) {
    return
  }
  var res = {};
  var attrs = data.attrs;
  var props = data.props;
  if (isDef(attrs) || isDef(props)) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);
      if (true) {
        var keyInLowerCase = key.toLowerCase();
        if (
          key !== keyInLowerCase &&
          attrs && hasOwn(attrs, keyInLowerCase)
        ) {
          tip(
            "Prop \"" + keyInLowerCase + "\" is passed to component " +
            (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
            " \"" + key + "\". " +
            "Note that HTML attributes are case-insensitive and camelCased " +
            "props need to use their kebab-case equivalents when using in-DOM " +
            "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
          );
        }
      }
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey, false);
    }
  }
  return res
}

function checkProp (
  res,
  hash,
  key,
  altKey,
  preserve
) {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true
    }
  }
  return false
}

/*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
function simpleNormalizeChildren (children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
function normalizeChildren (children) {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}

function isTextNode (node) {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}

function normalizeArrayChildren (children, nestedIndex) {
  var res = [];
  var i, c, lastIndex, last;
  for (i = 0; i < children.length; i++) {
    c = children[i];
    if (isUndef(c) || typeof c === 'boolean') { continue }
    lastIndex = res.length - 1;
    last = res[lastIndex];
    //  nested
    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + (c[0]).text);
          c.shift();
        }
        res.push.apply(res, c);
      }
    } else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[lastIndex] = createTextVNode(last.text + c.text);
      } else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) &&
          isDef(c.tag) &&
          isUndef(c.key) &&
          isDef(nestedIndex)) {
          c.key = "__vlist" + nestedIndex + "_" + i + "__";
        }
        res.push(c);
      }
    }
  }
  return res
}

/*  */

function initProvide (vm) {
  var provide = vm.$options.provide;
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide;
  }
}

function initInjections (vm) {
  var result = resolveInject(vm.$options.inject, vm);
  if (result) {
    toggleObserving(false);
    Object.keys(result).forEach(function (key) {
      /* istanbul ignore else */
      if (true) {
        defineReactive$$1(vm, key, result[key], function () {
          warn(
            "Avoid mutating an injected value directly since the changes will be " +
            "overwritten whenever the provided component re-renders. " +
            "injection being mutated: \"" + key + "\"",
            vm
          );
        });
      } else {}
    });
    toggleObserving(true);
  }
}

function resolveInject (inject, vm) {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    var result = Object.create(null);
    var keys = hasSymbol
      ? Reflect.ownKeys(inject)
      : Object.keys(inject);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      // #6574 in case the inject object is observed...
      if (key === '__ob__') { continue }
      var provideKey = inject[key].from;
      var source = vm;
      while (source) {
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey];
          break
        }
        source = source.$parent;
      }
      if (!source) {
        if ('default' in inject[key]) {
          var provideDefault = inject[key].default;
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault;
        } else if (true) {
          warn(("Injection \"" + key + "\" not found"), vm);
        }
      }
    }
    return result
  }
}

/*  */



/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
function resolveSlots (
  children,
  context
) {
  if (!children || !children.length) {
    return {}
  }
  var slots = {};
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    var data = child.data;
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot;
    }
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      var name = data.slot;
      var slot = (slots[name] || (slots[name] = []));
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || []);
      } else {
        slot.push(child);
      }
    } else {
      (slots.default || (slots.default = [])).push(child);
    }
  }
  // ignore slots that contains only whitespace
  for (var name$1 in slots) {
    if (slots[name$1].every(isWhitespace)) {
      delete slots[name$1];
    }
  }
  return slots
}

function isWhitespace (node) {
  return (node.isComment && !node.asyncFactory) || node.text === ' '
}

/*  */

function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}

/*  */

function normalizeScopedSlots (
  slots,
  normalSlots,
  prevSlots
) {
  var res;
  var hasNormalSlots = Object.keys(normalSlots).length > 0;
  var isStable = slots ? !!slots.$stable : !hasNormalSlots;
  var key = slots && slots.$key;
  if (!slots) {
    res = {};
  } else if (slots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized
  } else if (
    isStable &&
    prevSlots &&
    prevSlots !== emptyObject &&
    key === prevSlots.$key &&
    !hasNormalSlots &&
    !prevSlots.$hasNormal
  ) {
    // fast path 2: stable scoped slots w/ no normal slots to proxy,
    // only need to normalize once
    return prevSlots
  } else {
    res = {};
    for (var key$1 in slots) {
      if (slots[key$1] && key$1[0] !== '$') {
        res[key$1] = normalizeScopedSlot(normalSlots, key$1, slots[key$1]);
      }
    }
  }
  // expose normal slots on scopedSlots
  for (var key$2 in normalSlots) {
    if (!(key$2 in res)) {
      res[key$2] = proxyNormalSlot(normalSlots, key$2);
    }
  }
  // avoriaz seems to mock a non-extensible $scopedSlots object
  // and when that is passed down this would cause an error
  if (slots && Object.isExtensible(slots)) {
    (slots)._normalized = res;
  }
  def(res, '$stable', isStable);
  def(res, '$key', key);
  def(res, '$hasNormal', hasNormalSlots);
  return res
}

function normalizeScopedSlot(normalSlots, key, fn) {
  var normalized = function () {
    var res = arguments.length ? fn.apply(null, arguments) : fn({});
    res = res && typeof res === 'object' && !Array.isArray(res)
      ? [res] // single vnode
      : normalizeChildren(res);
    var vnode = res && res[0];
    return res && (
      !vnode ||
      (res.length === 1 && vnode.isComment && !isAsyncPlaceholder(vnode)) // #9658, #10391
    ) ? undefined
      : res
  };
  // this is a slot using the new v-slot syntax without scope. although it is
  // compiled as a scoped slot, render fn users would expect it to be present
  // on this.$slots because the usage is semantically a normal slot.
  if (fn.proxy) {
    Object.defineProperty(normalSlots, key, {
      get: normalized,
      enumerable: true,
      configurable: true
    });
  }
  return normalized
}

function proxyNormalSlot(slots, key) {
  return function () { return slots[key]; }
}

/*  */

/**
 * Runtime helper for rendering v-for lists.
 */
function renderList (
  val,
  render
) {
  var ret, i, l, keys, key;
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === 'number') {
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    if (hasSymbol && val[Symbol.iterator]) {
      ret = [];
      var iterator = val[Symbol.iterator]();
      var result = iterator.next();
      while (!result.done) {
        ret.push(render(result.value, ret.length));
        result = iterator.next();
      }
    } else {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
  }
  if (!isDef(ret)) {
    ret = [];
  }
  (ret)._isVList = true;
  return ret
}

/*  */

/**
 * Runtime helper for rendering <slot>
 */
function renderSlot (
  name,
  fallbackRender,
  props,
  bindObject
) {
  var scopedSlotFn = this.$scopedSlots[name];
  var nodes;
  if (scopedSlotFn) {
    // scoped slot
    props = props || {};
    if (bindObject) {
      if ( true && !isObject(bindObject)) {
        warn('slot v-bind without argument expects an Object', this);
      }
      props = extend(extend({}, bindObject), props);
    }
    nodes =
      scopedSlotFn(props) ||
      (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender);
  } else {
    nodes =
      this.$slots[name] ||
      (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender);
  }

  var target = props && props.slot;
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    return nodes
  }
}

/*  */

/**
 * Runtime helper for resolving filters
 */
function resolveFilter (id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}

/*  */

function isKeyNotMatch (expect, actual) {
  if (Array.isArray(expect)) {
    return expect.indexOf(actual) === -1
  } else {
    return expect !== actual
  }
}

/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */
function checkKeyCodes (
  eventKeyCode,
  key,
  builtInKeyCode,
  eventKeyName,
  builtInKeyName
) {
  var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
  if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
    return isKeyNotMatch(builtInKeyName, eventKeyName)
  } else if (mappedKeyCode) {
    return isKeyNotMatch(mappedKeyCode, eventKeyCode)
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key
  }
  return eventKeyCode === undefined
}

/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
function bindObjectProps (
  data,
  tag,
  value,
  asProp,
  isSync
) {
  if (value) {
    if (!isObject(value)) {
       true && warn(
        'v-bind without argument expects an Object or Array value',
        this
      );
    } else {
      if (Array.isArray(value)) {
        value = toObject(value);
      }
      var hash;
      var loop = function ( key ) {
        if (
          key === 'class' ||
          key === 'style' ||
          isReservedAttribute(key)
        ) {
          hash = data;
        } else {
          var type = data.attrs && data.attrs.type;
          hash = asProp || config.mustUseProp(tag, type, key)
            ? data.domProps || (data.domProps = {})
            : data.attrs || (data.attrs = {});
        }
        var camelizedKey = camelize(key);
        var hyphenatedKey = hyphenate(key);
        if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
          hash[key] = value[key];

          if (isSync) {
            var on = data.on || (data.on = {});
            on[("update:" + key)] = function ($event) {
              value[key] = $event;
            };
          }
        }
      };

      for (var key in value) loop( key );
    }
  }
  return data
}

/*  */

/**
 * Runtime helper for rendering static trees.
 */
function renderStatic (
  index,
  isInFor
) {
  var cached = this._staticTrees || (this._staticTrees = []);
  var tree = cached[index];
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree.
  if (tree && !isInFor) {
    return tree
  }
  // otherwise, render a fresh tree.
  tree = cached[index] = this.$options.staticRenderFns[index].call(
    this._renderProxy,
    null,
    this // for render fns generated for functional component templates
  );
  markStatic(tree, ("__static__" + index), false);
  return tree
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
function markOnce (
  tree,
  index,
  key
) {
  markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
  return tree
}

function markStatic (
  tree,
  key,
  isOnce
) {
  if (Array.isArray(tree)) {
    for (var i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], (key + "_" + i), isOnce);
      }
    }
  } else {
    markStaticNode(tree, key, isOnce);
  }
}

function markStaticNode (node, key, isOnce) {
  node.isStatic = true;
  node.key = key;
  node.isOnce = isOnce;
}

/*  */

function bindObjectListeners (data, value) {
  if (value) {
    if (!isPlainObject(value)) {
       true && warn(
        'v-on without argument expects an Object value',
        this
      );
    } else {
      var on = data.on = data.on ? extend({}, data.on) : {};
      for (var key in value) {
        var existing = on[key];
        var ours = value[key];
        on[key] = existing ? [].concat(existing, ours) : ours;
      }
    }
  }
  return data
}

/*  */

function resolveScopedSlots (
  fns, // see flow/vnode
  res,
  // the following are added in 2.6
  hasDynamicKeys,
  contentHashKey
) {
  res = res || { $stable: !hasDynamicKeys };
  for (var i = 0; i < fns.length; i++) {
    var slot = fns[i];
    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys);
    } else if (slot) {
      // marker for reverse proxying v-slot without scope on this.$slots
      if (slot.proxy) {
        slot.fn.proxy = true;
      }
      res[slot.key] = slot.fn;
    }
  }
  if (contentHashKey) {
    (res).$key = contentHashKey;
  }
  return res
}

/*  */

function bindDynamicKeys (baseObj, values) {
  for (var i = 0; i < values.length; i += 2) {
    var key = values[i];
    if (typeof key === 'string' && key) {
      baseObj[values[i]] = values[i + 1];
    } else if ( true && key !== '' && key !== null) {
      // null is a special value for explicitly removing a binding
      warn(
        ("Invalid value for dynamic directive argument (expected string or null): " + key),
        this
      );
    }
  }
  return baseObj
}

// helper to dynamically append modifier runtime markers to event names.
// ensure only append when value is already string, otherwise it will be cast
// to string and cause the type check to miss.
function prependModifier (value, symbol) {
  return typeof value === 'string' ? symbol + value : value
}

/*  */

function installRenderHelpers (target) {
  target._o = markOnce;
  target._n = toNumber;
  target._s = toString;
  target._l = renderList;
  target._t = renderSlot;
  target._q = looseEqual;
  target._i = looseIndexOf;
  target._m = renderStatic;
  target._f = resolveFilter;
  target._k = checkKeyCodes;
  target._b = bindObjectProps;
  target._v = createTextVNode;
  target._e = createEmptyVNode;
  target._u = resolveScopedSlots;
  target._g = bindObjectListeners;
  target._d = bindDynamicKeys;
  target._p = prependModifier;
}

/*  */

function FunctionalRenderContext (
  data,
  props,
  children,
  parent,
  Ctor
) {
  var this$1 = this;

  var options = Ctor.options;
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  var contextVm;
  if (hasOwn(parent, '_uid')) {
    contextVm = Object.create(parent);
    // $flow-disable-line
    contextVm._original = parent;
  } else {
    // the context vm passed in is a functional context as well.
    // in this case we want to make sure we are able to get a hold to the
    // real context instance.
    contextVm = parent;
    // $flow-disable-line
    parent = parent._original;
  }
  var isCompiled = isTrue(options._compiled);
  var needNormalization = !isCompiled;

  this.data = data;
  this.props = props;
  this.children = children;
  this.parent = parent;
  this.listeners = data.on || emptyObject;
  this.injections = resolveInject(options.inject, parent);
  this.slots = function () {
    if (!this$1.$slots) {
      normalizeScopedSlots(
        data.scopedSlots,
        this$1.$slots = resolveSlots(children, parent)
      );
    }
    return this$1.$slots
  };

  Object.defineProperty(this, 'scopedSlots', ({
    enumerable: true,
    get: function get () {
      return normalizeScopedSlots(data.scopedSlots, this.slots())
    }
  }));

  // support for compiled functional template
  if (isCompiled) {
    // exposing $options for renderStatic()
    this.$options = options;
    // pre-resolve slots for renderSlot()
    this.$slots = this.slots();
    this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
  }

  if (options._scopeId) {
    this._c = function (a, b, c, d) {
      var vnode = createElement(contextVm, a, b, c, d, needNormalization);
      if (vnode && !Array.isArray(vnode)) {
        vnode.fnScopeId = options._scopeId;
        vnode.fnContext = parent;
      }
      return vnode
    };
  } else {
    this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
  }
}

installRenderHelpers(FunctionalRenderContext.prototype);

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  contextVm,
  children
) {
  var options = Ctor.options;
  var props = {};
  var propOptions = options.props;
  if (isDef(propOptions)) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject);
    }
  } else {
    if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
    if (isDef(data.props)) { mergeProps(props, data.props); }
  }

  var renderContext = new FunctionalRenderContext(
    data,
    props,
    children,
    contextVm,
    Ctor
  );

  var vnode = options.render.call(null, renderContext._c, renderContext);

  if (vnode instanceof VNode) {
    return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
  } else if (Array.isArray(vnode)) {
    var vnodes = normalizeChildren(vnode) || [];
    var res = new Array(vnodes.length);
    for (var i = 0; i < vnodes.length; i++) {
      res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
    }
    return res
  }
}

function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
  // #7817 clone node before setting fnContext, otherwise if the node is reused
  // (e.g. it was from a cached normal slot) the fnContext causes named slots
  // that should not be matched to match.
  var clone = cloneVNode(vnode);
  clone.fnContext = contextVm;
  clone.fnOptions = options;
  if (true) {
    (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
  }
  if (data.slot) {
    (clone.data || (clone.data = {})).slot = data.slot;
  }
  return clone
}

function mergeProps (to, from) {
  for (var key in from) {
    to[camelize(key)] = from[key];
  }
}

/*  */

/*  */

/*  */

/*  */

// inline hooks to be invoked on component VNodes during patch
var componentVNodeHooks = {
  init: function init (vnode, hydrating) {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      var mountedNode = vnode; // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    } else {
      var child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      );
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  },

  prepatch: function prepatch (oldVnode, vnode) {
    var options = vnode.componentOptions;
    var child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    );
  },

  insert: function insert (vnode) {
    var context = vnode.context;
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true /* direct */);
      }
    }
  },

  destroy: function destroy (vnode) {
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy();
      } else {
        deactivateChildComponent(componentInstance, true /* direct */);
      }
    }
  }
};

var hooksToMerge = Object.keys(componentVNodeHooks);

function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  if (isUndef(Ctor)) {
    return
  }

  var baseCtor = context.$options._base;

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    if (true) {
      warn(("Invalid Component definition: " + (String(Ctor))), context);
    }
    return
  }

  // async component
  var asyncFactory;
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor;
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {};

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor);

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  }

  // extract props
  var propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn;

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    var slot = data.slot;
    data = {};
    if (slot) {
      data.slot = slot;
    }
  }

  // install component management hooks onto the placeholder node
  installComponentHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode(
    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
    data, undefined, undefined, undefined, context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
    asyncFactory
  );

  return vnode
}

function createComponentInstanceForVnode (
  // we know it's MountedComponentVNode but flow doesn't
  vnode,
  // activeInstance in lifecycle state
  parent
) {
  var options = {
    _isComponent: true,
    _parentVnode: vnode,
    parent: parent
  };
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate;
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  return new vnode.componentOptions.Ctor(options)
}

function installComponentHooks (data) {
  var hooks = data.hook || (data.hook = {});
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    var existing = hooks[key];
    var toMerge = componentVNodeHooks[key];
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
    }
  }
}

function mergeHook$1 (f1, f2) {
  var merged = function (a, b) {
    // flow complains about extra args which is why we use any
    f1(a, b);
    f2(a, b);
  };
  merged._merged = true;
  return merged
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data) {
  var prop = (options.model && options.model.prop) || 'value';
  var event = (options.model && options.model.event) || 'input'
  ;(data.attrs || (data.attrs = {}))[prop] = data.model.value;
  var on = data.on || (data.on = {});
  var existing = on[event];
  var callback = data.model.callback;
  if (isDef(existing)) {
    if (
      Array.isArray(existing)
        ? existing.indexOf(callback) === -1
        : existing !== callback
    ) {
      on[event] = [callback].concat(existing);
    }
  } else {
    on[event] = callback;
  }
}

/*  */

var SIMPLE_NORMALIZE = 1;
var ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  context,
  tag,
  data,
  children,
  normalizationType,
  alwaysNormalize
) {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE;
  }
  return _createElement(context, tag, data, children, normalizationType)
}

function _createElement (
  context,
  tag,
  data,
  children,
  normalizationType
) {
  if (isDef(data) && isDef((data).__ob__)) {
     true && warn(
      "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
      'Always create fresh vnode data objects in each render!',
      context
    );
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is;
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if ( true &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      );
    }
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  var vnode, ns;
  if (typeof tag === 'string') {
    var Ctor;
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if ( true && isDef(data) && isDef(data.nativeOn) && data.tag !== 'component') {
        warn(
          ("The .native modifier for v-on is only valid on components but it was used on <" + tag + ">."),
          context
        );
      }
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      );
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      );
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) { applyNS(vnode, ns); }
    if (isDef(data)) { registerDeepBindings(data); }
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns;
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined;
    force = true;
  }
  if (isDef(vnode.children)) {
    for (var i = 0, l = vnode.children.length; i < l; i++) {
      var child = vnode.children[i];
      if (isDef(child.tag) && (
        isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
        applyNS(child, ns, force);
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings (data) {
  if (isObject(data.style)) {
    traverse(data.style);
  }
  if (isObject(data.class)) {
    traverse(data.class);
  }
}

/*  */

function initRender (vm) {
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null; // v-once cached trees
  var options = vm.$options;
  var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  var parentData = parentVnode && parentVnode.data;

  /* istanbul ignore else */
  if (true) {
    defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
      !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
    }, true);
    defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, function () {
      !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
    }, true);
  } else {}
}

var currentRenderingInstance = null;

function renderMixin (Vue) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype);

  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  };

  Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var _parentVnode = ref._parentVnode;

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      );
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // render self
    var vnode;
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm;
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      handleError(e, vm, "render");
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if ( true && vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
        } catch (e) {
          handleError(e, vm, "renderError");
          vnode = vm._vnode;
        }
      } else {
        vnode = vm._vnode;
      }
    } finally {
      currentRenderingInstance = null;
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0];
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if ( true && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        );
      }
      vnode = createEmptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    return vnode
  };
}

/*  */

function ensureCtor (comp, base) {
  if (
    comp.__esModule ||
    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
  ) {
    comp = comp.default;
  }
  return isObject(comp)
    ? base.extend(comp)
    : comp
}

function createAsyncPlaceholder (
  factory,
  data,
  context,
  children,
  tag
) {
  var node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = { data: data, context: context, children: children, tag: tag };
  return node
}

function resolveAsyncComponent (
  factory,
  baseCtor
) {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }

  if (isDef(factory.resolved)) {
    return factory.resolved
  }

  var owner = currentRenderingInstance;
  if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
    // already pending
    factory.owners.push(owner);
  }

  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }

  if (owner && !isDef(factory.owners)) {
    var owners = factory.owners = [owner];
    var sync = true;
    var timerLoading = null;
    var timerTimeout = null

    ;(owner).$on('hook:destroyed', function () { return remove(owners, owner); });

    var forceRender = function (renderCompleted) {
      for (var i = 0, l = owners.length; i < l; i++) {
        (owners[i]).$forceUpdate();
      }

      if (renderCompleted) {
        owners.length = 0;
        if (timerLoading !== null) {
          clearTimeout(timerLoading);
          timerLoading = null;
        }
        if (timerTimeout !== null) {
          clearTimeout(timerTimeout);
          timerTimeout = null;
        }
      }
    };

    var resolve = once(function (res) {
      // cache resolved
      factory.resolved = ensureCtor(res, baseCtor);
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        forceRender(true);
      } else {
        owners.length = 0;
      }
    });

    var reject = once(function (reason) {
       true && warn(
        "Failed to resolve async component: " + (String(factory)) +
        (reason ? ("\nReason: " + reason) : '')
      );
      if (isDef(factory.errorComp)) {
        factory.error = true;
        forceRender(true);
      }
    });

    var res = factory(resolve, reject);

    if (isObject(res)) {
      if (isPromise(res)) {
        // () => Promise
        if (isUndef(factory.resolved)) {
          res.then(resolve, reject);
        }
      } else if (isPromise(res.component)) {
        res.component.then(resolve, reject);

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor);
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor);
          if (res.delay === 0) {
            factory.loading = true;
          } else {
            timerLoading = setTimeout(function () {
              timerLoading = null;
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true;
                forceRender(false);
              }
            }, res.delay || 200);
          }
        }

        if (isDef(res.timeout)) {
          timerTimeout = setTimeout(function () {
            timerTimeout = null;
            if (isUndef(factory.resolved)) {
              reject(
                 true
                  ? ("timeout (" + (res.timeout) + "ms)")
                  : 0
              );
            }
          }, res.timeout);
        }
      }
    }

    sync = false;
    // return in case resolved synchronously
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}

/*  */

function getFirstComponentChild (children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}

/*  */

/*  */

function initEvents (vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

var target;

function add (event, fn) {
  target.$on(event, fn);
}

function remove$1 (event, fn) {
  target.$off(event, fn);
}

function createOnceHandler (event, fn) {
  var _target = target;
  return function onceHandler () {
    var res = fn.apply(null, arguments);
    if (res !== null) {
      _target.$off(event, onceHandler);
    }
  }
}

function updateComponentListeners (
  vm,
  listeners,
  oldListeners
) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
  target = undefined;
}

function eventsMixin (Vue) {
  var hookRE = /^hook:/;
  Vue.prototype.$on = function (event, fn) {
    var vm = this;
    if (Array.isArray(event)) {
      for (var i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn);
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn);
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm
  };

  Vue.prototype.$once = function (event, fn) {
    var vm = this;
    function on () {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm
  };

  Vue.prototype.$off = function (event, fn) {
    var vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm
    }
    // array of events
    if (Array.isArray(event)) {
      for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
        vm.$off(event[i$1], fn);
      }
      return vm
    }
    // specific event
    var cbs = vm._events[event];
    if (!cbs) {
      return vm
    }
    if (!fn) {
      vm._events[event] = null;
      return vm
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break
      }
    }
    return vm
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;
    if (true) {
      var lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          "Event \"" + lowerCaseEvent + "\" is emitted in component " +
          (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
          "Note that HTML attributes are case-insensitive and you cannot use " +
          "v-on to listen to camelCase events when using in-DOM templates. " +
          "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
        );
      }
    }
    var cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      var info = "event handler for \"" + event + "\"";
      for (var i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info);
      }
    }
    return vm
  };
}

/*  */

var activeInstance = null;
var isUpdatingChildComponent = false;

function setActiveInstance(vm) {
  var prevActiveInstance = activeInstance;
  activeInstance = vm;
  return function () {
    activeInstance = prevActiveInstance;
  }
}

function initLifecycle (vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var restoreActiveInstance = setActiveInstance(vm);
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    restoreActiveInstance();
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  Vue.prototype.$destroy = function () {
    var vm = this;
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    var parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    var i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null);
    // fire destroyed hook
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    vm.$off();
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      vm.$vnode.parent = null;
    }
  };
}

function mountComponent (
  vm,
  el,
  hydrating
) {
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
    if (true) {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        );
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        );
      }
    }
  }
  callHook(vm, 'beforeMount');

  var updateComponent;
  /* istanbul ignore if */
  if ( true && config.performance && mark) {
    updateComponent = function () {
      var name = vm._name;
      var id = vm._uid;
      var startTag = "vue-perf-start:" + id;
      var endTag = "vue-perf-end:" + id;

      mark(startTag);
      var vnode = vm._render();
      mark(endTag);
      measure(("vue " + name + " render"), startTag, endTag);

      mark(startTag);
      vm._update(vnode, hydrating);
      mark(endTag);
      measure(("vue " + name + " patch"), startTag, endTag);
    };
  } else {
    updateComponent = function () {
      vm._update(vm._render(), hydrating);
    };
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(vm, updateComponent, noop, {
    before: function before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate');
      }
    }
  }, true /* isRenderWatcher */);
  hydrating = false;

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm
}

function updateChildComponent (
  vm,
  propsData,
  listeners,
  parentVnode,
  renderChildren
) {
  if (true) {
    isUpdatingChildComponent = true;
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren.

  // check if there are dynamic scopedSlots (hand-written or compiled but with
  // dynamic slot names). Static scoped slots compiled from template has the
  // "$stable" marker.
  var newScopedSlots = parentVnode.data.scopedSlots;
  var oldScopedSlots = vm.$scopedSlots;
  var hasDynamicScopedSlot = !!(
    (newScopedSlots && !newScopedSlots.$stable) ||
    (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
    (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key) ||
    (!newScopedSlots && vm.$scopedSlots.$key)
  );

  // Any static slot children from the parent may have changed during parent's
  // update. Dynamic scoped slots may also have changed. In such cases, a forced
  // update is necessary to ensure correctness.
  var needsForceUpdate = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    hasDynamicScopedSlot
  );

  vm.$options._parentVnode = parentVnode;
  vm.$vnode = parentVnode; // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode;
  }
  vm.$options._renderChildren = renderChildren;

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject;
  vm.$listeners = listeners || emptyObject;

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false);
    var props = vm._props;
    var propKeys = vm.$options._propKeys || [];
    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      var propOptions = vm.$options.props; // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm);
    }
    toggleObserving(true);
    // keep a copy of raw propsData
    vm.$options.propsData = propsData;
  }

  // update listeners
  listeners = listeners || emptyObject;
  var oldListeners = vm.$options._parentListeners;
  vm.$options._parentListeners = listeners;
  updateComponentListeners(vm, listeners, oldListeners);

  // resolve slots + force update if has children
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }

  if (true) {
    isUpdatingChildComponent = false;
  }
}

function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) { return true }
  }
  return false
}

function activateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = false;
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;
    for (var i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'activated');
  }
}

function deactivateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = true;
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true;
    for (var i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'deactivated');
  }
}

function callHook (vm, hook) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget();
  var handlers = vm.$options[hook];
  var info = hook + " hook";
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info);
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }
  popTarget();
}

/*  */

var MAX_UPDATE_COUNT = 100;

var queue = [];
var activatedChildren = [];
var has = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  if (true) {
    circular = {};
  }
  waiting = flushing = false;
}

// Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.
var currentFlushTimestamp = 0;

// Async edge case fix requires storing an event listener's attach timestamp.
var getNow = Date.now;

// Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)
if (inBrowser && !isIE) {
  var performance = window.performance;
  if (
    performance &&
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
  ) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = function () { return performance.now(); };
  }
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow();
  flushing = true;
  var watcher, id;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) { return a.id - b.id; });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    if (watcher.before) {
      watcher.before();
    }
    id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if ( true && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? ("in watcher with expression \"" + (watcher.expression) + "\"")
              : "in a component render function."
          ),
          watcher.vm
        );
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  var activatedQueue = activatedChildren.slice();
  var updatedQueue = queue.slice();

  resetSchedulerState();

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue);

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }
}

function callUpdatedHooks (queue) {
  var i = queue.length;
  while (i--) {
    var watcher = queue[i];
    var vm = watcher.vm;
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated');
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
function queueActivatedComponent (vm) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false;
  activatedChildren.push(vm);
}

function callActivatedHooks (queue) {
  for (var i = 0; i < queue.length; i++) {
    queue[i]._inactive = true;
    activateChildComponent(queue[i], true /* true */);
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher (watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;

      if ( true && !config.async) {
        flushSchedulerQueue();
        return
      }
      nextTick(flushSchedulerQueue);
    }
  }
}

/*  */



var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
var Watcher = function Watcher (
  vm,
  expOrFn,
  cb,
  options,
  isRenderWatcher
) {
  this.vm = vm;
  if (isRenderWatcher) {
    vm._watcher = this;
  }
  vm._watchers.push(this);
  // options
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
    this.before = options.before;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression =  true
    ? expOrFn.toString()
    : 0;
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = noop;
       true && warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      );
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get();
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */
Watcher.prototype.get = function get () {
  pushTarget(this);
  var value;
  var vm = this.vm;
  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (this.user) {
      handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }
    popTarget();
    this.cleanupDeps();
  }
  return value
};

/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function cleanupDeps () {
  var i = this.deps.length;
  while (i--) {
    var dep = this.deps[i];
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get();
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      if (this.user) {
        var info = "callback for watcher \"" + (this.expression) + "\"";
        invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info);
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get();
  this.dirty = false;
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
  var i = this.deps.length;
  while (i--) {
    this.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subscriber list.
 */
Watcher.prototype.teardown = function teardown () {
  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this);
    }
    var i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this);
    }
    this.active = false;
  }
};

/*  */

var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  };
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initState (vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) { initProps(vm, opts.props); }
  if (opts.methods) { initMethods(vm, opts.methods); }
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) { initComputed(vm, opts.computed); }
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function initProps (vm, propsOptions) {
  var propsData = vm.$options.propsData || {};
  var props = vm._props = {};
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  var keys = vm.$options._propKeys = [];
  var isRoot = !vm.$parent;
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false);
  }
  var loop = function ( key ) {
    keys.push(key);
    var value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
    if (true) {
      var hyphenatedKey = hyphenate(key);
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
          vm
        );
      }
      defineReactive$$1(props, key, value, function () {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            "Avoid mutating a prop directly since the value will be " +
            "overwritten whenever the parent component re-renders. " +
            "Instead, use a data or computed property based on the prop's " +
            "value. Prop being mutated: \"" + key + "\"",
            vm
          );
        }
      });
    } else {}
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, "_props", key);
    }
  };

  for (var key in propsOptions) loop( key );
  toggleObserving(true);
}

function initData (vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {};
  if (!isPlainObject(data)) {
    data = {};
     true && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;
  while (i--) {
    var key = keys[i];
    if (true) {
      if (methods && hasOwn(methods, key)) {
        warn(
          ("Method \"" + key + "\" has already been defined as a data property."),
          vm
        );
      }
    }
    if (props && hasOwn(props, key)) {
       true && warn(
        "The data property \"" + key + "\" is already declared as a prop. " +
        "Use prop default value instead.",
        vm
      );
    } else if (!isReserved(key)) {
      proxy(vm, "_data", key);
    }
  }
  // observe data
  observe(data, true /* asRootData */);
}

function getData (data, vm) {
  // #7573 disable dep collection when invoking data getters
  pushTarget();
  try {
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, "data()");
    return {}
  } finally {
    popTarget();
  }
}

var computedWatcherOptions = { lazy: true };

function initComputed (vm, computed) {
  // $flow-disable-line
  var watchers = vm._computedWatchers = Object.create(null);
  // computed properties are just getters during SSR
  var isSSR = isServerRendering();

  for (var key in computed) {
    var userDef = computed[key];
    var getter = typeof userDef === 'function' ? userDef : userDef.get;
    if ( true && getter == null) {
      warn(
        ("Getter is missing for computed property \"" + key + "\"."),
        vm
      );
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      );
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else if (true) {
      if (key in vm.$data) {
        warn(("The computed property \"" + key + "\" is already defined in data."), vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
      } else if (vm.$options.methods && key in vm.$options.methods) {
        warn(("The computed property \"" + key + "\" is already defined as a method."), vm);
      }
    }
  }
}

function defineComputed (
  target,
  key,
  userDef
) {
  var shouldCache = !isServerRendering();
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }
  if ( true &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        ("Computed property \"" + key + "\" was assigned to but it has no setter."),
        this
      );
    };
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter (key) {
  return function computedGetter () {
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value
    }
  }
}

function createGetterInvoker(fn) {
  return function computedGetter () {
    return fn.call(this, this)
  }
}

function initMethods (vm, methods) {
  var props = vm.$options.props;
  for (var key in methods) {
    if (true) {
      if (typeof methods[key] !== 'function') {
        warn(
          "Method \"" + key + "\" has type \"" + (typeof methods[key]) + "\" in the component definition. " +
          "Did you reference the function correctly?",
          vm
        );
      }
      if (props && hasOwn(props, key)) {
        warn(
          ("Method \"" + key + "\" has already been defined as a prop."),
          vm
        );
      }
      if ((key in vm) && isReserved(key)) {
        warn(
          "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
          "Avoid defining component methods that start with _ or $."
        );
      }
    }
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
  }
}

function initWatch (vm, watch) {
  for (var key in watch) {
    var handler = watch[key];
    if (Array.isArray(handler)) {
      for (var i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher (
  vm,
  expOrFn,
  handler,
  options
) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(expOrFn, handler, options)
}

function stateMixin (Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};
  dataDef.get = function () { return this._data };
  var propsDef = {};
  propsDef.get = function () { return this._props };
  if (true) {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      );
    };
    propsDef.set = function () {
      warn("$props is readonly.", this);
    };
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.prototype, '$props', propsDef);

  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    var vm = this;
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      var info = "callback for immediate watcher \"" + (watcher.expression) + "\"";
      pushTarget();
      invokeWithErrorHandling(cb, vm, [watcher.value], vm, info);
      popTarget();
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  };
}

/*  */

var uid$3 = 0;

function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    var vm = this;
    // a uid
    vm._uid = uid$3++;

    var startTag, endTag;
    /* istanbul ignore if */
    if ( true && config.performance && mark) {
      startTag = "vue-perf-start:" + (vm._uid);
      endTag = "vue-perf-end:" + (vm._uid);
      mark(startTag);
    }

    // a flag to avoid this being observed
    vm._isVue = true;
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }
    /* istanbul ignore else */
    if (true) {
      initProxy(vm);
    } else {}
    // expose real self
    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initInjections(vm); // resolve injections before data/props
    initState(vm);
    initProvide(vm); // resolve provide after data/props
    callHook(vm, 'created');

    /* istanbul ignore if */
    if ( true && config.performance && mark) {
      vm._name = formatComponentName(vm, false);
      mark(endTag);
      measure(("vue " + (vm._name) + " init"), startTag, endTag);
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}

function initInternalComponent (vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options);
  // doing this because it's faster than dynamic enumeration.
  var parentVnode = options._parentVnode;
  opts.parent = options.parent;
  opts._parentVnode = parentVnode;

  var vnodeComponentOptions = parentVnode.componentOptions;
  opts.propsData = vnodeComponentOptions.propsData;
  opts._parentListeners = vnodeComponentOptions.listeners;
  opts._renderChildren = vnodeComponentOptions.children;
  opts._componentTag = vnodeComponentOptions.tag;

  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

function resolveConstructorOptions (Ctor) {
  var options = Ctor.options;
  if (Ctor.super) {
    var superOptions = resolveConstructorOptions(Ctor.super);
    var cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions;
      // check if there are any late-modified/attached options (#4976)
      var modifiedOptions = resolveModifiedOptions(Ctor);
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor) {
  var modified;
  var latest = Ctor.options;
  var sealed = Ctor.sealedOptions;
  for (var key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) { modified = {}; }
      modified[key] = latest[key];
    }
  }
  return modified
}

function Vue (options) {
  if ( true &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

/*  */

function initUse (Vue) {
  Vue.use = function (plugin) {
    var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this
  };
}

/*  */

function initMixin$1 (Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this
  };
}

/*  */

function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    var name = extendOptions.name || Super.options.name;
    if ( true && name) {
      validateComponentName(name);
    }

    var Sub = function VueComponent (options) {
      this._init(options);
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );
    Sub['super'] = Super;

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps$1(Sub);
    }
    if (Sub.options.computed) {
      initComputed$1(Sub);
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);

    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub
  };
}

function initProps$1 (Comp) {
  var props = Comp.options.props;
  for (var key in props) {
    proxy(Comp.prototype, "_props", key);
  }
}

function initComputed$1 (Comp) {
  var computed = Comp.options.computed;
  for (var key in computed) {
    defineComputed(Comp.prototype, key, computed[key]);
  }
}

/*  */

function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(function (type) {
    Vue[type] = function (
      id,
      definition
    ) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if ( true && type === 'component') {
          validateComponentName(id);
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = this.options._base.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        this.options[type + 's'][id] = definition;
        return definition
      }
    };
  });
}

/*  */





function getComponentName (opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache (keepAliveInstance, filter) {
  var cache = keepAliveInstance.cache;
  var keys = keepAliveInstance.keys;
  var _vnode = keepAliveInstance._vnode;
  for (var key in cache) {
    var entry = cache[key];
    if (entry) {
      var name = entry.name;
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode);
      }
    }
  }
}

function pruneCacheEntry (
  cache,
  key,
  keys,
  current
) {
  var entry = cache[key];
  if (entry && (!current || entry.tag !== current.tag)) {
    entry.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}

var patternTypes = [String, RegExp, Array];

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  methods: {
    cacheVNode: function cacheVNode() {
      var ref = this;
      var cache = ref.cache;
      var keys = ref.keys;
      var vnodeToCache = ref.vnodeToCache;
      var keyToCache = ref.keyToCache;
      if (vnodeToCache) {
        var tag = vnodeToCache.tag;
        var componentInstance = vnodeToCache.componentInstance;
        var componentOptions = vnodeToCache.componentOptions;
        cache[keyToCache] = {
          name: getComponentName(componentOptions),
          tag: tag,
          componentInstance: componentInstance,
        };
        keys.push(keyToCache);
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode);
        }
        this.vnodeToCache = null;
      }
    }
  },

  created: function created () {
    this.cache = Object.create(null);
    this.keys = [];
  },

  destroyed: function destroyed () {
    for (var key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },

  mounted: function mounted () {
    var this$1 = this;

    this.cacheVNode();
    this.$watch('include', function (val) {
      pruneCache(this$1, function (name) { return matches(val, name); });
    });
    this.$watch('exclude', function (val) {
      pruneCache(this$1, function (name) { return !matches(val, name); });
    });
  },

  updated: function updated () {
    this.cacheVNode();
  },

  render: function render () {
    var slot = this.$slots.default;
    var vnode = getFirstComponentChild(slot);
    var componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // check pattern
      var name = getComponentName(componentOptions);
      var ref = this;
      var include = ref.include;
      var exclude = ref.exclude;
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      var ref$1 = this;
      var cache = ref$1.cache;
      var keys = ref$1.keys;
      var key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
        : vnode.key;
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance;
        // make current key freshest
        remove(keys, key);
        keys.push(key);
      } else {
        // delay setting the cache until update
        this.vnodeToCache = vnode;
        this.keyToCache = key;
      }

      vnode.data.keepAlive = true;
    }
    return vnode || (slot && slot[0])
  }
};

var builtInComponents = {
  KeepAlive: KeepAlive
};

/*  */

function initGlobalAPI (Vue) {
  // config
  var configDef = {};
  configDef.get = function () { return config; };
  if (true) {
    configDef.set = function () {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      );
    };
  }
  Object.defineProperty(Vue, 'config', configDef);

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn: warn,
    extend: extend,
    mergeOptions: mergeOptions,
    defineReactive: defineReactive$$1
  };

  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  // 2.6 explicit observable API
  Vue.observable = function (obj) {
    observe(obj);
    return obj
  };

  Vue.options = Object.create(null);
  ASSET_TYPES.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;

  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue);

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
});

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get: function get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
});

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
});

Vue.version = '2.6.14';

/*  */

// these are reserved for web because they are directly compiled away
// during template compilation
var isReservedAttr = makeMap('style,class');

// attributes that should be using props for binding
var acceptValue = makeMap('input,textarea,option,select,progress');
var mustUseProp = function (tag, type, attr) {
  return (
    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
};

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');

var convertEnumeratedValue = function (key, value) {
  return isFalsyAttrValue(value) || value === 'false'
    ? 'false'
    // allow arbitrary string value for contenteditable
    : key === 'contenteditable' && isValidContentEditableValue(value)
      ? value
      : 'true'
};

var isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,' +
  'truespeed,typemustmatch,visible'
);

var xlinkNS = 'http://www.w3.org/1999/xlink';

var isXlink = function (name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
};

var getXlinkProp = function (name) {
  return isXlink(name) ? name.slice(6, name.length) : ''
};

var isFalsyAttrValue = function (val) {
  return val == null || val === false
};

/*  */

function genClassForVnode (vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;
  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode;
    if (childNode && childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while (isDef(parentNode = parentNode.parent)) {
    if (parentNode && parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return renderClass(data.staticClass, data.class)
}

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class)
      ? [child.class, parent.class]
      : parent.class
  }
}

function renderClass (
  staticClass,
  dynamicClass
) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
  return ''
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass (value) {
  if (Array.isArray(value)) {
    return stringifyArray(value)
  }
  if (isObject(value)) {
    return stringifyObject(value)
  }
  if (typeof value === 'string') {
    return value
  }
  /* istanbul ignore next */
  return ''
}

function stringifyArray (value) {
  var res = '';
  var stringified;
  for (var i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) { res += ' '; }
      res += stringified;
    }
  }
  return res
}

function stringifyObject (value) {
  var res = '';
  for (var key in value) {
    if (value[key]) {
      if (res) { res += ' '; }
      res += key;
    }
  }
  return res
}

/*  */

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

var isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);

var isPreTag = function (tag) { return tag === 'pre'; };

var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag)
};

function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

var unknownElementCache = Object.create(null);
function isUnknownElement (tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  var el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

var isTextInputType = makeMap('text,number,password,search,email,tel,url');

/*  */

/**
 * Query an element selector if it's not an element already.
 */
function query (el) {
  if (typeof el === 'string') {
    var selected = document.querySelector(el);
    if (!selected) {
       true && warn(
        'Cannot find element: ' + el
      );
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}

/*  */

function createElement$1 (tagName, vnode) {
  var elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm
  }
  // false or null will remove the attribute but undefined will not
  if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm
}

function createElementNS (namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
  return document.createTextNode(text)
}

function createComment (text) {
  return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild (node, child) {
  node.removeChild(child);
}

function appendChild (node, child) {
  node.appendChild(child);
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  node.textContent = text;
}

function setStyleScope (node, scopeId) {
  node.setAttribute(scopeId, '');
}

var nodeOps = /*#__PURE__*/Object.freeze({
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  createComment: createComment,
  insertBefore: insertBefore,
  removeChild: removeChild,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent,
  setStyleScope: setStyleScope
});

/*  */

var ref = {
  create: function create (_, vnode) {
    registerRef(vnode);
  },
  update: function update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy (vnode) {
    registerRef(vnode, true);
  }
};

function registerRef (vnode, isRemoval) {
  var key = vnode.data.ref;
  if (!isDef(key)) { return }

  var vm = vnode.context;
  var ref = vnode.componentInstance || vnode.elm;
  var refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref];
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref);
      }
    } else {
      refs[key] = ref;
    }
  }
}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

var emptyNode = new VNode('', {}, []);

var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

function sameVnode (a, b) {
  return (
    a.key === b.key &&
    a.asyncFactory === b.asyncFactory && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}

function sameInputType (a, b) {
  if (a.tag !== 'input') { return true }
  var i;
  var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  var i, key;
  var map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) { map[key] = i; }
  }
  return map
}

function createPatchFunction (backend) {
  var i, j;
  var cbs = {};

  var modules = backend.modules;
  var nodeOps = backend.nodeOps;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }

  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    function remove$$1 () {
      if (--remove$$1.listeners === 0) {
        removeNode(childElm);
      }
    }
    remove$$1.listeners = listeners;
    return remove$$1
  }

  function removeNode (el) {
    var parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  function isUnknownElement$$1 (vnode, inVPre) {
    return (
      !inVPre &&
      !vnode.ns &&
      !(
        config.ignoredElements.length &&
        config.ignoredElements.some(function (ignore) {
          return isRegExp(ignore)
            ? ignore.test(vnode.tag)
            : ignore === vnode.tag
        })
      ) &&
      config.isUnknownElement(vnode.tag)
    )
  }

  var creatingElmInVPre = 0;

  function createElm (
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
  ) {
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // This vnode was used in a previous render!
      // now it's used as a new node, overwriting its elm would cause
      // potential patch errors down the road when it's used as an insertion
      // reference node. Instead, we clone the node on-demand before creating
      // associated DOM element for it.
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    vnode.isRootInsert = !nested; // for transition enter check
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      if (true) {
        if (data && data.pre) {
          creatingElmInVPre++;
        }
        if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          );
        }
      }

      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      setScope(vnode);

      /* istanbul ignore if */
      {
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm);
      }

      if ( true && data && data.pre) {
        creatingElmInVPre--;
      }
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;
    if (isDef(i)) {
      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        insert(parentElm, vnode.elm, refElm);
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
      vnode.data.pendingInsert = null;
    }
    vnode.elm = vnode.componentInstance.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    var innerNode = vnode;
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm);
  }

  function insert (parent, elm, ref$$1) {
    if (isDef(parent)) {
      if (isDef(ref$$1)) {
        if (nodeOps.parentNode(ref$$1) === parent) {
          nodeOps.insertBefore(parent, elm, ref$$1);
        }
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      if (true) {
        checkDuplicateKeys(children);
      }
      for (var i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
    }
  }

  function isPatchable (vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) { i.create(emptyNode, vnode); }
      if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    var i;
    if (isDef(i = vnode.fnScopeId)) {
      nodeOps.setStyleScope(vnode.elm, i);
    } else {
      var ancestor = vnode;
      while (ancestor) {
        if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
          nodeOps.setStyleScope(vnode.elm, i);
        }
        ancestor = ancestor.parent;
      }
    }
    // for slot content they should also get the scopeId from the host instance.
    if (isDef(i = activeInstance) &&
      i !== vnode.context &&
      i !== vnode.fnContext &&
      isDef(i = i.$options._scopeId)
    ) {
      nodeOps.setStyleScope(vnode.elm, i);
    }
  }

  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
    }
  }

  function invokeDestroyHook (vnode) {
    var i, j;
    var data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
      for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes (vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else { // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      var i;
      var listeners = cbs.remove.length + 1;
      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    var canMove = !removeOnly;

    if (true) {
      checkDuplicateKeys(newCh);
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
        } else {
          vnodeToMove = oldCh[idxInOld];
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          }
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function checkDuplicateKeys (children) {
    var seenKeys = {};
    for (var i = 0; i < children.length; i++) {
      var vnode = children[i];
      var key = vnode.key;
      if (isDef(key)) {
        if (seenKeys[key]) {
          warn(
            ("Duplicate keys detected: '" + key + "'. This may cause an update error."),
            vnode.context
          );
        } else {
          seenKeys[key] = true;
        }
      }
    }
  }

  function findIdxInOld (node, oldCh, start, end) {
    for (var i = start; i < end; i++) {
      var c = oldCh[i];
      if (isDef(c) && sameVnode(node, c)) { return i }
    }
  }

  function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    if (oldVnode === vnode) {
      return
    }

    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // clone reused vnode
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    var elm = vnode.elm = oldVnode.elm;

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
      } else {
        vnode.isAsyncPlaceholder = true;
      }
      return
    }

    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance;
      return
    }

    var i;
    var data = vnode.data;
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }

    var oldCh = oldVnode.children;
    var ch = vnode.children;
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
      if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
      } else if (isDef(ch)) {
        if (true) {
          checkDuplicateKeys(ch);
        }
        if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  var hydrationBailed = false;
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  // Note: style is excluded because it relies on initial clone for future
  // deep updates (#7063).
  var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
    var i;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    inVPre = inVPre || (data && data.pre);
    vnode.elm = elm;

    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.isAsyncPlaceholder = true;
      return true
    }
    // assert node match
    if (true) {
      if (!assertNodeMatch(elm, vnode, inVPre)) {
        return false
      }
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          // v-html and domProps: innerHTML
          if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
            if (i !== elm.innerHTML) {
              /* istanbul ignore if */
              if ( true &&
                typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('server innerHTML: ', i);
                console.warn('client innerHTML: ', elm.innerHTML);
              }
              return false
            }
          } else {
            // iterate and compare children lists
            var childrenMatch = true;
            var childNode = elm.firstChild;
            for (var i$1 = 0; i$1 < children.length; i$1++) {
              if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                childrenMatch = false;
                break
              }
              childNode = childNode.nextSibling;
            }
            // if childNode is not null, it means the actual childNodes list is
            // longer than the virtual children list.
            if (!childrenMatch || childNode) {
              /* istanbul ignore if */
              if ( true &&
                typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
              }
              return false
            }
          }
        }
      }
      if (isDef(data)) {
        var fullInvoke = false;
        for (var key in data) {
          if (!isRenderedModule(key)) {
            fullInvoke = true;
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break
          }
        }
        if (!fullInvoke && data['class']) {
          // ensure collecting deps for deep class bindings for future updates
          traverse(data['class']);
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
    }
    return true
  }

  function assertNodeMatch (node, vnode, inVPre) {
    if (isDef(vnode.tag)) {
      return vnode.tag.indexOf('vue-component') === 0 || (
        !isUnknownElement$$1(vnode, inVPre) &&
        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
      )
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3)
    }
  }

  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
      return
    }

    var isInitialPatch = false;
    var insertedVnodeQueue = [];

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR);
            hydrating = true;
          }
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode
            } else if (true) {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              );
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode);
        }

        // replacing existing element
        var oldElm = oldVnode.elm;
        var parentElm = nodeOps.parentNode(oldElm);

        // create new node
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        );

        // update parent placeholder node element, recursively
        if (isDef(vnode.parent)) {
          var ancestor = vnode.parent;
          var patchable = isPatchable(vnode);
          while (ancestor) {
            for (var i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor);
            }
            ancestor.elm = vnode.elm;
            if (patchable) {
              for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, ancestor);
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              var insert = ancestor.data.hook.insert;
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                  insert.fns[i$2]();
                }
              }
            } else {
              registerRef(ancestor);
            }
            ancestor = ancestor.parent;
          }
        }

        // destroy old node
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm
  }
}

/*  */

var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives (oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update (oldVnode, vnode) {
  var isCreate = oldVnode === emptyNode;
  var isDestroy = vnode === emptyNode;
  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

  var dirsWithInsert = [];
  var dirsWithPostpatch = [];

  var key, oldDir, dir;
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      dir.oldArg = oldDir.arg;
      callHook$1(dir, 'update', vnode, oldVnode);
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    var callInsert = function () {
      for (var i = 0; i < dirsWithInsert.length; i++) {
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };
    if (isCreate) {
      mergeVNodeHook(vnode, 'insert', callInsert);
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode, 'postpatch', function () {
      for (var i = 0; i < dirsWithPostpatch.length; i++) {
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    });
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

var emptyModifiers = Object.create(null);

function normalizeDirectives$1 (
  dirs,
  vm
) {
  var res = Object.create(null);
  if (!dirs) {
    // $flow-disable-line
    return res
  }
  var i, dir;
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    if (!dir.modifiers) {
      // $flow-disable-line
      dir.modifiers = emptyModifiers;
    }
    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  }
  // $flow-disable-line
  return res
}

function getRawDirName (dir) {
  return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
}

function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
  var fn = dir.def && dir.def[hook];
  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
    } catch (e) {
      handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
    }
  }
}

var baseModules = [
  ref,
  directives
];

/*  */

function updateAttrs (oldVnode, vnode) {
  var opts = vnode.componentOptions;
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return
  }
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return
  }
  var key, cur, old;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(attrs.__ob__)) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      setAttr(elm, key, cur, vnode.data.pre);
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  // #6666: IE/Edge forces progress value down to 1 before setting a max
  /* istanbul ignore if */
  if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value);
  }
  for (key in oldAttrs) {
    if (isUndef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr (el, key, value, isInPre) {
  if (isInPre || el.tagName.indexOf('-') > -1) {
    baseSetAttr(el, key, value);
  } else if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // technically allowfullscreen is a boolean attribute for <iframe>,
      // but Flash expects a value of "true" when used on <embed> tag
      value = key === 'allowfullscreen' && el.tagName === 'EMBED'
        ? 'true'
        : key;
      el.setAttribute(key, value);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, convertEnumeratedValue(key, value));
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    baseSetAttr(el, key, value);
  }
}

function baseSetAttr (el, key, value) {
  if (isFalsyAttrValue(value)) {
    el.removeAttribute(key);
  } else {
    // #7138: IE10 & 11 fires input event when setting placeholder on
    // <textarea>... block the first input event and remove the blocker
    // immediately.
    /* istanbul ignore if */
    if (
      isIE && !isIE9 &&
      el.tagName === 'TEXTAREA' &&
      key === 'placeholder' && value !== '' && !el.__ieph
    ) {
      var blocker = function (e) {
        e.stopImmediatePropagation();
        el.removeEventListener('input', blocker);
      };
      el.addEventListener('input', blocker);
      // $flow-disable-line
      el.__ieph = true; /* IE placeholder patched */
    }
    el.setAttribute(key, value);
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
};

/*  */

function updateClass (oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;
  if (
    isUndef(data.staticClass) &&
    isUndef(data.class) && (
      isUndef(oldData) || (
        isUndef(oldData.staticClass) &&
        isUndef(oldData.class)
      )
    )
  ) {
    return
  }

  var cls = genClassForVnode(vnode);

  // handle transition classes
  var transitionClass = el._transitionClasses;
  if (isDef(transitionClass)) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass
};

/*  */

var validDivisionCharRE = /[\w).+\-_$\]]/;

function parseFilters (exp) {
  var inSingle = false;
  var inDouble = false;
  var inTemplateString = false;
  var inRegex = false;
  var curly = 0;
  var square = 0;
  var paren = 0;
  var lastFilterIndex = 0;
  var c, prev, i, expression, filters;

  for (i = 0; i < exp.length; i++) {
    prev = c;
    c = exp.charCodeAt(i);
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
    } else if (
      c === 0x7C && // pipe
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        expression = exp.slice(0, i).trim();
      } else {
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        var j = i - 1;
        var p = (void 0);
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j);
          if (p !== ' ') { break }
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true;
        }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
    lastFilterIndex = i + 1;
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i]);
    }
  }

  return expression
}

function wrapFilter (exp, filter) {
  var i = filter.indexOf('(');
  if (i < 0) {
    // _f: resolveFilter
    return ("_f(\"" + filter + "\")(" + exp + ")")
  } else {
    var name = filter.slice(0, i);
    var args = filter.slice(i + 1);
    return ("_f(\"" + name + "\")(" + exp + (args !== ')' ? ',' + args : args))
  }
}

/*  */



/* eslint-disable no-unused-vars */
function baseWarn (msg, range) {
  console.error(("[Vue compiler]: " + msg));
}
/* eslint-enable no-unused-vars */

function pluckModuleFunction (
  modules,
  key
) {
  return modules
    ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
    : []
}

function addProp (el, name, value, range, dynamic) {
  (el.props || (el.props = [])).push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
  el.plain = false;
}

function addAttr (el, name, value, range, dynamic) {
  var attrs = dynamic
    ? (el.dynamicAttrs || (el.dynamicAttrs = []))
    : (el.attrs || (el.attrs = []));
  attrs.push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
  el.plain = false;
}

// add a raw attr (use this in preTransforms)
function addRawAttr (el, name, value, range) {
  el.attrsMap[name] = value;
  el.attrsList.push(rangeSetItem({ name: name, value: value }, range));
}

function addDirective (
  el,
  name,
  rawName,
  value,
  arg,
  isDynamicArg,
  modifiers,
  range
) {
  (el.directives || (el.directives = [])).push(rangeSetItem({
    name: name,
    rawName: rawName,
    value: value,
    arg: arg,
    isDynamicArg: isDynamicArg,
    modifiers: modifiers
  }, range));
  el.plain = false;
}

function prependModifierMarker (symbol, name, dynamic) {
  return dynamic
    ? ("_p(" + name + ",\"" + symbol + "\")")
    : symbol + name // mark the event as captured
}

function addHandler (
  el,
  name,
  value,
  modifiers,
  important,
  warn,
  range,
  dynamic
) {
  modifiers = modifiers || emptyObject;
  // warn prevent and passive modifier
  /* istanbul ignore if */
  if (
     true && warn &&
    modifiers.prevent && modifiers.passive
  ) {
    warn(
      'passive and prevent can\'t be used together. ' +
      'Passive handler can\'t prevent default event.',
      range
    );
  }

  // normalize click.right and click.middle since they don't actually fire
  // this is technically browser-specific, but at least for now browsers are
  // the only target envs that have right/middle clicks.
  if (modifiers.right) {
    if (dynamic) {
      name = "(" + name + ")==='click'?'contextmenu':(" + name + ")";
    } else if (name === 'click') {
      name = 'contextmenu';
      delete modifiers.right;
    }
  } else if (modifiers.middle) {
    if (dynamic) {
      name = "(" + name + ")==='click'?'mouseup':(" + name + ")";
    } else if (name === 'click') {
      name = 'mouseup';
    }
  }

  // check capture modifier
  if (modifiers.capture) {
    delete modifiers.capture;
    name = prependModifierMarker('!', name, dynamic);
  }
  if (modifiers.once) {
    delete modifiers.once;
    name = prependModifierMarker('~', name, dynamic);
  }
  /* istanbul ignore if */
  if (modifiers.passive) {
    delete modifiers.passive;
    name = prependModifierMarker('&', name, dynamic);
  }

  var events;
  if (modifiers.native) {
    delete modifiers.native;
    events = el.nativeEvents || (el.nativeEvents = {});
  } else {
    events = el.events || (el.events = {});
  }

  var newHandler = rangeSetItem({ value: value.trim(), dynamic: dynamic }, range);
  if (modifiers !== emptyObject) {
    newHandler.modifiers = modifiers;
  }

  var handlers = events[name];
  /* istanbul ignore if */
  if (Array.isArray(handlers)) {
    important ? handlers.unshift(newHandler) : handlers.push(newHandler);
  } else if (handlers) {
    events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
  } else {
    events[name] = newHandler;
  }

  el.plain = false;
}

function getRawBindingAttr (
  el,
  name
) {
  return el.rawAttrsMap[':' + name] ||
    el.rawAttrsMap['v-bind:' + name] ||
    el.rawAttrsMap[name]
}

function getBindingAttr (
  el,
  name,
  getStatic
) {
  var dynamicValue =
    getAndRemoveAttr(el, ':' + name) ||
    getAndRemoveAttr(el, 'v-bind:' + name);
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    var staticValue = getAndRemoveAttr(el, name);
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}

// note: this only removes the attr from the Array (attrsList) so that it
// doesn't get processed by processAttrs.
// By default it does NOT remove it from the map (attrsMap) because the map is
// needed during codegen.
function getAndRemoveAttr (
  el,
  name,
  removeFromMap
) {
  var val;
  if ((val = el.attrsMap[name]) != null) {
    var list = el.attrsList;
    for (var i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break
      }
    }
  }
  if (removeFromMap) {
    delete el.attrsMap[name];
  }
  return val
}

function getAndRemoveAttrByRegex (
  el,
  name
) {
  var list = el.attrsList;
  for (var i = 0, l = list.length; i < l; i++) {
    var attr = list[i];
    if (name.test(attr.name)) {
      list.splice(i, 1);
      return attr
    }
  }
}

function rangeSetItem (
  item,
  range
) {
  if (range) {
    if (range.start != null) {
      item.start = range.start;
    }
    if (range.end != null) {
      item.end = range.end;
    }
  }
  return item
}

/*  */

/**
 * Cross-platform code generation for component v-model
 */
function genComponentModel (
  el,
  value,
  modifiers
) {
  var ref = modifiers || {};
  var number = ref.number;
  var trim = ref.trim;

  var baseValueExpression = '$$v';
  var valueExpression = baseValueExpression;
  if (trim) {
    valueExpression =
      "(typeof " + baseValueExpression + " === 'string'" +
      "? " + baseValueExpression + ".trim()" +
      ": " + baseValueExpression + ")";
  }
  if (number) {
    valueExpression = "_n(" + valueExpression + ")";
  }
  var assignment = genAssignmentCode(value, valueExpression);

  el.model = {
    value: ("(" + value + ")"),
    expression: JSON.stringify(value),
    callback: ("function (" + baseValueExpression + ") {" + assignment + "}")
  };
}

/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */
function genAssignmentCode (
  value,
  assignment
) {
  var res = parseModel(value);
  if (res.key === null) {
    return (value + "=" + assignment)
  } else {
    return ("$set(" + (res.exp) + ", " + (res.key) + ", " + assignment + ")")
  }
}

/**
 * Parse a v-model expression into a base path and a final key segment.
 * Handles both dot-path and possible square brackets.
 *
 * Possible cases:
 *
 * - test
 * - test[key]
 * - test[test1[key]]
 * - test["a"][key]
 * - xxx.test[a[a].test1[key]]
 * - test.xxx.a["asa"][test1[key]]
 *
 */

var len, str, chr, index$1, expressionPos, expressionEndPos;



function parseModel (val) {
  // Fix https://github.com/vuejs/vue/pull/7730
  // allow v-model="obj.val " (trailing whitespace)
  val = val.trim();
  len = val.length;

  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
    index$1 = val.lastIndexOf('.');
    if (index$1 > -1) {
      return {
        exp: val.slice(0, index$1),
        key: '"' + val.slice(index$1 + 1) + '"'
      }
    } else {
      return {
        exp: val,
        key: null
      }
    }
  }

  str = val;
  index$1 = expressionPos = expressionEndPos = 0;

  while (!eof()) {
    chr = next();
    /* istanbul ignore if */
    if (isStringStart(chr)) {
      parseString(chr);
    } else if (chr === 0x5B) {
      parseBracket(chr);
    }
  }

  return {
    exp: val.slice(0, expressionPos),
    key: val.slice(expressionPos + 1, expressionEndPos)
  }
}

function next () {
  return str.charCodeAt(++index$1)
}

function eof () {
  return index$1 >= len
}

function isStringStart (chr) {
  return chr === 0x22 || chr === 0x27
}

function parseBracket (chr) {
  var inBracket = 1;
  expressionPos = index$1;
  while (!eof()) {
    chr = next();
    if (isStringStart(chr)) {
      parseString(chr);
      continue
    }
    if (chr === 0x5B) { inBracket++; }
    if (chr === 0x5D) { inBracket--; }
    if (inBracket === 0) {
      expressionEndPos = index$1;
      break
    }
  }
}

function parseString (chr) {
  var stringQuote = chr;
  while (!eof()) {
    chr = next();
    if (chr === stringQuote) {
      break
    }
  }
}

/*  */

var warn$1;

// in some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.
var RANGE_TOKEN = '__r';
var CHECKBOX_RADIO_TOKEN = '__c';

function model (
  el,
  dir,
  _warn
) {
  warn$1 = _warn;
  var value = dir.value;
  var modifiers = dir.modifiers;
  var tag = el.tag;
  var type = el.attrsMap.type;

  if (true) {
    // inputs with type="file" are read only and setting the input's
    // value will throw an error.
    if (tag === 'input' && type === 'file') {
      warn$1(
        "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
        "File inputs are read only. Use a v-on:change listener instead.",
        el.rawAttrsMap['v-model']
      );
    }
  }

  if (el.component) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else if (tag === 'select') {
    genSelect(el, value, modifiers);
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value, modifiers);
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value, modifiers);
  } else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value, modifiers);
  } else if (!config.isReservedTag(tag)) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else if (true) {
    warn$1(
      "<" + (el.tag) + " v-model=\"" + value + "\">: " +
      "v-model is not supported on this element type. " +
      'If you are working with contenteditable, it\'s recommended to ' +
      'wrap a library dedicated for that purpose inside a custom component.',
      el.rawAttrsMap['v-model']
    );
  }

  // ensure runtime directive metadata
  return true
}

function genCheckboxModel (
  el,
  value,
  modifiers
) {
  var number = modifiers && modifiers.number;
  var valueBinding = getBindingAttr(el, 'value') || 'null';
  var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
  var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
  addProp(el, 'checked',
    "Array.isArray(" + value + ")" +
    "?_i(" + value + "," + valueBinding + ")>-1" + (
      trueValueBinding === 'true'
        ? (":(" + value + ")")
        : (":_q(" + value + "," + trueValueBinding + ")")
    )
  );
  addHandler(el, 'change',
    "var $$a=" + value + "," +
        '$$el=$event.target,' +
        "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
    'if(Array.isArray($$a)){' +
      "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
          '$$i=_i($$a,$$v);' +
      "if($$el.checked){$$i<0&&(" + (genAssignmentCode(value, '$$a.concat([$$v])')) + ")}" +
      "else{$$i>-1&&(" + (genAssignmentCode(value, '$$a.slice(0,$$i).concat($$a.slice($$i+1))')) + ")}" +
    "}else{" + (genAssignmentCode(value, '$$c')) + "}",
    null, true
  );
}

function genRadioModel (
  el,
  value,
  modifiers
) {
  var number = modifiers && modifiers.number;
  var valueBinding = getBindingAttr(el, 'value') || 'null';
  valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
  addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
  addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
}

function genSelect (
  el,
  value,
  modifiers
) {
  var number = modifiers && modifiers.number;
  var selectedVal = "Array.prototype.filter" +
    ".call($event.target.options,function(o){return o.selected})" +
    ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
    "return " + (number ? '_n(val)' : 'val') + "})";

  var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
  var code = "var $$selectedVal = " + selectedVal + ";";
  code = code + " " + (genAssignmentCode(value, assignment));
  addHandler(el, 'change', code, null, true);
}

function genDefaultModel (
  el,
  value,
  modifiers
) {
  var type = el.attrsMap.type;

  // warn if v-bind:value conflicts with v-model
  // except for inputs with v-bind:type
  if (true) {
    var value$1 = el.attrsMap['v-bind:value'] || el.attrsMap[':value'];
    var typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
    if (value$1 && !typeBinding) {
      var binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
      warn$1(
        binding + "=\"" + value$1 + "\" conflicts with v-model on the same element " +
        'because the latter already expands to a value binding internally',
        el.rawAttrsMap[binding]
      );
    }
  }

  var ref = modifiers || {};
  var lazy = ref.lazy;
  var number = ref.number;
  var trim = ref.trim;
  var needCompositionGuard = !lazy && type !== 'range';
  var event = lazy
    ? 'change'
    : type === 'range'
      ? RANGE_TOKEN
      : 'input';

  var valueExpression = '$event.target.value';
  if (trim) {
    valueExpression = "$event.target.value.trim()";
  }
  if (number) {
    valueExpression = "_n(" + valueExpression + ")";
  }

  var code = genAssignmentCode(value, valueExpression);
  if (needCompositionGuard) {
    code = "if($event.target.composing)return;" + code;
  }

  addProp(el, 'value', ("(" + value + ")"));
  addHandler(el, event, code, null, true);
  if (trim || number) {
    addHandler(el, 'blur', '$forceUpdate()');
  }
}

/*  */

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents (on) {
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    var event = isIE ? 'change' : 'input';
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
    delete on[RANGE_TOKEN];
  }
  // This was originally intended to fix #4521 but no longer necessary
  // after 2.5. Keeping it for backwards compat with generated code from < 2.4
  /* istanbul ignore if */
  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
    delete on[CHECKBOX_RADIO_TOKEN];
  }
}

var target$1;

function createOnceHandler$1 (event, handler, capture) {
  var _target = target$1; // save current target element in closure
  return function onceHandler () {
    var res = handler.apply(null, arguments);
    if (res !== null) {
      remove$2(event, onceHandler, capture, _target);
    }
  }
}

// #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
// implementation and does not fire microtasks in between event propagation, so
// safe to exclude.
var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

function add$1 (
  name,
  handler,
  capture,
  passive
) {
  // async edge case #6566: inner click event triggers patch, event handler
  // attached to outer element during patch, and triggered again. This
  // happens because browsers fire microtask ticks between event propagation.
  // the solution is simple: we save the timestamp when a handler is attached,
  // and the handler would only fire if the event passed to it was fired
  // AFTER it was attached.
  if (useMicrotaskFix) {
    var attachedTimestamp = currentFlushTimestamp;
    var original = handler;
    handler = original._wrapper = function (e) {
      if (
        // no bubbling, should always fire.
        // this is just a safety net in case event.timeStamp is unreliable in
        // certain weird environments...
        e.target === e.currentTarget ||
        // event is fired after handler attachment
        e.timeStamp >= attachedTimestamp ||
        // bail for environments that have buggy event.timeStamp implementations
        // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
        // #9681 QtWebEngine event.timeStamp is negative value
        e.timeStamp <= 0 ||
        // #9448 bail if event is fired in another document in a multi-page
        // electron/nw.js app, since event.timeStamp will be using a different
        // starting reference
        e.target.ownerDocument !== document
      ) {
        return original.apply(this, arguments)
      }
    };
  }
  target$1.addEventListener(
    name,
    handler,
    supportsPassive
      ? { capture: capture, passive: passive }
      : capture
  );
}

function remove$2 (
  name,
  handler,
  capture,
  _target
) {
  (_target || target$1).removeEventListener(
    name,
    handler._wrapper || handler,
    capture
  );
}

function updateDOMListeners (oldVnode, vnode) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  normalizeEvents(on);
  updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
  target$1 = undefined;
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};

/*  */

var svgContainer;

function updateDOMProps (oldVnode, vnode) {
  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
    return
  }
  var key, cur;
  var elm = vnode.elm;
  var oldProps = oldVnode.data.domProps || {};
  var props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(props.__ob__)) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (!(key in props)) {
      elm[key] = '';
    }
  }

  for (key in props) {
    cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) { vnode.children.length = 0; }
      if (cur === oldProps[key]) { continue }
      // #6601 work around Chrome version <= 55 bug where single textNode
      // replaced by innerHTML/textContent retains its parentNode property
      if (elm.childNodes.length === 1) {
        elm.removeChild(elm.childNodes[0]);
      }
    }

    if (key === 'value' && elm.tagName !== 'PROGRESS') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      var strCur = isUndef(cur) ? '' : String(cur);
      if (shouldUpdateValue(elm, strCur)) {
        elm.value = strCur;
      }
    } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
      // IE doesn't support innerHTML for SVG elements
      svgContainer = svgContainer || document.createElement('div');
      svgContainer.innerHTML = "<svg>" + cur + "</svg>";
      var svg = svgContainer.firstChild;
      while (elm.firstChild) {
        elm.removeChild(elm.firstChild);
      }
      while (svg.firstChild) {
        elm.appendChild(svg.firstChild);
      }
    } else if (
      // skip the update if old and new VDOM state is the same.
      // `value` is handled separately because the DOM value may be temporarily
      // out of sync with VDOM state due to focus, composition and modifiers.
      // This  #4521 by skipping the unnecessary `checked` update.
      cur !== oldProps[key]
    ) {
      // some property updates can throw
      // e.g. `value` on <progress> w/ non-finite value
      try {
        elm[key] = cur;
      } catch (e) {}
    }
  }
}

// check platforms/web/util/attrs.js acceptValue


function shouldUpdateValue (elm, checkVal) {
  return (!elm.composing && (
    elm.tagName === 'OPTION' ||
    isNotInFocusAndDirty(elm, checkVal) ||
    isDirtyWithModifiers(elm, checkVal)
  ))
}

function isNotInFocusAndDirty (elm, checkVal) {
  // return true when textbox (.number and .trim) loses focus and its value is
  // not equal to the updated value
  var notInFocus = true;
  // #6157
  // work around IE bug when accessing document.activeElement in an iframe
  try { notInFocus = document.activeElement !== elm; } catch (e) {}
  return notInFocus && elm.value !== checkVal
}

function isDirtyWithModifiers (elm, newVal) {
  var value = elm.value;
  var modifiers = elm._vModifiers; // injected by v-model runtime
  if (isDef(modifiers)) {
    if (modifiers.number) {
      return toNumber(value) !== toNumber(newVal)
    }
    if (modifiers.trim) {
      return value.trim() !== newVal.trim()
    }
  }
  return value !== newVal
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};

/*  */

var parseStyleText = cached(function (cssText) {
  var res = {};
  var listDelimiter = /;(?![^(]*\))/g;
  var propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res
});

// merge static and dynamic style data on the same vnode
function normalizeStyleData (data) {
  var style = normalizeStyleBinding(data.style);
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle
    ? extend(data.staticStyle, style)
    : style
}

// normalize possible array / string values into Object
function normalizeStyleBinding (bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
function getStyle (vnode, checkChild) {
  var res = {};
  var styleData;

  if (checkChild) {
    var childNode = vnode;
    while (childNode.componentInstance) {
      childNode = childNode.componentInstance._vnode;
      if (
        childNode && childNode.data &&
        (styleData = normalizeStyleData(childNode.data))
      ) {
        extend(res, styleData);
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData);
  }

  var parentNode = vnode;
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res
}

/*  */

var cssVarRE = /^--/;
var importantRE = /\s*!important$/;
var setProp = function (el, name, val) {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
  } else {
    var normalizedName = normalize(name);
    if (Array.isArray(val)) {
      // Support values array created by autoprefixer, e.g.
      // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
      // Set them one by one, and the browser will only set those it can recognize
      for (var i = 0, len = val.length; i < len; i++) {
        el.style[normalizedName] = val[i];
      }
    } else {
      el.style[normalizedName] = val;
    }
  }
};

var vendorNames = ['Webkit', 'Moz', 'ms'];

var emptyStyle;
var normalize = cached(function (prop) {
  emptyStyle = emptyStyle || document.createElement('div').style;
  prop = camelize(prop);
  if (prop !== 'filter' && (prop in emptyStyle)) {
    return prop
  }
  var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (var i = 0; i < vendorNames.length; i++) {
    var name = vendorNames[i] + capName;
    if (name in emptyStyle) {
      return name
    }
  }
});

function updateStyle (oldVnode, vnode) {
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (isUndef(data.staticStyle) && isUndef(data.style) &&
    isUndef(oldData.staticStyle) && isUndef(oldData.style)
  ) {
    return
  }

  var cur, name;
  var el = vnode.elm;
  var oldStaticStyle = oldData.staticStyle;
  var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
  var oldStyle = oldStaticStyle || oldStyleBinding;

  var style = normalizeStyleBinding(vnode.data.style) || {};

  // store normalized style under a different key for next diff
  // make sure to clone it if it's reactive, since the user likely wants
  // to mutate it.
  vnode.data.normalizedStyle = isDef(style.__ob__)
    ? extend({}, style)
    : style;

  var newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (isUndef(newStyle[name])) {
      setProp(el, name, '');
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
};

/*  */

var whitespaceRE = /\s+/;

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) { return el.classList.add(c); });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) { return el.classList.remove(c); });
    } else {
      el.classList.remove(cls);
    }
    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    cur = cur.trim();
    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
}

/*  */

function resolveTransition (def$$1) {
  if (!def$$1) {
    return
  }
  /* istanbul ignore else */
  if (typeof def$$1 === 'object') {
    var res = {};
    if (def$$1.css !== false) {
      extend(res, autoCssTransition(def$$1.name || 'v'));
    }
    extend(res, def$$1);
    return res
  } else if (typeof def$$1 === 'string') {
    return autoCssTransition(def$$1)
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: (name + "-enter"),
    enterToClass: (name + "-enter-to"),
    enterActiveClass: (name + "-enter-active"),
    leaveClass: (name + "-leave"),
    leaveToClass: (name + "-leave-to"),
    leaveActiveClass: (name + "-leave-active")
  }
});

var hasTransition = inBrowser && !isIE9;
var TRANSITION = 'transition';
var ANIMATION = 'animation';

// Transition property/event sniffing
var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var animationProp = 'animation';
var animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  ) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  ) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

// binding to window is necessary to make hot reload work in IE in strict mode
var raf = inBrowser
  ? window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout
  : /* istanbul ignore next */ function (fn) { return fn(); };

function nextFrame (fn) {
  raf(function () {
    raf(fn);
  });
}

function addTransitionClass (el, cls) {
  var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls);
    addClass(el, cls);
  }
}

function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;
  if (!type) { return cb() }
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  var ended = 0;
  var end = function () {
    el.removeEventListener(event, onEnd);
    cb();
  };
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };
  setTimeout(function () {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo (el, expectedType) {
  var styles = window.getComputedStyle(el);
  // JSDOM may return undefined for transition properties
  var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
  var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
  var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
  var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);

  var type;
  var timeout = 0;
  var propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null;
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0;
  }
  var hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property']);
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  }
}

function getTimeout (delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i])
  }))
}

// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
function toMs (s) {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000
}

/*  */

function enter (vnode, toggleDisplay) {
  var el = vnode.elm;

  // call leave callback now
  if (isDef(el._leaveCb)) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data)) {
    return
  }

  /* istanbul ignore if */
  if (isDef(el._enterCb) || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterToClass = data.enterToClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearToClass = data.appearToClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;
  var duration = data.duration;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  var context = activeInstance;
  var transitionNode = activeInstance.$vnode;
  while (transitionNode && transitionNode.parent) {
    context = transitionNode.context;
    transitionNode = transitionNode.parent;
  }

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return
  }

  var startClass = isAppear && appearClass
    ? appearClass
    : enterClass;
  var activeClass = isAppear && appearActiveClass
    ? appearActiveClass
    : enterActiveClass;
  var toClass = isAppear && appearToClass
    ? appearToClass
    : enterToClass;

  var beforeEnterHook = isAppear
    ? (beforeAppear || beforeEnter)
    : beforeEnter;
  var enterHook = isAppear
    ? (typeof appear === 'function' ? appear : enter)
    : enter;
  var afterEnterHook = isAppear
    ? (afterAppear || afterEnter)
    : afterEnter;
  var enterCancelledHook = isAppear
    ? (appearCancelled || enterCancelled)
    : enterCancelled;

  var explicitEnterDuration = toNumber(
    isObject(duration)
      ? duration.enter
      : duration
  );

  if ( true && explicitEnterDuration != null) {
    checkDuration(explicitEnterDuration, 'enter', vnode);
  }

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(enterHook);

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode, 'insert', function () {
      var parent = el.parentNode;
      var pendingNode = parent && parent._pending && parent._pending[vnode.key];
      if (pendingNode &&
        pendingNode.tag === vnode.tag &&
        pendingNode.elm._leaveCb
      ) {
        pendingNode.elm._leaveCb();
      }
      enterHook && enterHook(el, cb);
    });
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      removeTransitionClass(el, startClass);
      if (!cb.cancelled) {
        addTransitionClass(el, toClass);
        if (!userWantsControl) {
          if (isValidDuration(explicitEnterDuration)) {
            setTimeout(cb, explicitEnterDuration);
          } else {
            whenTransitionEnds(el, type, cb);
          }
        }
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave (vnode, rm) {
  var el = vnode.elm;

  // call enter callback now
  if (isDef(el._enterCb)) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data) || el.nodeType !== 1) {
    return rm()
  }

  /* istanbul ignore if */
  if (isDef(el._leaveCb)) {
    return
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveToClass = data.leaveToClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;
  var duration = data.duration;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(leave);

  var explicitLeaveDuration = toNumber(
    isObject(duration)
      ? duration.leave
      : duration
  );

  if ( true && isDef(explicitLeaveDuration)) {
    checkDuration(explicitLeaveDuration, 'leave', vnode);
  }

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show && el.parentNode) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled) {
          addTransitionClass(el, leaveToClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitLeaveDuration)) {
              setTimeout(cb, explicitLeaveDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

// only used in dev mode
function checkDuration (val, name, vnode) {
  if (typeof val !== 'number') {
    warn(
      "<transition> explicit " + name + " duration is not a valid number - " +
      "got " + (JSON.stringify(val)) + ".",
      vnode.context
    );
  } else if (isNaN(val)) {
    warn(
      "<transition> explicit " + name + " duration is NaN - " +
      'the duration expression might be incorrect.',
      vnode.context
    );
  }
}

function isValidDuration (val) {
  return typeof val === 'number' && !isNaN(val)
}

/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */
function getHookArgumentsLength (fn) {
  if (isUndef(fn)) {
    return false
  }
  var invokerFns = fn.fns;
  if (isDef(invokerFns)) {
    // invoker
    return getHookArgumentsLength(
      Array.isArray(invokerFns)
        ? invokerFns[0]
        : invokerFns
    )
  } else {
    return (fn._length || fn.length) > 1
  }
}

function _enter (_, vnode) {
  if (vnode.data.show !== true) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove: function remove$$1 (vnode, rm) {
    /* istanbul ignore else */
    if (vnode.data.show !== true) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

var platformModules = [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
var modules = platformModules.concat(baseModules);

var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

var directive = {
  inserted: function inserted (el, binding, vnode, oldVnode) {
    if (vnode.tag === 'select') {
      // #6903
      if (oldVnode.elm && !oldVnode.elm._vOptions) {
        mergeVNodeHook(vnode, 'postpatch', function () {
          directive.componentUpdated(el, binding, vnode);
        });
      } else {
        setSelected(el, binding, vnode.context);
      }
      el._vOptions = [].map.call(el.options, getValue);
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers;
      if (!binding.modifiers.lazy) {
        el.addEventListener('compositionstart', onCompositionStart);
        el.addEventListener('compositionend', onCompositionEnd);
        // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.
        el.addEventListener('change', onCompositionEnd);
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true;
        }
      }
    }
  },

  componentUpdated: function componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      var prevOptions = el._vOptions;
      var curOptions = el._vOptions = [].map.call(el.options, getValue);
      if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
        // trigger change event if
        // no matching option found for at least one value
        var needReset = el.multiple
          ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
          : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
        if (needReset) {
          trigger(el, 'change');
        }
      }
    }
  }
};

function setSelected (el, binding, vm) {
  actuallySetSelected(el, binding, vm);
  /* istanbul ignore if */
  if (isIE || isEdge) {
    setTimeout(function () {
      actuallySetSelected(el, binding, vm);
    }, 0);
  }
}

function actuallySetSelected (el, binding, vm) {
  var value = binding.value;
  var isMultiple = el.multiple;
  if (isMultiple && !Array.isArray(value)) {
     true && warn(
      "<select multiple v-model=\"" + (binding.expression) + "\"> " +
      "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
      vm
    );
    return
  }
  var selected, option;
  for (var i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;
      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

function hasNoMatchingOption (value, options) {
  return options.every(function (o) { return !looseEqual(o, value); })
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
}

function onCompositionStart (e) {
  e.target.composing = true;
}

function onCompositionEnd (e) {
  // prevent triggering an input event for no reason
  if (!e.target.composing) { return }
  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger (el, type) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode (vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.componentInstance._vnode)
    : vnode
}

var show = {
  bind: function bind (el, ref, vnode) {
    var value = ref.value;

    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    var originalDisplay = el.__vOriginalDisplay =
      el.style.display === 'none' ? '' : el.style.display;
    if (value && transition$$1) {
      vnode.data.show = true;
      enter(vnode, function () {
        el.style.display = originalDisplay;
      });
    } else {
      el.style.display = value ? originalDisplay : 'none';
    }
  },

  update: function update (el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;

    /* istanbul ignore if */
    if (!value === !oldValue) { return }
    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    if (transition$$1) {
      vnode.data.show = true;
      if (value) {
        enter(vnode, function () {
          el.style.display = el.__vOriginalDisplay;
        });
      } else {
        leave(vnode, function () {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  },

  unbind: function unbind (
    el,
    binding,
    vnode,
    oldVnode,
    isDestroy
  ) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  }
};

var platformDirectives = {
  model: directive,
  show: show
};

/*  */

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners;
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1];
  }
  return data
}

function placeholder (h, rawChild) {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    })
  }
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

function isSameChild (child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

var isNotTextNode = function (c) { return c.tag || isAsyncPlaceholder(c); };

var isVShowDirective = function (d) { return d.name === 'show'; };

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,

  render: function render (h) {
    var this$1 = this;

    var children = this.$slots.default;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(isNotTextNode);
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if ( true && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      );
    }

    var mode = this.mode;

    // warn invalid mode
    if ( true &&
      mode && mode !== 'in-out' && mode !== 'out-in'
    ) {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      );
    }

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
    var id = "__transition-" + (this._uid) + "-";
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key;

    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(isVShowDirective)) {
      child.data.show = true;
    }

    if (
      oldChild &&
      oldChild.data &&
      !isSameChild(child, oldChild) &&
      !isAsyncPlaceholder(oldChild) &&
      // #6687 component root is a comment node
      !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
    ) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild.data.transition = extend({}, data);
      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false;
          this$1.$forceUpdate();
        });
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        if (isAsyncPlaceholder(child)) {
          return oldRawChild
        }
        var delayedLeave;
        var performLeave = function () { delayedLeave(); };
        mergeVNodeHook(data, 'afterEnter', performLeave);
        mergeVNodeHook(data, 'enterCancelled', performLeave);
        mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
      }
    }

    return rawChild
  }
};

/*  */

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props: props,

  beforeMount: function beforeMount () {
    var this$1 = this;

    var update = this._update;
    this._update = function (vnode, hydrating) {
      var restoreActiveInstance = setActiveInstance(this$1);
      // force removing pass
      this$1.__patch__(
        this$1._vnode,
        this$1.kept,
        false, // hydrating
        true // removeOnly (!important, avoids unnecessary moves)
      );
      this$1._vnode = this$1.kept;
      restoreActiveInstance();
      update.call(this$1, vnode, hydrating);
    };
  },

  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var map = Object.create(null);
    var prevChildren = this.prevChildren = this.children;
    var rawChildren = this.$slots.default || [];
    var children = this.children = [];
    var transitionData = extractTransitionData(this);

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i];
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData;
        } else if (true) {
          var opts = c.componentOptions;
          var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
          warn(("<transition-group> children must be keyed: <" + name + ">"));
        }
      }
    }

    if (prevChildren) {
      var kept = [];
      var removed = [];
      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1];
        c$1.data.transition = transitionData;
        c$1.data.pos = c$1.elm.getBoundingClientRect();
        if (map[c$1.key]) {
          kept.push(c$1);
        } else {
          removed.push(c$1);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children)
  },

  updated: function updated () {
    var children = this.prevChildren;
    var moveClass = this.moveClass || ((this.name || 'v') + '-move');
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation);

    // force reflow to put everything in position
    // assign to this to avoid being removed in tree-shaking
    // $flow-disable-line
    this._reflow = document.body.offsetHeight;

    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm;
        var s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (e && e.target !== el) {
            return
          }
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },

  methods: {
    hasMove: function hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      /* istanbul ignore if */
      if (this._hasMove) {
        return this._hasMove
      }
      // Detect whether an element with the move class applied has
      // CSS transitions. Since the element may be inside an entering
      // transition at this very moment, we make a clone of it and remove
      // all other transition classes applied to ensure only the move class
      // is applied.
      var clone = el.cloneNode();
      if (el._transitionClasses) {
        el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
      }
      addClass(clone, moveClass);
      clone.style.display = 'none';
      this.$el.appendChild(clone);
      var info = getTransitionInfo(clone);
      this.$el.removeChild(clone);
      return (this._hasMove = info.hasTransform)
    }
  }
};

function callPendingCbs (c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition (c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation (c) {
  var oldPos = c.data.pos;
  var newPos = c.data.newPos;
  var dx = oldPos.left - newPos.left;
  var dy = oldPos.top - newPos.top;
  if (dx || dy) {
    c.data.moved = true;
    var s = c.elm.style;
    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
    s.transitionDuration = '0s';
  }
}

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
};

/*  */

// install platform specific utils
Vue.config.mustUseProp = mustUseProp;
Vue.config.isReservedTag = isReservedTag;
Vue.config.isReservedAttr = isReservedAttr;
Vue.config.getTagNamespace = getTagNamespace;
Vue.config.isUnknownElement = isUnknownElement;

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives);
extend(Vue.options.components, platformComponents);

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
Vue.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating)
};

// devtools global hook
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(function () {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue);
      } else if (
        true
      ) {
        console[console.info ? 'info' : 'log'](
          'Download the Vue Devtools extension for a better development experience:\n' +
          'https://github.com/vuejs/vue-devtools'
        );
      }
    }
    if ( true &&
      config.productionTip !== false &&
      typeof console !== 'undefined'
    ) {
      console[console.info ? 'info' : 'log'](
        "You are running Vue in development mode.\n" +
        "Make sure to turn on production mode when deploying for production.\n" +
        "See more tips at https://vuejs.org/guide/deployment.html"
      );
    }
  }, 0);
}

/*  */

var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

var buildRegex = cached(function (delimiters) {
  var open = delimiters[0].replace(regexEscapeRE, '\\$&');
  var close = delimiters[1].replace(regexEscapeRE, '\\$&');
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
});



function parseText (
  text,
  delimiters
) {
  var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return
  }
  var tokens = [];
  var rawTokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index, tokenValue;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index));
      tokens.push(JSON.stringify(tokenValue));
    }
    // tag token
    var exp = parseFilters(match[1].trim());
    tokens.push(("_s(" + exp + ")"));
    rawTokens.push({ '@binding': exp });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex));
    tokens.push(JSON.stringify(tokenValue));
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}

/*  */

function transformNode (el, options) {
  var warn = options.warn || baseWarn;
  var staticClass = getAndRemoveAttr(el, 'class');
  if ( true && staticClass) {
    var res = parseText(staticClass, options.delimiters);
    if (res) {
      warn(
        "class=\"" + staticClass + "\": " +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div class="{{ val }}">, use <div :class="val">.',
        el.rawAttrsMap['class']
      );
    }
  }
  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass);
  }
  var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
  if (classBinding) {
    el.classBinding = classBinding;
  }
}

function genData (el) {
  var data = '';
  if (el.staticClass) {
    data += "staticClass:" + (el.staticClass) + ",";
  }
  if (el.classBinding) {
    data += "class:" + (el.classBinding) + ",";
  }
  return data
}

var klass$1 = {
  staticKeys: ['staticClass'],
  transformNode: transformNode,
  genData: genData
};

/*  */

function transformNode$1 (el, options) {
  var warn = options.warn || baseWarn;
  var staticStyle = getAndRemoveAttr(el, 'style');
  if (staticStyle) {
    /* istanbul ignore if */
    if (true) {
      var res = parseText(staticStyle, options.delimiters);
      if (res) {
        warn(
          "style=\"" + staticStyle + "\": " +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div style="{{ val }}">, use <div :style="val">.',
          el.rawAttrsMap['style']
        );
      }
    }
    el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
  }

  var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
  if (styleBinding) {
    el.styleBinding = styleBinding;
  }
}

function genData$1 (el) {
  var data = '';
  if (el.staticStyle) {
    data += "staticStyle:" + (el.staticStyle) + ",";
  }
  if (el.styleBinding) {
    data += "style:(" + (el.styleBinding) + "),";
  }
  return data
}

var style$1 = {
  staticKeys: ['staticStyle'],
  transformNode: transformNode$1,
  genData: genData$1
};

/*  */

var decoder;

var he = {
  decode: function decode (html) {
    decoder = decoder || document.createElement('div');
    decoder.innerHTML = html;
    return decoder.textContent
  }
};

/*  */

var isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
);

// Elements that you can, intentionally, leave open
// (and which close themselves)
var canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
);

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
var isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track'
);

/**
 * Not type-checking this file because it's mostly vendor code.
 */

// Regular Expressions for parsing tags and attributes
var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
var dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + (unicodeRegExp.source) + "]*";
var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
var startTagOpen = new RegExp(("^<" + qnameCapture));
var startTagClose = /^\s*(\/?)>/;
var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
var doctype = /^<!DOCTYPE [^>]+>/i;
// #7298: escape - to avoid being passed as HTML comment when inlined in page
var comment = /^<!\--/;
var conditionalComment = /^<!\[/;

// Special Elements (can contain anything)
var isPlainTextElement = makeMap('script,style,textarea', true);
var reCache = {};

var decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t',
  '&#39;': "'"
};
var encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;

// #5992
var isIgnoreNewlineTag = makeMap('pre,textarea', true);
var shouldIgnoreFirstNewline = function (tag, html) { return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; };

function decodeAttr (value, shouldDecodeNewlines) {
  var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
  return value.replace(re, function (match) { return decodingMap[match]; })
}

function parseHTML (html, options) {
  var stack = [];
  var expectHTML = options.expectHTML;
  var isUnaryTag$$1 = options.isUnaryTag || no;
  var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
  var index = 0;
  var last, lastTag;
  while (html) {
    last = html;
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      var textEnd = html.indexOf('<');
      if (textEnd === 0) {
        // Comment:
        if (comment.test(html)) {
          var commentEnd = html.indexOf('-->');

          if (commentEnd >= 0) {
            if (options.shouldKeepComment) {
              options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
            }
            advance(commentEnd + 3);
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (conditionalComment.test(html)) {
          var conditionalEnd = html.indexOf(']>');

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2);
            continue
          }
        }

        // Doctype:
        var doctypeMatch = html.match(doctype);
        if (doctypeMatch) {
          advance(doctypeMatch[0].length);
          continue
        }

        // End tag:
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          var curIndex = index;
          advance(endTagMatch[0].length);
          parseEndTag(endTagMatch[1], curIndex, index);
          continue
        }

        // Start tag:
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          handleStartTag(startTagMatch);
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1);
          }
          continue
        }
      }

      var text = (void 0), rest = (void 0), next = (void 0);
      if (textEnd >= 0) {
        rest = html.slice(textEnd);
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // < in plain text, be forgiving and treat it as text
          next = rest.indexOf('<', 1);
          if (next < 0) { break }
          textEnd += next;
          rest = html.slice(textEnd);
        }
        text = html.substring(0, textEnd);
      }

      if (textEnd < 0) {
        text = html;
      }

      if (text) {
        advance(text.length);
      }

      if (options.chars && text) {
        options.chars(text, index - text.length, index);
      }
    } else {
      var endTagLength = 0;
      var stackedTag = lastTag.toLowerCase();
      var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
      var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length;
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1);
        }
        if (options.chars) {
          options.chars(text);
        }
        return ''
      });
      index += html.length - rest$1.length;
      html = rest$1;
      parseEndTag(stackedTag, index - endTagLength, index);
    }

    if (html === last) {
      options.chars && options.chars(html);
      if ( true && !stack.length && options.warn) {
        options.warn(("Mal-formatted tag at end of template: \"" + html + "\""), { start: index + html.length });
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag();

  function advance (n) {
    index += n;
    html = html.substring(n);
  }

  function parseStartTag () {
    var start = html.match(startTagOpen);
    if (start) {
      var match = {
        tagName: start[1],
        attrs: [],
        start: index
      };
      advance(start[0].length);
      var end, attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
        attr.start = index;
        advance(attr[0].length);
        attr.end = index;
        match.attrs.push(attr);
      }
      if (end) {
        match.unarySlash = end[1];
        advance(end[0].length);
        match.end = index;
        return match
      }
    }
  }

  function handleStartTag (match) {
    var tagName = match.tagName;
    var unarySlash = match.unarySlash;

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag);
      }
      if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
        parseEndTag(tagName);
      }
    }

    var unary = isUnaryTag$$1(tagName) || !!unarySlash;

    var l = match.attrs.length;
    var attrs = new Array(l);
    for (var i = 0; i < l; i++) {
      var args = match.attrs[i];
      var value = args[3] || args[4] || args[5] || '';
      var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
        ? options.shouldDecodeNewlinesForHref
        : options.shouldDecodeNewlines;
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      };
      if ( true && options.outputSourceRange) {
        attrs[i].start = args.start + args[0].match(/^\s*/).length;
        attrs[i].end = args.end;
      }
    }

    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end });
      lastTag = tagName;
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
    }
  }

  function parseEndTag (tagName, start, end) {
    var pos, lowerCasedTagName;
    if (start == null) { start = index; }
    if (end == null) { end = index; }

    // Find the closest opened tag of the same type
    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase();
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0;
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (var i = stack.length - 1; i >= pos; i--) {
        if ( true &&
          (i > pos || !tagName) &&
          options.warn
        ) {
          options.warn(
            ("tag <" + (stack[i].tag) + "> has no matching end tag."),
            { start: stack[i].start, end: stack[i].end }
          );
        }
        if (options.end) {
          options.end(stack[i].tag, start, end);
        }
      }

      // Remove the open elements from the stack
      stack.length = pos;
      lastTag = pos && stack[pos - 1].tag;
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end);
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end);
      }
      if (options.end) {
        options.end(tagName, start, end);
      }
    }
  }
}

/*  */

var onRE = /^@|^v-on:/;
var dirRE = /^v-|^@|^:|^#/;
var forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
var forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
var stripParensRE = /^\(|\)$/g;
var dynamicArgRE = /^\[.*\]$/;

var argRE = /:(.*)$/;
var bindRE = /^:|^\.|^v-bind:/;
var modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;

var slotRE = /^v-slot(:|$)|^#/;

var lineBreakRE = /[\r\n]/;
var whitespaceRE$1 = /[ \f\t\r\n]+/g;

var invalidAttributeRE = /[\s"'<>\/=]/;

var decodeHTMLCached = cached(he.decode);

var emptySlotScopeToken = "_empty_";

// configurable state
var warn$2;
var delimiters;
var transforms;
var preTransforms;
var postTransforms;
var platformIsPreTag;
var platformMustUseProp;
var platformGetTagNamespace;
var maybeComponent;

function createASTElement (
  tag,
  attrs,
  parent
) {
  return {
    type: 1,
    tag: tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    rawAttrsMap: {},
    parent: parent,
    children: []
  }
}

/**
 * Convert HTML string to AST.
 */
function parse (
  template,
  options
) {
  warn$2 = options.warn || baseWarn;

  platformIsPreTag = options.isPreTag || no;
  platformMustUseProp = options.mustUseProp || no;
  platformGetTagNamespace = options.getTagNamespace || no;
  var isReservedTag = options.isReservedTag || no;
  maybeComponent = function (el) { return !!(
    el.component ||
    el.attrsMap[':is'] ||
    el.attrsMap['v-bind:is'] ||
    !(el.attrsMap.is ? isReservedTag(el.attrsMap.is) : isReservedTag(el.tag))
  ); };
  transforms = pluckModuleFunction(options.modules, 'transformNode');
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

  delimiters = options.delimiters;

  var stack = [];
  var preserveWhitespace = options.preserveWhitespace !== false;
  var whitespaceOption = options.whitespace;
  var root;
  var currentParent;
  var inVPre = false;
  var inPre = false;
  var warned = false;

  function warnOnce (msg, range) {
    if (!warned) {
      warned = true;
      warn$2(msg, range);
    }
  }

  function closeElement (element) {
    trimEndingWhitespace(element);
    if (!inVPre && !element.processed) {
      element = processElement(element, options);
    }
    // tree management
    if (!stack.length && element !== root) {
      // allow root elements with v-if, v-else-if and v-else
      if (root.if && (element.elseif || element.else)) {
        if (true) {
          checkRootConstraints(element);
        }
        addIfCondition(root, {
          exp: element.elseif,
          block: element
        });
      } else if (true) {
        warnOnce(
          "Component template should contain exactly one root element. " +
          "If you are using v-if on multiple elements, " +
          "use v-else-if to chain them instead.",
          { start: element.start }
        );
      }
    }
    if (currentParent && !element.forbidden) {
      if (element.elseif || element.else) {
        processIfConditions(element, currentParent);
      } else {
        if (element.slotScope) {
          // scoped slot
          // keep it in the children list so that v-else(-if) conditions can
          // find it as the prev node.
          var name = element.slotTarget || '"default"'
          ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
        }
        currentParent.children.push(element);
        element.parent = currentParent;
      }
    }

    // final children cleanup
    // filter out scoped slots
    element.children = element.children.filter(function (c) { return !(c).slotScope; });
    // remove trailing whitespace node again
    trimEndingWhitespace(element);

    // check pre state
    if (element.pre) {
      inVPre = false;
    }
    if (platformIsPreTag(element.tag)) {
      inPre = false;
    }
    // apply post-transforms
    for (var i = 0; i < postTransforms.length; i++) {
      postTransforms[i](element, options);
    }
  }

  function trimEndingWhitespace (el) {
    // remove trailing whitespace node
    if (!inPre) {
      var lastNode;
      while (
        (lastNode = el.children[el.children.length - 1]) &&
        lastNode.type === 3 &&
        lastNode.text === ' '
      ) {
        el.children.pop();
      }
    }
  }

  function checkRootConstraints (el) {
    if (el.tag === 'slot' || el.tag === 'template') {
      warnOnce(
        "Cannot use <" + (el.tag) + "> as component root element because it may " +
        'contain multiple nodes.',
        { start: el.start }
      );
    }
    if (el.attrsMap.hasOwnProperty('v-for')) {
      warnOnce(
        'Cannot use v-for on stateful component root element because ' +
        'it renders multiple elements.',
        el.rawAttrsMap['v-for']
      );
    }
  }

  parseHTML(template, {
    warn: warn$2,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    outputSourceRange: options.outputSourceRange,
    start: function start (tag, attrs, unary, start$1, end) {
      // check namespace.
      // inherit parent ns if there is one
      var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

      // handle IE svg bug
      /* istanbul ignore if */
      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs);
      }

      var element = createASTElement(tag, attrs, currentParent);
      if (ns) {
        element.ns = ns;
      }

      if (true) {
        if (options.outputSourceRange) {
          element.start = start$1;
          element.end = end;
          element.rawAttrsMap = element.attrsList.reduce(function (cumulated, attr) {
            cumulated[attr.name] = attr;
            return cumulated
          }, {});
        }
        attrs.forEach(function (attr) {
          if (invalidAttributeRE.test(attr.name)) {
            warn$2(
              "Invalid dynamic argument expression: attribute names cannot contain " +
              "spaces, quotes, <, >, / or =.",
              {
                start: attr.start + attr.name.indexOf("["),
                end: attr.start + attr.name.length
              }
            );
          }
        });
      }

      if (isForbiddenTag(element) && !isServerRendering()) {
        element.forbidden = true;
         true && warn$2(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          "<" + tag + ">" + ', as they will not be parsed.',
          { start: element.start }
        );
      }

      // apply pre-transforms
      for (var i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element;
      }

      if (!inVPre) {
        processPre(element);
        if (element.pre) {
          inVPre = true;
        }
      }
      if (platformIsPreTag(element.tag)) {
        inPre = true;
      }
      if (inVPre) {
        processRawAttrs(element);
      } else if (!element.processed) {
        // structural directives
        processFor(element);
        processIf(element);
        processOnce(element);
      }

      if (!root) {
        root = element;
        if (true) {
          checkRootConstraints(root);
        }
      }

      if (!unary) {
        currentParent = element;
        stack.push(element);
      } else {
        closeElement(element);
      }
    },

    end: function end (tag, start, end$1) {
      var element = stack[stack.length - 1];
      // pop stack
      stack.length -= 1;
      currentParent = stack[stack.length - 1];
      if ( true && options.outputSourceRange) {
        element.end = end$1;
      }
      closeElement(element);
    },

    chars: function chars (text, start, end) {
      if (!currentParent) {
        if (true) {
          if (text === template) {
            warnOnce(
              'Component template requires a root element, rather than just text.',
              { start: start }
            );
          } else if ((text = text.trim())) {
            warnOnce(
              ("text \"" + text + "\" outside root element will be ignored."),
              { start: start }
            );
          }
        }
        return
      }
      // IE textarea placeholder bug
      /* istanbul ignore if */
      if (isIE &&
        currentParent.tag === 'textarea' &&
        currentParent.attrsMap.placeholder === text
      ) {
        return
      }
      var children = currentParent.children;
      if (inPre || text.trim()) {
        text = isTextTag(currentParent) ? text : decodeHTMLCached(text);
      } else if (!children.length) {
        // remove the whitespace-only node right after an opening tag
        text = '';
      } else if (whitespaceOption) {
        if (whitespaceOption === 'condense') {
          // in condense mode, remove the whitespace node if it contains
          // line break, otherwise condense to a single space
          text = lineBreakRE.test(text) ? '' : ' ';
        } else {
          text = ' ';
        }
      } else {
        text = preserveWhitespace ? ' ' : '';
      }
      if (text) {
        if (!inPre && whitespaceOption === 'condense') {
          // condense consecutive whitespaces into single space
          text = text.replace(whitespaceRE$1, ' ');
        }
        var res;
        var child;
        if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
          child = {
            type: 2,
            expression: res.expression,
            tokens: res.tokens,
            text: text
          };
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          child = {
            type: 3,
            text: text
          };
        }
        if (child) {
          if ( true && options.outputSourceRange) {
            child.start = start;
            child.end = end;
          }
          children.push(child);
        }
      }
    },
    comment: function comment (text, start, end) {
      // adding anything as a sibling to the root node is forbidden
      // comments should still be allowed, but ignored
      if (currentParent) {
        var child = {
          type: 3,
          text: text,
          isComment: true
        };
        if ( true && options.outputSourceRange) {
          child.start = start;
          child.end = end;
        }
        currentParent.children.push(child);
      }
    }
  });
  return root
}

function processPre (el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true;
  }
}

function processRawAttrs (el) {
  var list = el.attrsList;
  var len = list.length;
  if (len) {
    var attrs = el.attrs = new Array(len);
    for (var i = 0; i < len; i++) {
      attrs[i] = {
        name: list[i].name,
        value: JSON.stringify(list[i].value)
      };
      if (list[i].start != null) {
        attrs[i].start = list[i].start;
        attrs[i].end = list[i].end;
      }
    }
  } else if (!el.pre) {
    // non root node in pre blocks with no attributes
    el.plain = true;
  }
}

function processElement (
  element,
  options
) {
  processKey(element);

  // determine whether this is a plain element after
  // removing structural attributes
  element.plain = (
    !element.key &&
    !element.scopedSlots &&
    !element.attrsList.length
  );

  processRef(element);
  processSlotContent(element);
  processSlotOutlet(element);
  processComponent(element);
  for (var i = 0; i < transforms.length; i++) {
    element = transforms[i](element, options) || element;
  }
  processAttrs(element);
  return element
}

function processKey (el) {
  var exp = getBindingAttr(el, 'key');
  if (exp) {
    if (true) {
      if (el.tag === 'template') {
        warn$2(
          "<template> cannot be keyed. Place the key on real elements instead.",
          getRawBindingAttr(el, 'key')
        );
      }
      if (el.for) {
        var iterator = el.iterator2 || el.iterator1;
        var parent = el.parent;
        if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
          warn$2(
            "Do not use v-for index as key on <transition-group> children, " +
            "this is the same as not using keys.",
            getRawBindingAttr(el, 'key'),
            true /* tip */
          );
        }
      }
    }
    el.key = exp;
  }
}

function processRef (el) {
  var ref = getBindingAttr(el, 'ref');
  if (ref) {
    el.ref = ref;
    el.refInFor = checkInFor(el);
  }
}

function processFor (el) {
  var exp;
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    var res = parseFor(exp);
    if (res) {
      extend(el, res);
    } else if (true) {
      warn$2(
        ("Invalid v-for expression: " + exp),
        el.rawAttrsMap['v-for']
      );
    }
  }
}



function parseFor (exp) {
  var inMatch = exp.match(forAliasRE);
  if (!inMatch) { return }
  var res = {};
  res.for = inMatch[2].trim();
  var alias = inMatch[1].trim().replace(stripParensRE, '');
  var iteratorMatch = alias.match(forIteratorRE);
  if (iteratorMatch) {
    res.alias = alias.replace(forIteratorRE, '').trim();
    res.iterator1 = iteratorMatch[1].trim();
    if (iteratorMatch[2]) {
      res.iterator2 = iteratorMatch[2].trim();
    }
  } else {
    res.alias = alias;
  }
  return res
}

function processIf (el) {
  var exp = getAndRemoveAttr(el, 'v-if');
  if (exp) {
    el.if = exp;
    addIfCondition(el, {
      exp: exp,
      block: el
    });
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true;
    }
    var elseif = getAndRemoveAttr(el, 'v-else-if');
    if (elseif) {
      el.elseif = elseif;
    }
  }
}

function processIfConditions (el, parent) {
  var prev = findPrevElement(parent.children);
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    });
  } else if (true) {
    warn$2(
      "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
      "used on element <" + (el.tag) + "> without corresponding v-if.",
      el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else']
    );
  }
}

function findPrevElement (children) {
  var i = children.length;
  while (i--) {
    if (children[i].type === 1) {
      return children[i]
    } else {
      if ( true && children[i].text !== ' ') {
        warn$2(
          "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
          "will be ignored.",
          children[i]
        );
      }
      children.pop();
    }
  }
}

function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = [];
  }
  el.ifConditions.push(condition);
}

function processOnce (el) {
  var once$$1 = getAndRemoveAttr(el, 'v-once');
  if (once$$1 != null) {
    el.once = true;
  }
}

// handle content being passed to a component as slot,
// e.g. <template slot="xxx">, <div slot-scope="xxx">
function processSlotContent (el) {
  var slotScope;
  if (el.tag === 'template') {
    slotScope = getAndRemoveAttr(el, 'scope');
    /* istanbul ignore if */
    if ( true && slotScope) {
      warn$2(
        "the \"scope\" attribute for scoped slots have been deprecated and " +
        "replaced by \"slot-scope\" since 2.5. The new \"slot-scope\" attribute " +
        "can also be used on plain elements in addition to <template> to " +
        "denote scoped slots.",
        el.rawAttrsMap['scope'],
        true
      );
    }
    el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope');
  } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
    /* istanbul ignore if */
    if ( true && el.attrsMap['v-for']) {
      warn$2(
        "Ambiguous combined usage of slot-scope and v-for on <" + (el.tag) + "> " +
        "(v-for takes higher priority). Use a wrapper <template> for the " +
        "scoped slot to make it clearer.",
        el.rawAttrsMap['slot-scope'],
        true
      );
    }
    el.slotScope = slotScope;
  }

  // slot="xxx"
  var slotTarget = getBindingAttr(el, 'slot');
  if (slotTarget) {
    el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
    el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot']);
    // preserve slot as an attribute for native shadow DOM compat
    // only for non-scoped slots.
    if (el.tag !== 'template' && !el.slotScope) {
      addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'));
    }
  }

  // 2.6 v-slot syntax
  {
    if (el.tag === 'template') {
      // v-slot on <template>
      var slotBinding = getAndRemoveAttrByRegex(el, slotRE);
      if (slotBinding) {
        if (true) {
          if (el.slotTarget || el.slotScope) {
            warn$2(
              "Unexpected mixed usage of different slot syntaxes.",
              el
            );
          }
          if (el.parent && !maybeComponent(el.parent)) {
            warn$2(
              "<template v-slot> can only appear at the root level inside " +
              "the receiving component",
              el
            );
          }
        }
        var ref = getSlotName(slotBinding);
        var name = ref.name;
        var dynamic = ref.dynamic;
        el.slotTarget = name;
        el.slotTargetDynamic = dynamic;
        el.slotScope = slotBinding.value || emptySlotScopeToken; // force it into a scoped slot for perf
      }
    } else {
      // v-slot on component, denotes default slot
      var slotBinding$1 = getAndRemoveAttrByRegex(el, slotRE);
      if (slotBinding$1) {
        if (true) {
          if (!maybeComponent(el)) {
            warn$2(
              "v-slot can only be used on components or <template>.",
              slotBinding$1
            );
          }
          if (el.slotScope || el.slotTarget) {
            warn$2(
              "Unexpected mixed usage of different slot syntaxes.",
              el
            );
          }
          if (el.scopedSlots) {
            warn$2(
              "To avoid scope ambiguity, the default slot should also use " +
              "<template> syntax when there are other named slots.",
              slotBinding$1
            );
          }
        }
        // add the component's children to its default slot
        var slots = el.scopedSlots || (el.scopedSlots = {});
        var ref$1 = getSlotName(slotBinding$1);
        var name$1 = ref$1.name;
        var dynamic$1 = ref$1.dynamic;
        var slotContainer = slots[name$1] = createASTElement('template', [], el);
        slotContainer.slotTarget = name$1;
        slotContainer.slotTargetDynamic = dynamic$1;
        slotContainer.children = el.children.filter(function (c) {
          if (!c.slotScope) {
            c.parent = slotContainer;
            return true
          }
        });
        slotContainer.slotScope = slotBinding$1.value || emptySlotScopeToken;
        // remove children as they are returned from scopedSlots now
        el.children = [];
        // mark el non-plain so data gets generated
        el.plain = false;
      }
    }
  }
}

function getSlotName (binding) {
  var name = binding.name.replace(slotRE, '');
  if (!name) {
    if (binding.name[0] !== '#') {
      name = 'default';
    } else if (true) {
      warn$2(
        "v-slot shorthand syntax requires a slot name.",
        binding
      );
    }
  }
  return dynamicArgRE.test(name)
    // dynamic [name]
    ? { name: name.slice(1, -1), dynamic: true }
    // static name
    : { name: ("\"" + name + "\""), dynamic: false }
}

// handle <slot/> outlets
function processSlotOutlet (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name');
    if ( true && el.key) {
      warn$2(
        "`key` does not work on <slot> because slots are abstract outlets " +
        "and can possibly expand into multiple elements. " +
        "Use the key on a wrapping element instead.",
        getRawBindingAttr(el, 'key')
      );
    }
  }
}

function processComponent (el) {
  var binding;
  if ((binding = getBindingAttr(el, 'is'))) {
    el.component = binding;
  }
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true;
  }
}

function processAttrs (el) {
  var list = el.attrsList;
  var i, l, name, rawName, value, modifiers, syncGen, isDynamic;
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name;
    value = list[i].value;
    if (dirRE.test(name)) {
      // mark element as dynamic
      el.hasBindings = true;
      // modifiers
      modifiers = parseModifiers(name.replace(dirRE, ''));
      // support .foo shorthand syntax for the .prop modifier
      if (modifiers) {
        name = name.replace(modifierRE, '');
      }
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '');
        value = parseFilters(value);
        isDynamic = dynamicArgRE.test(name);
        if (isDynamic) {
          name = name.slice(1, -1);
        }
        if (
           true &&
          value.trim().length === 0
        ) {
          warn$2(
            ("The value for a v-bind expression cannot be empty. Found in \"v-bind:" + name + "\"")
          );
        }
        if (modifiers) {
          if (modifiers.prop && !isDynamic) {
            name = camelize(name);
            if (name === 'innerHtml') { name = 'innerHTML'; }
          }
          if (modifiers.camel && !isDynamic) {
            name = camelize(name);
          }
          if (modifiers.sync) {
            syncGen = genAssignmentCode(value, "$event");
            if (!isDynamic) {
              addHandler(
                el,
                ("update:" + (camelize(name))),
                syncGen,
                null,
                false,
                warn$2,
                list[i]
              );
              if (hyphenate(name) !== camelize(name)) {
                addHandler(
                  el,
                  ("update:" + (hyphenate(name))),
                  syncGen,
                  null,
                  false,
                  warn$2,
                  list[i]
                );
              }
            } else {
              // handler w/ dynamic event name
              addHandler(
                el,
                ("\"update:\"+(" + name + ")"),
                syncGen,
                null,
                false,
                warn$2,
                list[i],
                true // dynamic
              );
            }
          }
        }
        if ((modifiers && modifiers.prop) || (
          !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
        )) {
          addProp(el, name, value, list[i], isDynamic);
        } else {
          addAttr(el, name, value, list[i], isDynamic);
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '');
        isDynamic = dynamicArgRE.test(name);
        if (isDynamic) {
          name = name.slice(1, -1);
        }
        addHandler(el, name, value, modifiers, false, warn$2, list[i], isDynamic);
      } else { // normal directives
        name = name.replace(dirRE, '');
        // parse arg
        var argMatch = name.match(argRE);
        var arg = argMatch && argMatch[1];
        isDynamic = false;
        if (arg) {
          name = name.slice(0, -(arg.length + 1));
          if (dynamicArgRE.test(arg)) {
            arg = arg.slice(1, -1);
            isDynamic = true;
          }
        }
        addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]);
        if ( true && name === 'model') {
          checkForAliasModel(el, value);
        }
      }
    } else {
      // literal attribute
      if (true) {
        var res = parseText(value, delimiters);
        if (res) {
          warn$2(
            name + "=\"" + value + "\": " +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div id="{{ val }}">, use <div :id="val">.',
            list[i]
          );
        }
      }
      addAttr(el, name, JSON.stringify(value), list[i]);
      // #6887 firefox doesn't update muted state if set via attribute
      // even immediately after element creation
      if (!el.component &&
          name === 'muted' &&
          platformMustUseProp(el.tag, el.attrsMap.type, name)) {
        addProp(el, name, 'true', list[i]);
      }
    }
  }
}

function checkInFor (el) {
  var parent = el;
  while (parent) {
    if (parent.for !== undefined) {
      return true
    }
    parent = parent.parent;
  }
  return false
}

function parseModifiers (name) {
  var match = name.match(modifierRE);
  if (match) {
    var ret = {};
    match.forEach(function (m) { ret[m.slice(1)] = true; });
    return ret
  }
}

function makeAttrsMap (attrs) {
  var map = {};
  for (var i = 0, l = attrs.length; i < l; i++) {
    if (
       true &&
      map[attrs[i].name] && !isIE && !isEdge
    ) {
      warn$2('duplicate attribute: ' + attrs[i].name, attrs[i]);
    }
    map[attrs[i].name] = attrs[i].value;
  }
  return map
}

// for script (e.g. type="x/template") or style, do not decode content
function isTextTag (el) {
  return el.tag === 'script' || el.tag === 'style'
}

function isForbiddenTag (el) {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}

var ieNSBug = /^xmlns:NS\d+/;
var ieNSPrefix = /^NS\d+:/;

/* istanbul ignore next */
function guardIESVGBug (attrs) {
  var res = [];
  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i];
    if (!ieNSBug.test(attr.name)) {
      attr.name = attr.name.replace(ieNSPrefix, '');
      res.push(attr);
    }
  }
  return res
}

function checkForAliasModel (el, value) {
  var _el = el;
  while (_el) {
    if (_el.for && _el.alias === value) {
      warn$2(
        "<" + (el.tag) + " v-model=\"" + value + "\">: " +
        "You are binding v-model directly to a v-for iteration alias. " +
        "This will not be able to modify the v-for source array because " +
        "writing to the alias is like modifying a function local variable. " +
        "Consider using an array of objects and use v-model on an object property instead.",
        el.rawAttrsMap['v-model']
      );
    }
    _el = _el.parent;
  }
}

/*  */

function preTransformNode (el, options) {
  if (el.tag === 'input') {
    var map = el.attrsMap;
    if (!map['v-model']) {
      return
    }

    var typeBinding;
    if (map[':type'] || map['v-bind:type']) {
      typeBinding = getBindingAttr(el, 'type');
    }
    if (!map.type && !typeBinding && map['v-bind']) {
      typeBinding = "(" + (map['v-bind']) + ").type";
    }

    if (typeBinding) {
      var ifCondition = getAndRemoveAttr(el, 'v-if', true);
      var ifConditionExtra = ifCondition ? ("&&(" + ifCondition + ")") : "";
      var hasElse = getAndRemoveAttr(el, 'v-else', true) != null;
      var elseIfCondition = getAndRemoveAttr(el, 'v-else-if', true);
      // 1. checkbox
      var branch0 = cloneASTElement(el);
      // process for on the main node
      processFor(branch0);
      addRawAttr(branch0, 'type', 'checkbox');
      processElement(branch0, options);
      branch0.processed = true; // prevent it from double-processed
      branch0.if = "(" + typeBinding + ")==='checkbox'" + ifConditionExtra;
      addIfCondition(branch0, {
        exp: branch0.if,
        block: branch0
      });
      // 2. add radio else-if condition
      var branch1 = cloneASTElement(el);
      getAndRemoveAttr(branch1, 'v-for', true);
      addRawAttr(branch1, 'type', 'radio');
      processElement(branch1, options);
      addIfCondition(branch0, {
        exp: "(" + typeBinding + ")==='radio'" + ifConditionExtra,
        block: branch1
      });
      // 3. other
      var branch2 = cloneASTElement(el);
      getAndRemoveAttr(branch2, 'v-for', true);
      addRawAttr(branch2, ':type', typeBinding);
      processElement(branch2, options);
      addIfCondition(branch0, {
        exp: ifCondition,
        block: branch2
      });

      if (hasElse) {
        branch0.else = true;
      } else if (elseIfCondition) {
        branch0.elseif = elseIfCondition;
      }

      return branch0
    }
  }
}

function cloneASTElement (el) {
  return createASTElement(el.tag, el.attrsList.slice(), el.parent)
}

var model$1 = {
  preTransformNode: preTransformNode
};

var modules$1 = [
  klass$1,
  style$1,
  model$1
];

/*  */

function text (el, dir) {
  if (dir.value) {
    addProp(el, 'textContent', ("_s(" + (dir.value) + ")"), dir);
  }
}

/*  */

function html (el, dir) {
  if (dir.value) {
    addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"), dir);
  }
}

var directives$1 = {
  model: model,
  text: text,
  html: html
};

/*  */

var baseOptions = {
  expectHTML: true,
  modules: modules$1,
  directives: directives$1,
  isPreTag: isPreTag,
  isUnaryTag: isUnaryTag,
  mustUseProp: mustUseProp,
  canBeLeftOpenTag: canBeLeftOpenTag,
  isReservedTag: isReservedTag,
  getTagNamespace: getTagNamespace,
  staticKeys: genStaticKeys(modules$1)
};

/*  */

var isStaticKey;
var isPlatformReservedTag;

var genStaticKeysCached = cached(genStaticKeys$1);

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
function optimize (root, options) {
  if (!root) { return }
  isStaticKey = genStaticKeysCached(options.staticKeys || '');
  isPlatformReservedTag = options.isReservedTag || no;
  // first pass: mark all non-static nodes.
  markStatic$1(root);
  // second pass: mark static roots.
  markStaticRoots(root, false);
}

function genStaticKeys$1 (keys) {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}

function markStatic$1 (node) {
  node.static = isStatic(node);
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    for (var i = 0, l = node.children.length; i < l; i++) {
      var child = node.children[i];
      markStatic$1(child);
      if (!child.static) {
        node.static = false;
      }
    }
    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        var block = node.ifConditions[i$1].block;
        markStatic$1(block);
        if (!block.static) {
          node.static = false;
        }
      }
    }
  }
}

function markStaticRoots (node, isInFor) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor;
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true;
      return
    } else {
      node.staticRoot = false;
    }
    if (node.children) {
      for (var i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }
    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        markStaticRoots(node.ifConditions[i$1].block, isInFor);
      }
    }
  }
}

function isStatic (node) {
  if (node.type === 2) { // expression
    return false
  }
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    !isDirectChildOfTemplateFor(node) &&
    Object.keys(node).every(isStaticKey)
  ))
}

function isDirectChildOfTemplateFor (node) {
  while (node.parent) {
    node = node.parent;
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}

/*  */

var fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;
var fnInvokeRE = /\([^)]*?\);*$/;
var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

// KeyboardEvent.keyCode aliases
var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  'delete': [8, 46]
};

// KeyboardEvent.key aliases
var keyNames = {
  // #7880: IE11 and Edge use `Esc` for Escape key name.
  esc: ['Esc', 'Escape'],
  tab: 'Tab',
  enter: 'Enter',
  // #9112: IE11 uses `Spacebar` for Space key name.
  space: [' ', 'Spacebar'],
  // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
  up: ['Up', 'ArrowUp'],
  left: ['Left', 'ArrowLeft'],
  right: ['Right', 'ArrowRight'],
  down: ['Down', 'ArrowDown'],
  // #9112: IE11 uses `Del` for Delete key name.
  'delete': ['Backspace', 'Delete', 'Del']
};

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
var genGuard = function (condition) { return ("if(" + condition + ")return null;"); };

var modifierCode = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: genGuard("$event.target !== $event.currentTarget"),
  ctrl: genGuard("!$event.ctrlKey"),
  shift: genGuard("!$event.shiftKey"),
  alt: genGuard("!$event.altKey"),
  meta: genGuard("!$event.metaKey"),
  left: genGuard("'button' in $event && $event.button !== 0"),
  middle: genGuard("'button' in $event && $event.button !== 1"),
  right: genGuard("'button' in $event && $event.button !== 2")
};

function genHandlers (
  events,
  isNative
) {
  var prefix = isNative ? 'nativeOn:' : 'on:';
  var staticHandlers = "";
  var dynamicHandlers = "";
  for (var name in events) {
    var handlerCode = genHandler(events[name]);
    if (events[name] && events[name].dynamic) {
      dynamicHandlers += name + "," + handlerCode + ",";
    } else {
      staticHandlers += "\"" + name + "\":" + handlerCode + ",";
    }
  }
  staticHandlers = "{" + (staticHandlers.slice(0, -1)) + "}";
  if (dynamicHandlers) {
    return prefix + "_d(" + staticHandlers + ",[" + (dynamicHandlers.slice(0, -1)) + "])"
  } else {
    return prefix + staticHandlers
  }
}

function genHandler (handler) {
  if (!handler) {
    return 'function(){}'
  }

  if (Array.isArray(handler)) {
    return ("[" + (handler.map(function (handler) { return genHandler(handler); }).join(',')) + "]")
  }

  var isMethodPath = simplePathRE.test(handler.value);
  var isFunctionExpression = fnExpRE.test(handler.value);
  var isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''));

  if (!handler.modifiers) {
    if (isMethodPath || isFunctionExpression) {
      return handler.value
    }
    return ("function($event){" + (isFunctionInvocation ? ("return " + (handler.value)) : handler.value) + "}") // inline statement
  } else {
    var code = '';
    var genModifierCode = '';
    var keys = [];
    for (var key in handler.modifiers) {
      if (modifierCode[key]) {
        genModifierCode += modifierCode[key];
        // left/right
        if (keyCodes[key]) {
          keys.push(key);
        }
      } else if (key === 'exact') {
        var modifiers = (handler.modifiers);
        genModifierCode += genGuard(
          ['ctrl', 'shift', 'alt', 'meta']
            .filter(function (keyModifier) { return !modifiers[keyModifier]; })
            .map(function (keyModifier) { return ("$event." + keyModifier + "Key"); })
            .join('||')
        );
      } else {
        keys.push(key);
      }
    }
    if (keys.length) {
      code += genKeyFilter(keys);
    }
    // Make sure modifiers like prevent and stop get executed after key filtering
    if (genModifierCode) {
      code += genModifierCode;
    }
    var handlerCode = isMethodPath
      ? ("return " + (handler.value) + ".apply(null, arguments)")
      : isFunctionExpression
        ? ("return (" + (handler.value) + ").apply(null, arguments)")
        : isFunctionInvocation
          ? ("return " + (handler.value))
          : handler.value;
    return ("function($event){" + code + handlerCode + "}")
  }
}

function genKeyFilter (keys) {
  return (
    // make sure the key filters only apply to KeyboardEvents
    // #9441: can't use 'keyCode' in $event because Chrome autofill fires fake
    // key events that do not have keyCode property...
    "if(!$event.type.indexOf('key')&&" +
    (keys.map(genFilterCode).join('&&')) + ")return null;"
  )
}

function genFilterCode (key) {
  var keyVal = parseInt(key, 10);
  if (keyVal) {
    return ("$event.keyCode!==" + keyVal)
  }
  var keyCode = keyCodes[key];
  var keyName = keyNames[key];
  return (
    "_k($event.keyCode," +
    (JSON.stringify(key)) + "," +
    (JSON.stringify(keyCode)) + "," +
    "$event.key," +
    "" + (JSON.stringify(keyName)) +
    ")"
  )
}

/*  */

function on (el, dir) {
  if ( true && dir.modifiers) {
    warn("v-on without argument does not support modifiers.");
  }
  el.wrapListeners = function (code) { return ("_g(" + code + "," + (dir.value) + ")"); };
}

/*  */

function bind$1 (el, dir) {
  el.wrapData = function (code) {
    return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")
  };
}

/*  */

var baseDirectives = {
  on: on,
  bind: bind$1,
  cloak: noop
};

/*  */





var CodegenState = function CodegenState (options) {
  this.options = options;
  this.warn = options.warn || baseWarn;
  this.transforms = pluckModuleFunction(options.modules, 'transformCode');
  this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
  this.directives = extend(extend({}, baseDirectives), options.directives);
  var isReservedTag = options.isReservedTag || no;
  this.maybeComponent = function (el) { return !!el.component || !isReservedTag(el.tag); };
  this.onceId = 0;
  this.staticRenderFns = [];
  this.pre = false;
};



function generate (
  ast,
  options
) {
  var state = new CodegenState(options);
  // fix #11483, Root level <script> tags should not be rendered.
  var code = ast ? (ast.tag === 'script' ? 'null' : genElement(ast, state)) : '_c("div")';
  return {
    render: ("with(this){return " + code + "}"),
    staticRenderFns: state.staticRenderFns
  }
}

function genElement (el, state) {
  if (el.parent) {
    el.pre = el.pre || el.parent.pre;
  }

  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el, state)
  } else {
    // component or element
    var code;
    if (el.component) {
      code = genComponent(el.component, el, state);
    } else {
      var data;
      if (!el.plain || (el.pre && state.maybeComponent(el))) {
        data = genData$2(el, state);
      }

      var children = el.inlineTemplate ? null : genChildren(el, state, true);
      code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
    }
    // module transforms
    for (var i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code);
    }
    return code
  }
}

// hoist static sub-trees out
function genStatic (el, state) {
  el.staticProcessed = true;
  // Some elements (templates) need to behave differently inside of a v-pre
  // node.  All pre nodes are static roots, so we can use this as a location to
  // wrap a state change and reset it upon exiting the pre node.
  var originalPreState = state.pre;
  if (el.pre) {
    state.pre = el.pre;
  }
  state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
  state.pre = originalPreState;
  return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
}

// v-once
function genOnce (el, state) {
  el.onceProcessed = true;
  if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.staticInFor) {
    var key = '';
    var parent = el.parent;
    while (parent) {
      if (parent.for) {
        key = parent.key;
        break
      }
      parent = parent.parent;
    }
    if (!key) {
       true && state.warn(
        "v-once can only be used inside v-for that is keyed. ",
        el.rawAttrsMap['v-once']
      );
      return genElement(el, state)
    }
    return ("_o(" + (genElement(el, state)) + "," + (state.onceId++) + "," + key + ")")
  } else {
    return genStatic(el, state)
  }
}

function genIf (
  el,
  state,
  altGen,
  altEmpty
) {
  el.ifProcessed = true; // avoid recursion
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}

function genIfConditions (
  conditions,
  state,
  altGen,
  altEmpty
) {
  if (!conditions.length) {
    return altEmpty || '_e()'
  }

  var condition = conditions.shift();
  if (condition.exp) {
    return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
  } else {
    return ("" + (genTernaryExp(condition.block)))
  }

  // v-if with v-once should generate code like (a)?_m(0):_m(1)
  function genTernaryExp (el) {
    return altGen
      ? altGen(el, state)
      : el.once
        ? genOnce(el, state)
        : genElement(el, state)
  }
}

function genFor (
  el,
  state,
  altGen,
  altHelper
) {
  var exp = el.for;
  var alias = el.alias;
  var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
  var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

  if ( true &&
    state.maybeComponent(el) &&
    el.tag !== 'slot' &&
    el.tag !== 'template' &&
    !el.key
  ) {
    state.warn(
      "<" + (el.tag) + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " +
      "v-for should have explicit keys. " +
      "See https://vuejs.org/guide/list.html#key for more info.",
      el.rawAttrsMap['v-for'],
      true /* tip */
    );
  }

  el.forProcessed = true; // avoid recursion
  return (altHelper || '_l') + "((" + exp + ")," +
    "function(" + alias + iterator1 + iterator2 + "){" +
      "return " + ((altGen || genElement)(el, state)) +
    '})'
}

function genData$2 (el, state) {
  var data = '{';

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  var dirs = genDirectives(el, state);
  if (dirs) { data += dirs + ','; }

  // key
  if (el.key) {
    data += "key:" + (el.key) + ",";
  }
  // ref
  if (el.ref) {
    data += "ref:" + (el.ref) + ",";
  }
  if (el.refInFor) {
    data += "refInFor:true,";
  }
  // pre
  if (el.pre) {
    data += "pre:true,";
  }
  // record original tag name for components using "is" attribute
  if (el.component) {
    data += "tag:\"" + (el.tag) + "\",";
  }
  // module data generation functions
  for (var i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el);
  }
  // attributes
  if (el.attrs) {
    data += "attrs:" + (genProps(el.attrs)) + ",";
  }
  // DOM props
  if (el.props) {
    data += "domProps:" + (genProps(el.props)) + ",";
  }
  // event handlers
  if (el.events) {
    data += (genHandlers(el.events, false)) + ",";
  }
  if (el.nativeEvents) {
    data += (genHandlers(el.nativeEvents, true)) + ",";
  }
  // slot target
  // only for non-scoped slots
  if (el.slotTarget && !el.slotScope) {
    data += "slot:" + (el.slotTarget) + ",";
  }
  // scoped slots
  if (el.scopedSlots) {
    data += (genScopedSlots(el, el.scopedSlots, state)) + ",";
  }
  // component v-model
  if (el.model) {
    data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
  }
  // inline-template
  if (el.inlineTemplate) {
    var inlineTemplate = genInlineTemplate(el, state);
    if (inlineTemplate) {
      data += inlineTemplate + ",";
    }
  }
  data = data.replace(/,$/, '') + '}';
  // v-bind dynamic argument wrap
  // v-bind with dynamic arguments must be applied using the same v-bind object
  // merge helper so that class/style/mustUseProp attrs are handled correctly.
  if (el.dynamicAttrs) {
    data = "_b(" + data + ",\"" + (el.tag) + "\"," + (genProps(el.dynamicAttrs)) + ")";
  }
  // v-bind data wrap
  if (el.wrapData) {
    data = el.wrapData(data);
  }
  // v-on data wrap
  if (el.wrapListeners) {
    data = el.wrapListeners(data);
  }
  return data
}

function genDirectives (el, state) {
  var dirs = el.directives;
  if (!dirs) { return }
  var res = 'directives:[';
  var hasRuntime = false;
  var i, l, dir, needRuntime;
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i];
    needRuntime = true;
    var gen = state.directives[dir.name];
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, state.warn);
    }
    if (needRuntime) {
      hasRuntime = true;
      res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:" + (dir.isDynamicArg ? dir.arg : ("\"" + (dir.arg) + "\""))) : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}

function genInlineTemplate (el, state) {
  var ast = el.children[0];
  if ( true && (
    el.children.length !== 1 || ast.type !== 1
  )) {
    state.warn(
      'Inline-template components must have exactly one child element.',
      { start: el.start }
    );
  }
  if (ast && ast.type === 1) {
    var inlineRenderFns = generate(ast, state.options);
    return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}")
  }
}

function genScopedSlots (
  el,
  slots,
  state
) {
  // by default scoped slots are considered "stable", this allows child
  // components with only scoped slots to skip forced updates from parent.
  // but in some cases we have to bail-out of this optimization
  // for example if the slot contains dynamic names, has v-if or v-for on them...
  var needsForceUpdate = el.for || Object.keys(slots).some(function (key) {
    var slot = slots[key];
    return (
      slot.slotTargetDynamic ||
      slot.if ||
      slot.for ||
      containsSlotChild(slot) // is passing down slot from parent which may be dynamic
    )
  });

  // #9534: if a component with scoped slots is inside a conditional branch,
  // it's possible for the same component to be reused but with different
  // compiled slot content. To avoid that, we generate a unique key based on
  // the generated code of all the slot contents.
  var needsKey = !!el.if;

  // OR when it is inside another scoped slot or v-for (the reactivity may be
  // disconnected due to the intermediate scope variable)
  // #9438, #9506
  // TODO: this can be further optimized by properly analyzing in-scope bindings
  // and skip force updating ones that do not actually use scope variables.
  if (!needsForceUpdate) {
    var parent = el.parent;
    while (parent) {
      if (
        (parent.slotScope && parent.slotScope !== emptySlotScopeToken) ||
        parent.for
      ) {
        needsForceUpdate = true;
        break
      }
      if (parent.if) {
        needsKey = true;
      }
      parent = parent.parent;
    }
  }

  var generatedSlots = Object.keys(slots)
    .map(function (key) { return genScopedSlot(slots[key], state); })
    .join(',');

  return ("scopedSlots:_u([" + generatedSlots + "]" + (needsForceUpdate ? ",null,true" : "") + (!needsForceUpdate && needsKey ? (",null,false," + (hash(generatedSlots))) : "") + ")")
}

function hash(str) {
  var hash = 5381;
  var i = str.length;
  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return hash >>> 0
}

function containsSlotChild (el) {
  if (el.type === 1) {
    if (el.tag === 'slot') {
      return true
    }
    return el.children.some(containsSlotChild)
  }
  return false
}

function genScopedSlot (
  el,
  state
) {
  var isLegacySyntax = el.attrsMap['slot-scope'];
  if (el.if && !el.ifProcessed && !isLegacySyntax) {
    return genIf(el, state, genScopedSlot, "null")
  }
  if (el.for && !el.forProcessed) {
    return genFor(el, state, genScopedSlot)
  }
  var slotScope = el.slotScope === emptySlotScopeToken
    ? ""
    : String(el.slotScope);
  var fn = "function(" + slotScope + "){" +
    "return " + (el.tag === 'template'
      ? el.if && isLegacySyntax
        ? ("(" + (el.if) + ")?" + (genChildren(el, state) || 'undefined') + ":undefined")
        : genChildren(el, state) || 'undefined'
      : genElement(el, state)) + "}";
  // reverse proxy v-slot without scope on this.$slots
  var reverseProxy = slotScope ? "" : ",proxy:true";
  return ("{key:" + (el.slotTarget || "\"default\"") + ",fn:" + fn + reverseProxy + "}")
}

function genChildren (
  el,
  state,
  checkSkip,
  altGenElement,
  altGenNode
) {
  var children = el.children;
  if (children.length) {
    var el$1 = children[0];
    // optimize single v-for
    if (children.length === 1 &&
      el$1.for &&
      el$1.tag !== 'template' &&
      el$1.tag !== 'slot'
    ) {
      var normalizationType = checkSkip
        ? state.maybeComponent(el$1) ? ",1" : ",0"
        : "";
      return ("" + ((altGenElement || genElement)(el$1, state)) + normalizationType)
    }
    var normalizationType$1 = checkSkip
      ? getNormalizationType(children, state.maybeComponent)
      : 0;
    var gen = altGenNode || genNode;
    return ("[" + (children.map(function (c) { return gen(c, state); }).join(',')) + "]" + (normalizationType$1 ? ("," + normalizationType$1) : ''))
  }
}

// determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
function getNormalizationType (
  children,
  maybeComponent
) {
  var res = 0;
  for (var i = 0; i < children.length; i++) {
    var el = children[i];
    if (el.type !== 1) {
      continue
    }
    if (needsNormalization(el) ||
        (el.ifConditions && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
      res = 2;
      break
    }
    if (maybeComponent(el) ||
        (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
      res = 1;
    }
  }
  return res
}

function needsNormalization (el) {
  return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
}

function genNode (node, state) {
  if (node.type === 1) {
    return genElement(node, state)
  } else if (node.type === 3 && node.isComment) {
    return genComment(node)
  } else {
    return genText(node)
  }
}

function genText (text) {
  return ("_v(" + (text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
}

function genComment (comment) {
  return ("_e(" + (JSON.stringify(comment.text)) + ")")
}

function genSlot (el, state) {
  var slotName = el.slotName || '"default"';
  var children = genChildren(el, state);
  var res = "_t(" + slotName + (children ? (",function(){return " + children + "}") : '');
  var attrs = el.attrs || el.dynamicAttrs
    ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(function (attr) { return ({
        // slot props are camelized
        name: camelize(attr.name),
        value: attr.value,
        dynamic: attr.dynamic
      }); }))
    : null;
  var bind$$1 = el.attrsMap['v-bind'];
  if ((attrs || bind$$1) && !children) {
    res += ",null";
  }
  if (attrs) {
    res += "," + attrs;
  }
  if (bind$$1) {
    res += (attrs ? '' : ',null') + "," + bind$$1;
  }
  return res + ')'
}

// componentName is el.component, take it as argument to shun flow's pessimistic refinement
function genComponent (
  componentName,
  el,
  state
) {
  var children = el.inlineTemplate ? null : genChildren(el, state, true);
  return ("_c(" + componentName + "," + (genData$2(el, state)) + (children ? ("," + children) : '') + ")")
}

function genProps (props) {
  var staticProps = "";
  var dynamicProps = "";
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    var value = transformSpecialNewlines(prop.value);
    if (prop.dynamic) {
      dynamicProps += (prop.name) + "," + value + ",";
    } else {
      staticProps += "\"" + (prop.name) + "\":" + value + ",";
    }
  }
  staticProps = "{" + (staticProps.slice(0, -1)) + "}";
  if (dynamicProps) {
    return ("_d(" + staticProps + ",[" + (dynamicProps.slice(0, -1)) + "])")
  } else {
    return staticProps
  }
}

// #3895, #4268
function transformSpecialNewlines (text) {
  return text
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/*  */



// these keywords should not appear inside expressions, but operators like
// typeof, instanceof and in are allowed
var prohibitedKeywordRE = new RegExp('\\b' + (
  'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
  'super,throw,while,yield,delete,export,import,return,switch,default,' +
  'extends,finally,continue,debugger,function,arguments'
).split(',').join('\\b|\\b') + '\\b');

// these unary operators should not be used as property/method names
var unaryOperatorsRE = new RegExp('\\b' + (
  'delete,typeof,void'
).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

// strip strings in expressions
var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

// detect problematic expressions in a template
function detectErrors (ast, warn) {
  if (ast) {
    checkNode(ast, warn);
  }
}

function checkNode (node, warn) {
  if (node.type === 1) {
    for (var name in node.attrsMap) {
      if (dirRE.test(name)) {
        var value = node.attrsMap[name];
        if (value) {
          var range = node.rawAttrsMap[name];
          if (name === 'v-for') {
            checkFor(node, ("v-for=\"" + value + "\""), warn, range);
          } else if (name === 'v-slot' || name[0] === '#') {
            checkFunctionParameterExpression(value, (name + "=\"" + value + "\""), warn, range);
          } else if (onRE.test(name)) {
            checkEvent(value, (name + "=\"" + value + "\""), warn, range);
          } else {
            checkExpression(value, (name + "=\"" + value + "\""), warn, range);
          }
        }
      }
    }
    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        checkNode(node.children[i], warn);
      }
    }
  } else if (node.type === 2) {
    checkExpression(node.expression, node.text, warn, node);
  }
}

function checkEvent (exp, text, warn, range) {
  var stripped = exp.replace(stripStringRE, '');
  var keywordMatch = stripped.match(unaryOperatorsRE);
  if (keywordMatch && stripped.charAt(keywordMatch.index - 1) !== '$') {
    warn(
      "avoid using JavaScript unary operator as property name: " +
      "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim()),
      range
    );
  }
  checkExpression(exp, text, warn, range);
}

function checkFor (node, text, warn, range) {
  checkExpression(node.for || '', text, warn, range);
  checkIdentifier(node.alias, 'v-for alias', text, warn, range);
  checkIdentifier(node.iterator1, 'v-for iterator', text, warn, range);
  checkIdentifier(node.iterator2, 'v-for iterator', text, warn, range);
}

function checkIdentifier (
  ident,
  type,
  text,
  warn,
  range
) {
  if (typeof ident === 'string') {
    try {
      new Function(("var " + ident + "=_"));
    } catch (e) {
      warn(("invalid " + type + " \"" + ident + "\" in expression: " + (text.trim())), range);
    }
  }
}

function checkExpression (exp, text, warn, range) {
  try {
    new Function(("return " + exp));
  } catch (e) {
    var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
    if (keywordMatch) {
      warn(
        "avoid using JavaScript keyword as property name: " +
        "\"" + (keywordMatch[0]) + "\"\n  Raw expression: " + (text.trim()),
        range
      );
    } else {
      warn(
        "invalid expression: " + (e.message) + " in\n\n" +
        "    " + exp + "\n\n" +
        "  Raw expression: " + (text.trim()) + "\n",
        range
      );
    }
  }
}

function checkFunctionParameterExpression (exp, text, warn, range) {
  try {
    new Function(exp, '');
  } catch (e) {
    warn(
      "invalid function parameter expression: " + (e.message) + " in\n\n" +
      "    " + exp + "\n\n" +
      "  Raw expression: " + (text.trim()) + "\n",
      range
    );
  }
}

/*  */

var range = 2;

function generateCodeFrame (
  source,
  start,
  end
) {
  if ( start === void 0 ) start = 0;
  if ( end === void 0 ) end = source.length;

  var lines = source.split(/\r?\n/);
  var count = 0;
  var res = [];
  for (var i = 0; i < lines.length; i++) {
    count += lines[i].length + 1;
    if (count >= start) {
      for (var j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) { continue }
        res.push(("" + (j + 1) + (repeat$1(" ", 3 - String(j + 1).length)) + "|  " + (lines[j])));
        var lineLength = lines[j].length;
        if (j === i) {
          // push underline
          var pad = start - (count - lineLength) + 1;
          var length = end > count ? lineLength - pad : end - start;
          res.push("   |  " + repeat$1(" ", pad) + repeat$1("^", length));
        } else if (j > i) {
          if (end > count) {
            var length$1 = Math.min(end - count, lineLength);
            res.push("   |  " + repeat$1("^", length$1));
          }
          count += lineLength + 1;
        }
      }
      break
    }
  }
  return res.join('\n')
}

function repeat$1 (str, n) {
  var result = '';
  if (n > 0) {
    while (true) { // eslint-disable-line
      if (n & 1) { result += str; }
      n >>>= 1;
      if (n <= 0) { break }
      str += str;
    }
  }
  return result
}

/*  */



function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err: err, code: code });
    return noop
  }
}

function createCompileToFunctionFn (compile) {
  var cache = Object.create(null);

  return function compileToFunctions (
    template,
    options,
    vm
  ) {
    options = extend({}, options);
    var warn$$1 = options.warn || warn;
    delete options.warn;

    /* istanbul ignore if */
    if (true) {
      // detect possible CSP restriction
      try {
        new Function('return 1');
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn$$1(
            'It seems you are using the standalone build of Vue.js in an ' +
            'environment with Content Security Policy that prohibits unsafe-eval. ' +
            'The template compiler cannot work in this environment. Consider ' +
            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
            'templates into render functions.'
          );
        }
      }
    }

    // check cache
    var key = options.delimiters
      ? String(options.delimiters) + template
      : template;
    if (cache[key]) {
      return cache[key]
    }

    // compile
    var compiled = compile(template, options);

    // check compilation errors/tips
    if (true) {
      if (compiled.errors && compiled.errors.length) {
        if (options.outputSourceRange) {
          compiled.errors.forEach(function (e) {
            warn$$1(
              "Error compiling template:\n\n" + (e.msg) + "\n\n" +
              generateCodeFrame(template, e.start, e.end),
              vm
            );
          });
        } else {
          warn$$1(
            "Error compiling template:\n\n" + template + "\n\n" +
            compiled.errors.map(function (e) { return ("- " + e); }).join('\n') + '\n',
            vm
          );
        }
      }
      if (compiled.tips && compiled.tips.length) {
        if (options.outputSourceRange) {
          compiled.tips.forEach(function (e) { return tip(e.msg, vm); });
        } else {
          compiled.tips.forEach(function (msg) { return tip(msg, vm); });
        }
      }
    }

    // turn code into functions
    var res = {};
    var fnGenErrors = [];
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
      return createFunction(code, fnGenErrors)
    });

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
    if (true) {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn$$1(
          "Failed to generate render function:\n\n" +
          fnGenErrors.map(function (ref) {
            var err = ref.err;
            var code = ref.code;

            return ((err.toString()) + " in\n\n" + code + "\n");
        }).join('\n'),
          vm
        );
      }
    }

    return (cache[key] = res)
  }
}

/*  */

function createCompilerCreator (baseCompile) {
  return function createCompiler (baseOptions) {
    function compile (
      template,
      options
    ) {
      var finalOptions = Object.create(baseOptions);
      var errors = [];
      var tips = [];

      var warn = function (msg, range, tip) {
        (tip ? tips : errors).push(msg);
      };

      if (options) {
        if ( true && options.outputSourceRange) {
          // $flow-disable-line
          var leadingSpaceLength = template.match(/^\s*/)[0].length;

          warn = function (msg, range, tip) {
            var data = { msg: msg };
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength;
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength;
              }
            }
            (tip ? tips : errors).push(data);
          };
        }
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules);
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          );
        }
        // copy other options
        for (var key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key];
          }
        }
      }

      finalOptions.warn = warn;

      var compiled = baseCompile(template.trim(), finalOptions);
      if (true) {
        detectErrors(compiled.ast, warn);
      }
      compiled.errors = errors;
      compiled.tips = tips;
      return compiled
    }

    return {
      compile: compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}

/*  */

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
var createCompiler = createCompilerCreator(function baseCompile (
  template,
  options
) {
  var ast = parse(template.trim(), options);
  if (options.optimize !== false) {
    optimize(ast, options);
  }
  var code = generate(ast, options);
  return {
    ast: ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
});

/*  */

var ref$1 = createCompiler(baseOptions);
var compile = ref$1.compile;
var compileToFunctions = ref$1.compileToFunctions;

/*  */

// check whether current browser encodes a char inside attribute values
var div;
function getShouldDecode (href) {
  div = div || document.createElement('div');
  div.innerHTML = href ? "<a href=\"\n\"/>" : "<div a=\"\n\"/>";
  return div.innerHTML.indexOf('&#10;') > 0
}

// #3663: IE encodes newlines inside attribute values while other browsers don't
var shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false;
// #6828: chrome encodes content in a[href]
var shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false;

/*  */

var idToTemplate = cached(function (id) {
  var el = query(id);
  return el && el.innerHTML
});

var mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && query(el);

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
     true && warn(
      "Do not mount Vue to <html> or <body> - mount to normal elements instead."
    );
    return this
  }

  var options = this.$options;
  // resolve template/el and convert to render function
  if (!options.render) {
    var template = options.template;
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template);
          /* istanbul ignore if */
          if ( true && !template) {
            warn(
              ("Template element not found or is empty: " + (options.template)),
              this
            );
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
        if (true) {
          warn('invalid template option:' + template, this);
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el);
    }
    if (template) {
      /* istanbul ignore if */
      if ( true && config.performance && mark) {
        mark('compile');
      }

      var ref = compileToFunctions(template, {
        outputSourceRange: "development" !== 'production',
        shouldDecodeNewlines: shouldDecodeNewlines,
        shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this);
      var render = ref.render;
      var staticRenderFns = ref.staticRenderFns;
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
      if ( true && config.performance && mark) {
        mark('compile end');
        measure(("vue " + (this._name) + " compile"), 'compile', 'compile end');
      }
    }
  }
  return mount.call(this, el, hydrating)
};

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el) {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    var container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions;

/* harmony default export */ __webpack_exports__["default"] = (Vue);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	!function() {
/******/ 		__webpack_require__.nmd = function(module) {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.esm.js");
/* harmony import */ var vue_tables_2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue-tables-2 */ "./node_modules/vue-tables-2/compiled/index.js");
/* harmony import */ var vue_tables_2__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue_tables_2__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var vue_select__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue-select */ "./node_modules/vue-select/dist/vue-select.js");
/* harmony import */ var vue_select__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(vue_select__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var vue_loading_overlay__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! vue-loading-overlay */ "./node_modules/vue-loading-overlay/dist/vue-loading.min.js");
/* harmony import */ var vue_loading_overlay__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(vue_loading_overlay__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var vue_sweetalert2__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! vue-sweetalert2 */ "./node_modules/vue-sweetalert2/dist/vue-sweetalert.umd.js");
/* harmony import */ var vue_sweetalert2__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(vue_sweetalert2__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _App_vue__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./App.vue */ "./src/App.vue");
/* harmony import */ var _assets_css_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./assets/css/style.css */ "./src/assets/css/style.css");
/* harmony import */ var vue_select_dist_vue_select_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! vue-select/dist/vue-select.css */ "./node_modules/vue-select/dist/vue-select.css");
/* harmony import */ var vue_loading_overlay_dist_vue_loading_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! vue-loading-overlay/dist/vue-loading.css */ "./node_modules/vue-loading-overlay/dist/vue-loading.css");
/* harmony import */ var sweetalert2_dist_sweetalert2_min_css__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! sweetalert2/dist/sweetalert2.min.css */ "./node_modules/sweetalert2/dist/sweetalert2.min.css");






(axios__WEBPACK_IMPORTED_MODULE_2___default().defaults.baseURL) = "http://api-praxis.test/wp-json";
window.axios = (axios__WEBPACK_IMPORTED_MODULE_2___default()); // Components

 // Styles




 // Vue use

vue__WEBPACK_IMPORTED_MODULE_10__["default"].use((vue_sweetalert2__WEBPACK_IMPORTED_MODULE_4___default()));
vue__WEBPACK_IMPORTED_MODULE_10__["default"].use((vue_loading_overlay__WEBPACK_IMPORTED_MODULE_3___default()), {
  backgroundColor: "#ffffff50",
  color: "#2962FF",
  loader: "dots"
});
vue__WEBPACK_IMPORTED_MODULE_10__["default"].use(vue_tables_2__WEBPACK_IMPORTED_MODULE_0__.ClientTable, [{}]); // Vue Components

vue__WEBPACK_IMPORTED_MODULE_10__["default"].component("v-select", (vue_select__WEBPACK_IMPORTED_MODULE_1___default()));

window.onload = function () {
  new vue__WEBPACK_IMPORTED_MODULE_10__["default"]({
    el: "#app",
    render: function render(h) {
      return h(_App_vue__WEBPACK_IMPORTED_MODULE_5__["default"]);
    }
  });
};
}();
/******/ })()
;