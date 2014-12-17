angular.module('mobi.ui.settings.services', [])

    .constant('LOCALSTORE_KEY_PREFIX', "settings")

    /*
     Writes and reads settings into and from localStorage. Each inserted key will have a prefix, for example 'settings.mySettings'.
     */
    .factory('SettingsManager', function ($window, LOCALSTORE_KEY_PREFIX, $rootScope, $log) {

        var localStorage,
            prefix = LOCALSTORE_KEY_PREFIX + '.'; // add a point at the end to separate prefix and key

        // Checks the browser to see if local storage is supported and initialize it
        (function initLocalStorage() {
            try {
                if ('localStorage' in $window && $window.localStorage !== null) {
                    localStorage = $window.localStorage;

                    // When Safari (OS X or iOS) is in private browsing mode, it appears as though localStorage
                    // is available, but trying to call .setItem throws an exception.
                    //
                    // "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage
                    // that exceeded the quota."
                    var key = prefix + '__' + Math.round(Math.random() * 1e7);
                    localStorage.setItem(key, '');
                    localStorage.removeItem(key);
                }
                else {
                    throw new Error('Error on inserting or removing item on localStorage');
                }
            } catch (e) {
                $log.error('Browser doesn\'t support localStorage');
                throw new Error('Browser doesn\'t support localStorage');
            }
        })();

        // Adds a value to local storage
        function setSetting(key, value) {
            localStorage.setItem(prefix + key, angular.toJson(value));
            $rootScope.$broadcast('settingChanged', key, value);
        }

        // Gets a value from the local storage
        function getSetting(key) {
            var value = localStorage.getItem(prefix + key);
            if (value) {
                return angular.fromJson(value);
            }
        }

        // Removes a value from the local storage
        function removeSetting(key) {
            localStorage.removeItem(prefix + key);
            $rootScope.$broadcast('settingRemoved', key);
        }

        // Return array of keys for local storage
        // Example use: var keys = localStorageService.keys()
        function getKeys() {

            var prefixLength = prefix.length,
                key, keys = [];
            for (key in localStorage) {
                // Only return keys that are for this app
                if (key.substr(0, prefixLength) === prefix) {
                    keys.push(key.substr(prefixLength));
                }
            }
            return keys;
        }

        // Remove all data for this app from local storage
        // Also optionally takes a regular expression string and removes the matching key-value pairs
        // Example use: SettingsManager.clearAll();
        // Should be used mostly for development purposes
        function clearAll(regularExpression) {
            var tempPrefix, testRegex, prefixLength, key;

            regularExpression = regularExpression || "";

            //accounting for the '.' in the prefix when creating a regex
            tempPrefix = prefix.slice(0, -1);
            testRegex = new RegExp(tempPrefix + '\\.' + regularExpression);

            prefixLength = prefix.length;

            for (key in localStorage) {
                // Only remove items that are for this app and match the regular expression
                if (testRegex.test(key)) {
                    removeSetting(key.substr(prefixLength));
                }
            }
        }

        return {
            setSetting: setSetting,
            getSetting: getSetting,
            removeSetting: removeSetting,
            getKeys: getKeys,
            clearAll: clearAll
        };
    }
);