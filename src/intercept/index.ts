import * as angular from 'angular';
import {wrap} from './utils';
import directiveWrapper from './directive/index';

export function registerInterceptors(): void {
    (angular as any).module = wrap(angular.module, {
        transformResult: directiveWrapper
    });
}
