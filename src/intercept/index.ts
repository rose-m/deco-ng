import * as angular from 'angular';
import {wrap} from './utils';
import * as directives from './directive/index';

export {directives}

export function inject(): void {
    (angular as any).module = wrap(angular.module, {
        transformResult: directives.directiveWrapper
    });
}
