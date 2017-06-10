import {IAttributes, IAugmentedJQuery, IDirective, IDirectiveLinkFn, IScope} from 'angular';

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
     * @see IDirectiveLinkFn
     */
    interceptPre?(directive: IDirective, scope: IScope, element: IAugmentedJQuery, attrs: IAttributes): void;
}


export interface IDirectiveHookRegistry {
    register(hook: IDirectiveHook): void;

    runDirectiveResultInterceptions(name: string, directive: IDirective): void;

    runPreInterceptions(directive: IDirective, scope: IScope, element: IAugmentedJQuery, attrs: IAttributes): void;
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

    runPreInterceptions(directive: IDirective, scope: IScope, element: IAugmentedJQuery, attrs: IAttributes): void {
        this.hooks.forEach(h => h.interceptPre && h.interceptPre(directive, scope, element, attrs));
    }
}

const registry: IDirectiveHookRegistry = new DirectiveHookRegistry();
export default registry;
