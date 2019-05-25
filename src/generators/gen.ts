import { JSONSchema7 } from 'json-schema'
import javascript from './javascript'
import { parse, Schema } from './ast'
import { Options as JavaScriptOptions } from './javascript'

export enum Language {
	JAVASCRIPT = 'javascript',
	TYPESCRIPT = 'typescript',
}

// Options that all clients must support.
export interface DefaultOptions {
	name: Language
	// Whether or not to generate a development bundle. If so, analytics payloads will
	// be validated against the full JSON Schema before being sent to the underlying
	// analytics instance.
	isDevelopment: boolean
}

export type Options = JavaScriptOptions

export interface File {
	path: string
	contents: string
}

export interface GenerationConfig {
	tracks: {
		raw: JSONSchema7
		schema: Schema
	}[]
	options: Options
	typewriterVersion: string
}

export default async function gen(rawSchemas: JSONSchema7[], options: Options): Promise<File[]> {
	const config = {
		tracks: rawSchemas.map(s => {
			const sanitizedSchema = {
				...s,
				$schema: 'http://json-schema.org/draft-07/schema#',
			}

			return {
				raw: sanitizedSchema,
				schema: parse(sanitizedSchema),
			}
		}),
		options,
		// TODO: fetch from package.json
		typewriterVersion: '7.0.0',
	}

	if (options.name === Language.TYPESCRIPT || options.name === Language.JAVASCRIPT) {
		return await javascript(config)
	} else {
		throw new Error('Invalid language')
	}
}
