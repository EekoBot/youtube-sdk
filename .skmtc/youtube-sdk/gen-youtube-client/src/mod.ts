import { toOasOperationEntry, type Method } from '@skmtc/core'
import { createClass, defineAndRegister } from '@skmtc/lang-typescript'
import { ClientMethod } from './ClientMethod.ts'
import { YouTubeClientClass } from './YouTubeClientClass.ts'
import { toEnrichmentSchema, type EnrichmentSchema } from './enrichments.ts'
import denoJson from '../deno.json' with { type: 'json' }

/** Every operation becomes a method on one class in one file. */
const exportPath = '@/YouTubeClient.generated.ts'

/** The verbs `SdkClientBase.makeRequest` sends; the spec uses no others. */
const supportedMethods: readonly Method[] = ['get', 'post', 'put', 'patch', 'delete']

// Accumulator: the first operation defines the class, every operation
// appends its method to it.
export const youTubeClientEntry = toOasOperationEntry<EnrichmentSchema>({
  id: denoJson.name,

  toEnrichmentSchema,

  isSupported({ operation }) {
    return supportedMethods.includes(operation.method)
  },

  transform: ({ context, operation }) => {
    const existing = context.findDefinition({ name: 'YouTubeClient', exportPath })

    const client =
      existing?.value instanceof YouTubeClientClass
        ? existing.value
        : defineAndRegister(context, {
            identifier: createClass('YouTubeClient'),
            value: new YouTubeClientClass({ context, destinationPath: exportPath }),
            destinationPath: exportPath
          }).value

    client.add(new ClientMethod({ context, operation, destinationPath: exportPath }))
  }
})
