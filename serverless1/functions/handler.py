import json


def public(event, context):
    body = {
        "message": "public body",
        "input": event
    }

    response = {
        "statusCode": 200,
        "body": json.dumps(body),
        "headers": {
            "Access-Control-Allow-Origin":"*"
        }
    }

    return response

    # Use this code if you don't use the http event with the LAMBDA-PROXY
    # integration
    """
    return {
        "message": "Go Serverless v1.0! Your function executed successfully!",
        "event": event
    }
    """

def private(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": True
    }

    response = {
        "statusCode": 200,
        "body": "private body",
        "headers": {
            "Access-Control-Allow-Origin":"*"
        },
        "isBase64Encoded": False,
    }


    return response

class TestError(Exception):
    pass
def has_error(event, context):

    raise TestError('this is the TestError message')

    response = {
        "statusCode": 200,
        "body": "error raised",
        "headers": {
            "Access-Control-Allow-Origin":"*"
        },
        "isBase64Encoded": False,
    }
    return response
