import {
  camelCase,
  capitalize,
  decapitalize,
  OasObject,
  OasVoid,
  toMethodVerb,
  type GenerateContextType,
  type OasOperation
} from '@skmtc/core'
import { List, TsSnippet, toPathTemplate, type ListObject } from '@skmtc/lang-typescript'
import { TsProjection } from '@skmtc/gen-typescript'

type ClientMethodArgs = {
  context: GenerateContextType
  operation: OasOperation
  destinationPath: string
}

/**
 * One `YouTubeClient` method per operation:
 *
 *   async getYoutubeV3LiveChatMessagesApi({ params: { liveChatId, part } }: GetYoutubeV3LiveChatMessagesApiArgs): Promise<LiveChatMessageListResponse>
 *
 * The name is the published SDK's convention (verb + path + `Api`), kept so
 * callers don't break. Path and query parameters arrive under `params`, the
 * request body under `body`; both types, and the response, are gen-typescript
 * definitions named from the method.
 */
export class ClientMethod extends TsSnippet {
  operation: OasOperation
  name: string
  argsName: string
  responseName: string
  paramNames: ListObject<string>
  queryNames: ListObject<string>
  hasBody: boolean
  baseUrl: string

  constructor({ context, operation, destinationPath }: ClientMethodArgs) {
    super({ context })

    this.operation = operation

    this.name = decapitalize(
      `${toMethodVerb(operation.method)}${camelCase(operation.path, { upperFirst: true })}Api`
    )

    const params = operation.toParametersObject(['path', 'query'])

    this.paramNames = List.toObject(Object.keys(params.properties ?? {}))
    this.queryNames = List.toObject(operation.toParams(['query']).map(({ name }) => name))

    const body = operation.toRequestBody(({ schema }) => schema)

    this.hasBody = body !== undefined

    const paramsArg = OasObject.empty().addProperty({ name: 'params', schema: params, required: true })
    const args = body ? paramsArg.addProperty({ name: 'body', schema: body, required: true }) : paramsArg

    this.argsName = context.insertNormalizedModel(TsProjection, {
      schema: args,
      fallbackName: capitalize(`${this.name}Args`),
      destinationPath
    }).identifier.name

    this.responseName = context.insertNormalizedModel(TsProjection, {
      schema: operation.toSuccessResponse()?.resolve().toSchema() ?? OasVoid.empty(),
      fallbackName: capitalize(`${this.name}Response`),
      destinationPath
    }).identifier.name

    const serverUrl = context.document.type === 'oas' ? context.document.value.servers?.[0]?.url : undefined

    if (!serverUrl) {
      throw new Error(`${operation.method} ${operation.path}: the document declares no server URL`)
    }

    // The spec's server ends in `/` and every path starts with one.
    this.baseUrl = serverUrl.replace(/\/+$/, '')
  }

  override toString(): string {
    const destructured = this.hasBody ? `body, params: ${this.paramNames}` : `params: ${this.paramNames}`
    const bodyField = this.hasBody ? `\n      body: JSON.stringify(body)` : ''

    return `  async ${this.name}({ ${destructured} }: ${this.argsName}): Promise<${this.responseName}> {
    const url = \`${this.baseUrl}${toPathTemplate(this.operation.path)}\${this.toQuery(${this.queryNames})}\`

    return this.makeRequest<${this.responseName}>(url, {
      method: '${this.operation.method.toUpperCase()}',${bodyField}
    })
  }
`
  }
}
