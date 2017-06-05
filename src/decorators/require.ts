import 'reflect-metadata';

const REQUIRE_KEY = "deco-ng:require";

export function Require(...directiveNames: string[]) {
    return Reflect.metadata(REQUIRE_KEY, directiveNames);
}

export function getRequiredDirectives(inst: any, property: string): string[] {
    return Reflect.getMetadata(REQUIRE_KEY, inst, property);
}
