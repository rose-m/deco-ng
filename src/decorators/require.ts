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

export function getRequiredDirectives(inst: any, property: string): string {
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

    if (directive.require) {
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
        console.log(`setting controller ${d.directiveName} -> ${d.propertyName}`);
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
