import type { AwsLambda } from '../../external/types/awslambda.js'
import { isDirectAccess } from '../../external/utils/isDirectAccess.js'
import { respond } from '../../external/utils/respond.js'
import { runStream } from '../../external/utils/runStream.js'

declare const awslambda: AwsLambda

export const handler = awslambda.streamifyResponse(
  async (
    {
      requestContext: {
        http: { method, sourceIp },
        domainName
      },
      headers,
      rawPath,
      rawQueryString,
      isBase64Encoded,
      body
    },
    responseStream
  ) => {
    if (isDirectAccess({ headers, responseStream, awslambda })) {
      return
    }

    const response = await respond({
      domain: domainName,
      pathname: rawPath,
      queryString: rawQueryString,
      method,
      body,
      headers,
      sourceIp,
      isBase64Encoded
    })

    // TODO: If the response header is too long, a 502 error will occur on Gateway, so delete it.
    response.headers.delete('link')

    return runStream({
      response,
      responseStream,
      awslambda
    })
  }
)