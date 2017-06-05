import {wrap} from './utils';
import directiveWrapper from './directive';

const angular: ng.IAngularStatic = (window as any).angular;

export function registerInterceptors(): void {
    (angular as any).module = wrap(angular.module, {
        transformResult: directiveWrapper
    });
}
