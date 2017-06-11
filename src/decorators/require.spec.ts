import * as angular from 'angular';
import {ICompileService, IDirective, IRootScopeService} from 'angular';
import {Require} from './require';
import {inject} from '../index';

describe('Directives with Controllers using @Require', () => {
    inject();

    /**
     * Setting up module to use for directive testing
     * @type {angular.IModule}
     */
    const testModule = angular.module('require.spec', [])
        .directive('outerDirective', outerDirective)
        .directive('innerDirective', innerDirective)
        .directive('innerDirectivePre', innerDirectivePre)
        .directive('innerDirectivePost', innerDirectivePost);

    // ==============================
    // Starting test implementation
    // ==============================
    let $compile: ICompileService, $rootScope: IRootScopeService;

    beforeEach(angular.mock.module('require.spec'));
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

    it('should be set before regular pre', () => {
        const element = $compile(`
            <outer-directive content="just testing">
                <inner-directive-pre binding-value="test"></inner-directive-pre>
            </outer-directive>`
        )($rootScope);
        $rootScope.$digest();
        expect(element.html()).toContain('just testing - test and pre');
    });

    it('should be set before regular post', () => {
        const element = $compile(`
            <outer-directive content="just testing">
                <inner-directive-post binding-value="test"></inner-directive-post>
            </outer-directive>`
        )($rootScope);
        $rootScope.$digest();
        expect(element.html()).toContain('just testing - test and post');
    });
});

class OuterTestController {
    readonly content: string;
    valueForTesting: string;

    constructor() {
    }
}

class InnerTestWithRequireController {
    bindingValue: string;

    @Require('^^outerDirective')
    outerTestController: OuterTestController;

    constructor() {
    }
}

function outerDirective(): IDirective {
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
    template: `<div>{{$ctrl.outerTestController.content}} - {{$ctrl.bindingValue}} and {{$ctrl.outerTestController.valueForTesting}}</div>`,
    controller: InnerTestWithRequireController,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
        bindingValue: '@'
    }
};

function innerDirective(): IDirective {
    return angular.extend({}, PLAIN_INNER_DIRECTIVE);
}

function innerDirectivePre(): IDirective {
    return angular.extend({
        compile: () => {
            return {
                pre: (scope, element, attrs, ctrls: any[]) => {
                    const ctrl = ctrls[ctrls.length - 1] as InnerTestWithRequireController;
                    ctrl.outerTestController.valueForTesting = 'pre';
                }
            };
        }
    }, PLAIN_INNER_DIRECTIVE);
}

function innerDirectivePost(): IDirective {
    return angular.extend({
        compile: () => {
            return {
                post: (scope, element, attrs, ctrls: any[]) => {
                    const ctrl = ctrls[ctrls.length - 1] as InnerTestWithRequireController;
                    ctrl.outerTestController.valueForTesting = 'post';
                }
            };
        }
    }, PLAIN_INNER_DIRECTIVE);
}
