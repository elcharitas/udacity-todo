import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const AwsClient = new XAWS.S3({ signatureVersion: 'v4' })

export const getUploadURL = (todoId: string) => {
  return AwsClient.getSignedUrl('putObject', {
    Bucket: process.env.ATTACHMENT_S3_BUCKET,
    Key: todoId,
    Expires: Number(process.env.SIGNED_URL_EXPIRATION)
  })
}
