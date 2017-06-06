describe('intercept.directive', () => {
    /**
     * Setting up module to use for directive testing
     * @type {angular.IModule}
     */
    const testModule = angular.module('test', [])
        .directive('simpleDirective', simpleDirective)
        .directive('simpleDirectiveWithInjection', simpleDirectiveWithInjection)
        .directive('simpleDirectiveWithMinifiedInjection', ['$rootScope', simpleDirectiveWithInjection]);

    // ==============================
    // Starting test implementation
    // ==============================
    let $compile: ng.ICompileService, $rootScope: ng.IRootScopeService;

    beforeEach(angular.mock.module('test'));
    beforeEach(angular.mock.inject((_$compile_, _$rootScope_) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should still return a module', () => {
        expect(testModule).toBeDefined();
    });

    it('does not interfere with simple directive without injection', () => {
        const element = $compile(`<simple-directive variable="just testing"></simple-directive>`)($rootScope);
        $rootScope.$digest();
        expect(element.html()).toContain('just testing');
    });

    it('does not interfere with simple directive with injection', () => {
        const spy = jasmine.createSpy('testEventHandler');
        $rootScope.$on('testevent', spy);

        const element = $compile(`<simple-directive-with-injection variable="just testing"></simple-directive-with-injection>`)($rootScope);
        $rootScope.$digest();
        expect(element.html()).toContain('just testing');
        expect(spy.calls.mostRecent().args[1]).toEqual('test data');
    });

    it('does not interfere with simple directive with injection when minifaction safe', () => {
        const spy = jasmine.createSpy('testEventHandler');
        $rootScope.$on('testevent', spy);

        const element = $compile(`<simple-directive-with-minified-injection variable="just testing"></simple-directive-with-minified-injection>`)($rootScope);
        $rootScope.$digest();
        expect(element.html()).toContain('just testing');
        expect(spy.calls.mostRecent().args[1]).toEqual('test data');
    });
});

function simpleDirective(): ng.IDirective {
    return {
        restrict: 'E',
        template: `<div>{{variable}}</div>`,
        scope: {
            variable: '@'
        }
    };
}

function simpleDirectiveWithInjection($rootScope: ng.IRootScopeService): ng.IDirective {
    return {
        restrict: 'E',
        template: `<div>{{variable}}</div>`,
        scope: {
            variable: '@'
        },
        link: () => {
            $rootScope.$emit('testevent', 'test data');
        }
    };
}
