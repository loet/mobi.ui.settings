describe('mobi.ui.settings.services tests', function () {
    "use strict";

    var SettingsManager,
        $window, LOCALSTORE_KEY_PREFIX, $log,
        KEY = 'mySetting',
        SETTING = {setting: 'test'};

    describe('with localStorage mock', function () {
        var $windowMock, localStorageMock;

        /*
         Mocking dependencies
         */
        beforeEach(module('mobi.ui.settings.services', function ($provide) {

            function LocalStorageMock() {
            }

            LocalStorageMock.prototype.setItem = function (key, value) {
                this[key] = value;
            };
            LocalStorageMock.prototype.getItem = function (key) {
                return this[key];
            };
            LocalStorageMock.prototype.removeItem = function (key) {
                delete this[key];
            };

            localStorageMock = new LocalStorageMock();
            $windowMock = {
                localStorage: localStorageMock
            };

            $provide.value('$window', $windowMock);
        }));

        // test injected dependencies
        beforeEach(inject(function (_$window_, _LOCALSTORE_KEY_PREFIX_, _$log_) {

            $window = _$window_;
            LOCALSTORE_KEY_PREFIX = _LOCALSTORE_KEY_PREFIX_;
            $log = _$log_;

            // test if mocks are injected
            expect($window).toBe($windowMock);
        }));

        // retrieve service under test
        beforeEach(inject(function (_SettingsManager_) {
            SettingsManager = _SettingsManager_;
        }));

        describe('SettingsManager definition', function () {

            /**
             * API:
             * return {
         *     setSetting: setSetting,
         *     getSetting: getSetting,
         *     removeSetting: removeSetting,
         *     getKeys: getKeys,
         *     clearAll: clearAll,
         * };
             */

            it('should have function setSetting', function () {
                expect(angular.isFunction(SettingsManager.setSetting)).toBeTruthy();
            });

            it('should have function getSetting', function () {
                expect(angular.isFunction(SettingsManager.getSetting)).toBeTruthy();
            });

            it('should have function removeSetting', function () {
                expect(angular.isFunction(SettingsManager.removeSetting)).toBeTruthy();
            });

            it('should have function getKeys', function () {
                expect(angular.isFunction(SettingsManager.getKeys)).toBeTruthy();
            });

            it('should have function clearAll', function () {
                expect(angular.isFunction(SettingsManager.clearAll)).toBeTruthy();
            });

        });

        describe('SettingsManager functionality', function () {

            it('setSetting should insert value into localStorage', function () {
                var result;

                // setup mocks
                spyOn(localStorageMock, 'setItem').andCallThrough();

                // test
                result = SettingsManager.setSetting(KEY, SETTING);

                // evaluate test results
                expect(result).not.toBeDefined();

                // localStorage should have been called
                expect(localStorageMock.setItem).toHaveBeenCalledWith(LOCALSTORE_KEY_PREFIX + '.' + KEY, angular.toJson(SETTING));
            });

            it('getSetting should read value into localStorage', function () {
                var result;

                // setup mocks
                spyOn(localStorageMock, 'getItem').andReturn(angular.toJson(SETTING));

                // test
                result = SettingsManager.getSetting(KEY);

                // evaluate test results
                expect(result).toBeDefined();
                expect(result).toEqual(SETTING);

                // localStorage should have been called
                expect(localStorageMock.getItem).toHaveBeenCalledWith(LOCALSTORE_KEY_PREFIX + '.' + KEY);
            });

            it('removeSetting should remove value from localStorage', function () {
                var result;

                // setup mocks
                spyOn(localStorageMock, 'removeItem').andCallThrough();

                // test
                result = SettingsManager.removeSetting(KEY);

                // evaluate test results
                expect(result).not.toBeDefined();

                // localStorage should have been called
                expect(localStorageMock.removeItem).toHaveBeenCalledWith(LOCALSTORE_KEY_PREFIX + '.' + KEY);
            });

            it('getKeys should return all keys from localStorage', function () {
                var result;

                // setup mocks
                localStorageMock.setItem(LOCALSTORE_KEY_PREFIX + '.' + 'key1', 'value1');
                localStorageMock.setItem(LOCALSTORE_KEY_PREFIX + '.' + 'key2', 'value2');
                localStorageMock.setItem(LOCALSTORE_KEY_PREFIX + '.' + 'key3', 'value3');

                // test
                result = SettingsManager.getKeys();

                // evaluate test results
                expect(result).toBeDefined();
                expect(angular.isArray(result)).toBeTruthy();
                expect(result).toEqual(['key1', 'key2', 'key3']);
            });

            it('clearAll should remove all from localStorage', function () {
                var result;

                // setup mocks
                localStorageMock.setItem(LOCALSTORE_KEY_PREFIX + '.' + 'key1', 'value1');
                localStorageMock.setItem(LOCALSTORE_KEY_PREFIX + '.' + 'key2', 'value2');
                localStorageMock.setItem(LOCALSTORE_KEY_PREFIX + '.' + 'key3', 'value3');
                expect(Object.keys(localStorageMock).length).toBe(3);

                // test
                result = SettingsManager.clearAll();

                // evaluate test results
                expect(result).not.toBeDefined();

                // check if localStorage empty
                expect(Object.keys(localStorageMock).length).toBe(0);
            });

            it('clearAll should remove only regex matches from localStorage', function () {
                var result;

                // setup mocks
                localStorageMock.setItem(LOCALSTORE_KEY_PREFIX + '.' + 'myView.key1', 'value1');
                localStorageMock.setItem(LOCALSTORE_KEY_PREFIX + '.' + 'myView.key2', 'value2');
                localStorageMock.setItem(LOCALSTORE_KEY_PREFIX + '.' + 'otherView.key1', 'value3');
                expect(Object.keys(localStorageMock).length).toBe(3);

                // test. delete with regex
                result = SettingsManager.clearAll('myView\\.');

                // evaluate test results
                expect(result).not.toBeDefined();

                // check if any entry matching the regex is deleted in localStorage
                expect(Object.keys(localStorageMock).length).toBe(1);
            });

        });
    });

    describe('with real localStorage', function () {

        /*
         Mocking dependencies
         */
        beforeEach(module('mobi.ui.settings.services', function ($provide) {
            $provide.constant('LOCALSTORE_KEY_PREFIX', 'settings' + '__'); // ensure to not override existing entries
        }));

        // injected dependencies
        beforeEach(inject(function (_$window_, _LOCALSTORE_KEY_PREFIX_, _$log_) {
            $window = _$window_;
            LOCALSTORE_KEY_PREFIX = _LOCALSTORE_KEY_PREFIX_;
            $log = _$log_;
        }));

        // retrieve service under test
        beforeEach(inject(function (_SettingsManager_) {
            SettingsManager = _SettingsManager_;
        }));

        // delete inserted entries with the same prefix
        afterEach(function () {
            SettingsManager.clearAll();
        });

        describe('SettingsManager functionality', function () {

            it('setSetting should insert value into localStorage', function () {
                var result;

                // setup mocks
                spyOn($window.localStorage, 'setItem').andCallThrough();

                // test
                result = SettingsManager.setSetting(KEY, SETTING);

                // evaluate test results
                expect(result).not.toBeDefined();

                // localStorage should have been called
                expect($window.localStorage.setItem).toHaveBeenCalledWith(LOCALSTORE_KEY_PREFIX + '.' + KEY, angular.toJson(SETTING));
            });

            it('getSetting should read value into localStorage', function () {
                var result;

                // setup
                SettingsManager.setSetting(KEY, SETTING);
                spyOn($window.localStorage, 'getItem').andCallThrough();

                // test
                result = SettingsManager.getSetting(KEY);

                // evaluate test results
                expect(result).toBeDefined();
                expect(result).toEqual(SETTING);

                // localStorage should have been called
                expect($window.localStorage.getItem).toHaveBeenCalledWith(LOCALSTORE_KEY_PREFIX + '.' + KEY);
            });

        });
    });
});