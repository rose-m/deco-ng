export interface IWrapCallbacks<T, R> {
    transformArguments?(fnArguments: any[]): any[];

    transformResult?(fnResult: T, fnArguments: any[]): R;
}

export interface ICallableWithResult<T> {
    (...args: any[]): T
}

export function wrap<T, R>(fn: ICallableWithResult<T>, callbacks: IWrapCallbacks<T, R>): ICallableWithResult<T | R> {
    return function () {
        let args = arguments;
        if (callbacks.transformArguments) {
            args = callbacks.transformArguments.call(this, arguments);
        }

        const result = fn.apply(this, args) as T;
        if (callbacks.transformResult) {
            return callbacks.transformResult.call(this, result, arguments) as R;
        } else {
            return result;
        }
    }
}
