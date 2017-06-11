import {IAttributes, IAugmentedJQuery, IController, IDirective, IDirectiveLinkFn, IScope} from 'angular';

export interface IDirectiveHook {
    /**
     * Will be called with the directive definition object returned by the original directive factory before being processed further
     * by AngularJS.
     * @param name The name of the directive
     * @param directive The directive definition object
     */
    interceptDirectiveResult?(name: string, directive: IDirective): void

    /**
     * Will be called with the current directive definition object before the original pre-link function.
     * @param directive The directive definition object
     * @param scope
     * @param element
     * @param attrs
     * @param controller
     * @see IDirectiveLinkFn
     */
    interceptPre?(directive: IDirective, scope: IScope, element: IAugmentedJQuery, attrs: IAttributes,
                  controller?: IController | IController[] | {[key: string]: IController}): void;
}


export interface IDirectiveHookRegistry {
    register(hook: IDirectiveHook): void;

    runDirectiveResultInterceptions(name: string, directive: IDirective): void;

    runPreInterceptions(directive: IDirective, scope: IScope, element: IAugmentedJQuery, attrs: IAttributes,
                        controller?: IController | IController[] | {[key: string]: IController}): void;
}

class DirectiveHookRegistry implements IDirectiveHookRegistry {
    private hooks: IDirectiveHook[] = [];

    constructor() {
    }

    register(hook: IDirectiveHook): void {
        this.hooks.push(hook);
    }

    runDirectiveResultInterceptions(name: string, directive: IDirective): void {
        this.hooks.forEach(h => h.interceptDirectiveResult && h.interceptDirectiveResult(name, directive))
    }

    runPreInterceptions(directive: IDirective, scope: IScope, element: IAugmentedJQuery, attrs: IAttributes,
                        controller?: IController | IController[] | {[key: string]: IController}): void {
        this.hooks.forEach(h => h.interceptPre && h.interceptPre(directive, scope, element, attrs, controller));
    }
}

const registry: IDirectiveHookRegistry = new DirectiveHookRegistry();
export default registry;
