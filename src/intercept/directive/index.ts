import * as angular from 'angular';
import {IDirectiveCompileFn, IDirectiveLinkFn, IDirectivePrePost} from 'angular';
import {wrap} from '../utils';
import Hooks from './hooks';

/**
 * Modifies the given `ngModule` to intercept the directive function.
 */
export default function directiveWrapper(ngModule: ng.IModule) {
    (ngModule as any).directive = wrap(ngModule.directive, {
        transformArguments: directiveArgumentTransformation
    });
    return ngModule;
}

/**
 * Transform the arguments of the directive function in order to wrap the directive factory function.
 * @param directiveArguments The first element always is the name of the directive, the second element either is the factory / linkFn directly or
 * an array with minification safe injectables.
 * @return {any[]}
 *
 * @see angular.IDirectiveFactory
 */
function directiveArgumentTransformation(directiveArguments: any[]): any[] {
    const fnOrInjectables = directiveArguments[1] as ng.Injectable<ng.IDirectiveFactory>;

    let factoryFn: ng.IDirectiveFactory;
    if (typeof fnOrInjectables === 'function') {
        factoryFn = fnOrInjectables;
    } else {
        factoryFn = fnOrInjectables[fnOrInjectables.length - 1] as ng.IDirectiveFactory;
    }

    const newFactoryFn = wrap(factoryFn, {
        transformResult: directiveFactoryResultTransformation
    });

    if (typeof fnOrInjectables === 'function') {
        angular.injector().annotate(factoryFn);
        const injectables = factoryFn.$inject as Array<string | ng.IDirectiveFactory>;
        injectables.push(newFactoryFn);
        directiveArguments[1] = injectables;
    } else {
        fnOrInjectables[fnOrInjectables.length - 1] = newFactoryFn;
    }

    return directiveArguments;
}

/**
 * This function takes the result of a {@link ng.IDirectiveFactory} and injects the required mechanisms.
 * @param result The original result of the {@link ng.IDirectiveFactory}
 * @return {ng.IDirective | ng.IDirectiveLinkFn}
 */
function directiveFactoryResultTransformation(result: ng.IDirective | ng.IDirectiveLinkFn): ng.IDirective | ng.IDirectiveLinkFn {
    if (typeof result === 'function') {
        // When its just a plain link function there's nothing to do
        return result;
    }

    let compileFn: IDirectiveCompileFn;
    if (result.compile) {
        compileFn = wrap(result.compile, {
            transformResult: (compileResult: IDirectiveLinkFn | IDirectivePrePost) => {
                const runHooks = () => Hooks.runPreInterceptions(result);
                if (typeof compileResult === 'function') {
                    return {
                        pre: runHooks,
                        post: compileResult
                    };
                } else if (compileResult) {
                    const pre = compileResult.pre ? wrap(compileResult.pre, {
                        transformArguments: (fnArguments: any) => {
                            runHooks();
                            return fnArguments;
                        }
                    }) : runHooks;
                    return {...compileResult, pre};
                } else {
                    return {pre: runHooks};
                }
            }
        });
    } else {
        const linkFn = result.link as IDirectiveLinkFn;
        compileFn = () => ({
            pre: () => {
                Hooks.runPreInterceptions(result);
            },
            post: linkFn
        });
        delete result.link;
    }

    result.compile = compileFn;

    return result;
}

