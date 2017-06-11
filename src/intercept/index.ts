import {wrap} from './utils';
import * as directives from './directive/index';
import {IAngularStatic} from 'angular';

export {directives}

export function setupInterceptors(): void {
    const angular = (window as any).angular as IAngularStatic;
    angular.module = wrap(angular.module, {
        transformResult: directives.directiveWrapper
    });
}
