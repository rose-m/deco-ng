describe('Directives with Controllers', () => {
    /**
     * Setting up module to use for directive testing
     * @type {angular.IModule}
     */
    const testModule = angular.module('directive.ctrls', [])
        .directive('outerDirective', outerDirective)
        .directive('innerDirective', innerDirective);

    // ==============================
    // Starting test implementation
    // ==============================
    let $compile: ng.ICompileService, $rootScope: ng.IRootScopeService;

    beforeEach(angular.mock.module('directive.ctrls'));
    beforeEach(angular.mock.inject((_$compile_, _$rootScope_) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should still work in old style', () => {
        const element = $compile(`<outer-directive content="just testing"></outer-directive>`)($rootScope);
        $rootScope.$digest();
        expect(element.html()).toContain('just testing - test');
    });

});

class OuterTestController {
    content: string;

    constructor() {
    }
}

class InnerTestController {
    bindingValue: string;
    outerTestController: OuterTestController;

    constructor() {
    }
}

function outerDirective(): ng.IDirective {
    return {
        restrict: 'E',
        template: `<div><inner-directive binding-value="test"></inner-directive></div>`,
        controller: OuterTestController,
        controllerAs: '$ctrl',
        bindToController: true,
        scope: {
            content: '@'
        }
    };
}

function innerDirective(): ng.IDirective {
    return {
        restrict: 'E',
        require: ['^^outerDirective', 'innerDirective'],
        template: `<div>{{$ctrl.outerTestController.content}} - {{$ctrl.bindingValue}}</div>`,
        controller: InnerTestController,
        controllerAs: '$ctrl',
        bindToController: true,
        scope: {
            bindingValue: '@'
        },
        link: (scope, element, attrs, ctrls: any[]) => {
            const outer = ctrls[0] as OuterTestController;
            const inner = ctrls[1] as InnerTestController;
            inner.outerTestController = outer;
        }
    };
}
