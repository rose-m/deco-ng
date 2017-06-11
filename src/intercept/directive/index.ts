import * as angular from 'angular';
import {IDirective, IDirectiveCompileFn, IDirectiveFactory, IDirectiveLinkFn, IDirectivePrePost, IModule, Injectable} from 'angular';
import {wrap} from '../utils';
import hooks from './hooks';

export {hooks};

/**
 * Modifies the given `ngModule` to intercept the directive function.
 */
export function directiveWrapper(ngModule: IModule) {
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
    const directiveName = directiveArguments[0] as string;
    const fnOrInjectables = directiveArguments[1] as Injectable<IDirectiveFactory>;

    let factoryFn: IDirectiveFactory;
    if (typeof fnOrInjectables === 'function') {
        factoryFn = fnOrInjectables;
    } else {
        factoryFn = fnOrInjectables[fnOrInjectables.length - 1] as IDirectiveFactory;
    }

    const newFactoryFn = wrap(factoryFn, {
        transformResult: (fnResult) => directiveFactoryResultTransformation(directiveName, fnResult)
    });

    if (typeof fnOrInjectables === 'function') {
        angular.injector().annotate(factoryFn);
        const injectables = factoryFn.$inject as Array<string | IDirectiveFactory>;
        injectables.push(newFactoryFn);
        directiveArguments[1] = injectables;
    } else {
        fnOrInjectables[fnOrInjectables.length - 1] = newFactoryFn;
    }

    return directiveArguments;
}

/**
 * This function takes the result of a {@link IDirectiveFactory} and injects the required mechanisms.
 * @param directiveName The name of the directive
 * @param result The original result of the {@link IDirectiveFactory}
 * @return {IDirective | IDirectiveLinkFn}
 */
function directiveFactoryResultTransformation(directiveName: string, result: IDirective | IDirectiveLinkFn): IDirective | IDirectiveLinkFn {
    if (typeof result === 'function') {
        // When its just a plain link function there's nothing to do
        return result;
    }

    const runPreHooks: IDirectiveLinkFn = (scope, element, attrs, controller?) => hooks.runPreInterceptions(result, scope, element, attrs, controller);

    let compileFn: IDirectiveCompileFn;
    if (result.compile) {
        compileFn = wrap(result.compile, {
            transformResult: (compileResult: IDirectiveLinkFn | IDirectivePrePost) => {
                if (typeof compileResult === 'function') {
                    return {
                        pre: runPreHooks,
                        post: compileResult
                    };
                } else if (compileResult) {
                    const pre = compileResult.pre ? wrap(compileResult.pre, {
                        transformArguments: function (fnArguments: any[]) {
                            runPreHooks.apply(this, fnArguments);
                            return fnArguments;
                        }
                    }) : runPreHooks;
                    return {...compileResult, pre};
                } else {
                    return {pre: runPreHooks};
                }
            }
        });
    } else {
        const linkFn = result.link as IDirectiveLinkFn;
        compileFn = () => ({
            pre: runPreHooks,
            post: linkFn
        });
        delete result.link;
    }

    result.compile = compileFn;

    hooks.runDirectiveResultInterceptions(directiveName, result);

    return result;
}

