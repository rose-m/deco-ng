export interface IWrapCallbacks {
    transformArguments?(fnArguments: any[]): any[];

    transformResult?(fnResult: any, fnArguments: any[]): any;
}

export function wrap(fn: Function, callbacks: IWrapCallbacks): Function {
    return function () {
        let args = arguments;
        if (callbacks.transformArguments) {
            args = callbacks.transformArguments.call(this, arguments);
        }

        const result = fn.apply(this, args);
        if (callbacks.transformResult) {
            return callbacks.transformResult.call(this, result, arguments);
        } else {
            return result;
        }
    }
}
