describe('intercept.directive', () => {
    const testModule = angular.module('test', [])
        .directive('simpleDirective', simpleDirective);

    let $compile: ng.ICompileService, $rootScope: ng.IRootScopeService;

    beforeEach(angular.mock.module('test'));
    beforeEach(angular.mock.inject((_$compile_, _$rootScope_) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should still return a module', () => {
        expect(testModule).toBeDefined();
    });

    it('does not interfere with simple directive', () => {
        const element = $compile(`<simple-directive variable="just testing"></simple-directive>`)($rootScope);
        $rootScope.$digest();
        expect(element.html()).toContain('just testing');
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
