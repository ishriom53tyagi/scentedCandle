import { OpenAPIParameter, OpenAPIParameterLocation, OpenAPIParameterStyle, Referenced } from '../../types';
import { RedocNormalizedOptions } from '../RedocNormalizedOptions';
import { OpenAPIParser } from '../OpenAPIParser';
import { SchemaModel } from './Schema';
import { ExampleModel } from './Example';
/**
 * Field or Parameter model ready to be used by components
 */
export declare class FieldModel {
    expanded: boolean | undefined;
    schema: SchemaModel;
    name: string;
    required: boolean;
    description: string;
    example?: string;
    examples?: Record<string, ExampleModel>;
    deprecated: boolean;
    in?: OpenAPIParameterLocation;
    kind: string;
    extensions?: Record<string, any>;
    explode: boolean;
    style?: OpenAPIParameterStyle;
    serializationMime?: string;
    constructor(parser: OpenAPIParser, infoOrRef: Referenced<OpenAPIParameter> & {
        name?: string;
        kind?: string;
    }, pointer: string, options: RedocNormalizedOptions);
    toggle(): void;
}
