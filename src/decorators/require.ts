import 'reflect-metadata';
import {directives} from '../intercept';
import {IAttributes, IAugmentedJQuery, IController, IControllerConstructor, IDirective, IScope} from 'angular';
import {wrap} from '../intercept/utils';

const REQUIRE_KEY = 'deco-ng:require';
directives.hooks.register({
    interceptDirectiveResult: handleRequireInjection,
    interceptPre: extractAndSetControllers
});

interface IAnnotatedDirective extends IDirective {
    $decoDescriptors?: IRequireDescriptor[];
}

/**
 * Annotate a class member of your directive controller with this decorator in order to have it automatically set to the controller
 * of the required `directiveName`. Use the same syntax as inside {@link IDirective#require}.
 *
 * The pre-link and post-link functions will then be called with an array containing all controllers. The *last* element of the array
 * will be your own directive controller. The required controllers will be set before any of those methods are called.
 *
 * Important: You *cannot* use the {@link IDirective#require} field - it must be left unset.
 *
 * @param directiveName Directive to require
 */
export function Require(directiveName: string): any {
    return wrap(Reflect.metadata(REQUIRE_KEY, directiveName), {
        transformArguments: function ([target, property]) {
            const requiredProperties = target[REQUIRE_KEY] as string[] || [];
            requiredProperties.push(property);
            target[REQUIRE_KEY] = requiredProperties;
            return [target, property];
        }
    });
}

function getRequiredDirectives(inst: any, property: string): string {
    return Reflect.getMetadata(REQUIRE_KEY, inst, property);
}

function handleRequireInjection(directiveName: string, directive: IAnnotatedDirective): void {
    if (!directive.controller || typeof directive.controller === 'string') {
        // no controller
        return;
    }

    const ctrl: any = Array.isArray(directive.controller) ? directive.controller[directive.controller.length - 1] : directive.controller;
    const decoratedRequires = getAllRequiredDirectives(ctrl);
    if (!decoratedRequires.length) {
        return;
    }

    if (typeof directive.require === 'string' || (Array.isArray(directive.require) && directive.require.length)) {
        throw new Error('directive already uses require property');
    }

    directive.require = decoratedRequires.map(({directiveName}) => directiveName);
    directive.require.push(directiveName);
    directive.$decoDescriptors = decoratedRequires;
}

function extractAndSetControllers(directive: IAnnotatedDirective, scope: IScope, element: IAugmentedJQuery, attrs: IAttributes,
                                  controller?: IController | IController[] | { [key: string]: IController }) {
    if (!Array.isArray(controller) || !directive.$decoDescriptors) {
        return;
    }

    const ctrl = controller[controller.length - 1] as any;
    directive.$decoDescriptors.forEach((d, i) => {
        ctrl[d.propertyName] = controller[i];
    });
}

function getAllRequiredDirectives(ctrl: IControllerConstructor): IRequireDescriptor[] {
    const proto = ctrl.prototype;
    if (!proto[REQUIRE_KEY]) {
        return [];
    }

    const directives: IRequireDescriptor[] = [];
    for (const propertyName of proto[REQUIRE_KEY]) {
        const prop = proto[propertyName] as any;
        if (typeof prop === 'function') {
            continue;
        }
        const directiveName = getRequiredDirectives(proto, propertyName);
        if (!directiveName) {
            continue;
        }
        directives.push({propertyName, directiveName});
    }
    return directives;
}

interface IRequireDescriptor {
    propertyName: string;
    directiveName: string;
}
