import boto3
import json

def getImage(event, context):
    s3_client = boto3.client('s3')
    s3_resource = boto3.resource('s3')

    bucket = s3_resource.Bucket('ptrtestbucket')
    image = bucket.Object('ptr-mock-test/star.jpg')

    url = s3_client.generate_presigned_url(
        ClientMethod='get_object',
        Params={
            'Bucket': 'ptrtestbucket',
            'Key': 'ptr-mock-images/star.jpg'
        },
        ExpiresIn=604800
    )

    response = json.dumps({
        "image_url": url
    })

    http_resp = {
        "statusCode": 200,
        "body": response,
        "headers": { "Access-Control-Allow-Origin": "*" },
        "isBase64Encoded": False,
    }

    return http_resp