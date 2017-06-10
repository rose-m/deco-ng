import {IDirective} from 'angular';

export interface IDirectiveHook {
    interceptPre?(directive: IDirective): IDirective;
}


export interface IDirectiveHookRegistry {
    register(hook: IDirectiveHook): void;

    runPreInterceptions(directive: IDirective): void;
}

class DirectiveHookRegistry implements IDirectiveHookRegistry {
    private hooks: IDirectiveHook[] = [];

    constructor() {
    }

    register(hook: IDirectiveHook): void {
        this.hooks.push(hook);
    }

    runPreInterceptions(directive: IDirective): void {
        this.hooks.forEach(h => h.interceptPre && h.interceptPre(directive));
    }
}

const registry: IDirectiveHookRegistry = new DirectiveHookRegistry();
export default registry;
