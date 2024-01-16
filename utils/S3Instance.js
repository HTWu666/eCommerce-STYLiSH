import { S3Client } from "@aws-sdk/client-s3"

const bucketRegion = process.env.AWS_S3_BUCKET_REGION
const accessKey = process.env.AWS_S3_ACCESS_KEY
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion
})

export default s3