import type { GenerateContextType } from '@skmtc/core'
import { List, TsSnippet, type ListLines } from '@skmtc/lang-typescript'
import type { ClientMethod } from './ClientMethod.ts'

type YouTubeClientClassArgs = {
  context: GenerateContextType
  destinationPath: string
}

/**
 * The body of `class YouTubeClient`: heritage plus one method per operation.
 * Auth, token refresh, query encoding and the request itself live in the
 * hand-written `SdkClientBase`; the generated methods only route to it.
 */
export class YouTubeClientClass extends TsSnippet {
  methods: ListLines<ClientMethod>

  constructor({ context, destinationPath }: YouTubeClientClassArgs) {
    super({ context })

    this.methods = List.toLines([])

    this.register({
      imports: { '@/SdkClientBase.ts': ['SdkClientBase'] },
      destinationPath
    })
  }

  add(method: ClientMethod) {
    this.methods.values.push(method)
  }

  override toString(): string {
    return `extends SdkClientBase {
${this.methods}
}`
  }
}
