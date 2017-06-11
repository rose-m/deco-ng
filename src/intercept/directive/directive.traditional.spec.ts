import * as angular from 'angular';
import {ICompileService, IDirective, IRootScopeService} from 'angular';
import {inject} from '../../index';

describe('Directives with Controllers in traditional fashion', () => {
    inject();

    /**
     * Setting up module to use for directive testing
     * @type {angular.IModule}
     */
    const testModule = angular.module('directive.ctrls-old', [])
        .directive('outerDirective', createOuterDirective('inner-directive'))
        .directive('innerDirective', innerDirective)
        .directive('outerDirectivePre', createOuterDirective('inner-directive-pre'))
        .directive('innerDirectivePre', innerDirectivePre)
        .directive('outerDirectivePost', createOuterDirective('inner-directive-post'))
        .directive('innerDirectivePost', innerDirectivePost);

    // ==============================
    // Starting test implementation
    // ==============================
    let $compile: ICompileService, $rootScope: IRootScopeService;

    beforeEach(angular.mock.module('directive.ctrls-old'));
    beforeEach(angular.mock.inject((_$compile_, _$rootScope_) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should still work with link', () => {
        const element = $compile(`<outer-directive content="just testing"></outer-directive>`)($rootScope);
        $rootScope.$digest();
        expect(element.html()).toContain('just testing - test');
    });

    it('should still work with pre-link', () => {
        const element = $compile(`<outer-directive-pre content="just testing"></outer-directive-pre>`)($rootScope);
        $rootScope.$digest();
        expect(element.html()).toContain('just testing - test');
    });

    it('should still work with post-link', () => {
        const element = $compile(`<outer-directive-post content="just testing"></outer-directive-post>`)($rootScope);
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

function createOuterDirective(innerDirective: string): () => IDirective {
    return () => {
        return {
            restrict: 'E',
            template: `<div><${innerDirective} binding-value="test"></${innerDirective}></div>`,
            controller: OuterTestController,
            controllerAs: '$ctrl',
            bindToController: true,
            scope: {
                content: '@'
            }
        };
    };
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

function innerDirective(): IDirective {
    return angular.extend({
        require: ['^^outerDirective', 'innerDirective'],
        link: (scope, element, attrs, ctrls: any[]) => {
            const outer = ctrls[0] as OuterTestController;
            const inner = ctrls[1] as InnerTestController;
            inner.outerTestController = outer;
        }
    }, PLAIN_INNER_DIRECTIVE);
}

function innerDirectivePre(): IDirective {
    return angular.extend({
        require: ['^^outerDirectivePre', 'innerDirectivePre'],
        compile: () => {
            return {
                pre: (scope, element, attrs, ctrls: any[]) => {
                    const outer = ctrls[0] as OuterTestController;
                    const inner = ctrls[1] as InnerTestController;
                    inner.outerTestController = outer;
                }
            };
        }
    }, PLAIN_INNER_DIRECTIVE);
}

function innerDirectivePost(): IDirective {
    return angular.extend({
        require: ['^^outerDirectivePost', 'innerDirectivePost'],
        compile: () => {
            return {
                post: (scope, element, attrs, ctrls: any[]) => {
                    const outer = ctrls[0] as OuterTestController;
                    const inner = ctrls[1] as InnerTestController;
                    inner.outerTestController = outer;
                }
            };
        }
    }, PLAIN_INNER_DIRECTIVE);
}
