import * as angular from 'angular';
import {Require} from '../decorators/require';

describe('Directives with Controllers using Required', () => {
    /**
     * Setting up module to use for directive testing
     * @type {angular.IModule}
     */
    const testModule = angular.module('directive.ctrls-required', [])
        .directive('outerDirective', outerDirective)
        .directive('innerDirective', innerDirective);
        // .directive('innerDirectivePre', innerDirectivePre)
        // .directive('innerDirectivePost', innerDirectivePost);

    // ==============================
    // Starting test implementation
    // ==============================
    let $compile: ng.ICompileService, $rootScope: ng.IRootScopeService;

    beforeEach(angular.mock.module('directive.ctrls-required'));
    beforeEach(angular.mock.inject((_$compile_, _$rootScope_) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should substitute transcluded content', () => {
        const element = $compile(`<outer-directive content="just testing"></outer-directive>`)($rootScope);
        $rootScope.$digest();
        expect(element.html()).toContain(`<h1>Outer</h1>`);
    });

    it('should work without anything', () => {
        const element = $compile(`
            <outer-directive content="just testing">
                <inner-directive binding-value="test"></inner-directive>
            </outer-directive>`
        )($rootScope);
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

    @Require('outerDirective')
    outerTestController: OuterTestController;

    constructor() {
    }
}

function outerDirective(): ng.IDirective {
    return {
        restrict: 'E',
        transclude: true,
        template: `<div><h1>Outer</h1><ng-transclude></ng-transclude></div>`,
        controller: OuterTestController,
        controllerAs: '$ctrl',
        bindToController: true,
        scope: {
            content: '@'
        }
    }
}

const PLAIN_INNER_DIRECTIVE = {
    restrict: 'E',
    template: `<div>{{$ctrl.outerTestController.content}} - {{$ctrl.bindingValue}}</div>`,
    controller: InnerTestController,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
        bindingValue: '@'
    }
};

function innerDirective(): ng.IDirective {
    return angular.extend({
    }, PLAIN_INNER_DIRECTIVE);
}

// function innerDirectivePre(): ng.IDirective {
//     return angular.extend({
//         require: ['^^outerDirective', 'innerDirectivePre'],
//         compile: () => {
//             return {
//                 pre: (scope, element, attrs, ctrls: any[]) => {
//                     const outer = ctrls[0] as OuterTestController;
//                     const inner = ctrls[1] as InnerTestController;
//                     inner.outerTestController = outer;
//                 }
//             };
//         }
//     }, PLAIN_INNER_DIRECTIVE);
// }
//
// function innerDirectivePost(): ng.IDirective {
//     return angular.extend({
//         require: ['^^outerDirective', 'innerDirectivePost'],
//         compile: () => {
//             return {
//                 post: (scope, element, attrs, ctrls: any[]) => {
//                     const outer = ctrls[0] as OuterTestController;
//                     const inner = ctrls[1] as InnerTestController;
//                     inner.outerTestController = outer;
//                 }
//             };
//         }
//     }, PLAIN_INNER_DIRECTIVE);
// }
